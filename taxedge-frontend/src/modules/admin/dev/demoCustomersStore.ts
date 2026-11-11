import { CLOSED_STATUSES, workflowApi, type WorkflowCase } from '@/modules/workflow';
import { ENTITY_TYPE_LABELS, entityTypeFromPan, type Customer, type CustomerEntityType } from '../shared/customers.types';

/**
 * DEVELOPMENT ONLY. Builds the customer directory from the workflow applications. Applications from the
 * backend carry the customer's own profile (customer.* details), so one person is one row even when their
 * applications are for different businesses or GSTINs; the application's PAN is only the fallback.
 * Loaded through a dynamic import guarded by `import.meta.env.DEV`.
 */
const ALL_CASES_PAGE = 1000;

const latest = (a: string, b: string) => (Date.parse(a) > Date.parse(b) ? a : b);
const earliest = (a: string, b: string) => (Date.parse(a) < Date.parse(b) ? a : b);

const profile = (item: WorkflowCase, key: string): string => item.details[`customer.${key}`]?.trim() ?? '';

/**
 * The same person across applications: their email (every backend record has it, while some service forms
 * do not carry the full profile), else their customer id, else the application's PAN.
 */
const customerKey = (item: WorkflowCase): string =>
  (profile(item, 'email') || item.client.email).toLowerCase() || profile(item, 'customerId') || profile(item, 'pan') || item.client.pan;

/** The profile's customer type ("Individual") when given, otherwise read from the PAN. */
function entityTypeOf(item: WorkflowCase, pan: string): CustomerEntityType {
  const label = profile(item, 'customerType').toLowerCase();
  const known = (Object.entries(ENTITY_TYPE_LABELS) as [CustomerEntityType, string][]).find(
    ([code, text]) => code.toLowerCase() === label || text.toLowerCase() === label
  );
  return known?.[0] ?? entityTypeFromPan(pan);
}

function toCustomer(cases: readonly WorkflowCase[]): Customer {
  const byNewest = [...cases].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  // The newest application that carries the customer's full profile, so a form without one never hides it.
  const newest = byNewest.find((item) => profile(item, 'customerId')) ?? byNewest[0];
  const pan = profile(newest, 'pan') || newest.client.pan;
  return {
    id: profile(newest, 'customerId') || customerKey(newest),
    name: profile(newest, 'name') || newest.client.name,
    pan,
    email: profile(newest, 'email') || newest.client.email,
    mobile: profile(newest, 'mobileNumber') || newest.client.mobile,
    city: profile(newest, 'city') || newest.client.city,
    entityType: entityTypeOf(newest, pan),
    applications: cases.map((item) => ({
      caseId: item.id,
      referenceNumber: item.referenceNumber,
      service: item.service,
      serviceType: item.serviceType,
      status: item.status,
      submittedAt: item.submittedAt,
      updatedAt: item.updatedAt
    })),
    openCount: cases.filter((item) => !CLOSED_STATUSES.includes(item.status)).length,
    completedCount: cases.filter((item) => item.status === 'COMPLETED').length,
    firstSeenAt: cases.map((item) => item.submittedAt).reduce(earliest),
    lastActivityAt: cases.map((item) => item.updatedAt).reduce(latest)
  };
}

export const demoCustomersStore = Object.freeze({
  async list(): Promise<Customer[]> {
    const { items } = await workflowApi.listCases({ pageSize: ALL_CASES_PAGE });
    const byCustomer = items.reduce<Map<string, WorkflowCase[]>>((groups, item) => {
      const key = customerKey(item);
      return groups.set(key, [...(groups.get(key) ?? []), item]);
    }, new Map());
    return [...byCustomer.values()].map(toCustomer);
  }
});
