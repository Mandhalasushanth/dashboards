import { ApiError } from '@/core/api';
import { SERVICE_KINDS, STATUS_META, type CaseStatus, type ServiceKind } from '@/modules/workflow';
import { ENTITY_TYPE_LABELS, type Customer, type CustomerApplication, type CustomerEntityType } from '../shared/customers.types';

type Raw = Record<string, unknown>;

const isObject = (value: unknown): value is Raw => typeof value === 'object' && value !== null;
const text = (value: unknown): string => (typeof value === 'string' ? value : '');
const count = (value: unknown): number => (typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0);

const isService = (value: unknown): value is ServiceKind => SERVICE_KINDS.includes(value as ServiceKind);
const isStatus = (value: unknown): value is CaseStatus => typeof value === 'string' && value in STATUS_META;
const isEntityType = (value: unknown): value is CustomerEntityType => typeof value === 'string' && value in ENTITY_TYPE_LABELS;

/** Drops applications with an unknown service or status instead of rendering values the UI cannot label. */
function parseApplication(value: unknown): CustomerApplication | null {
  if (!isObject(value) || !isService(value.service) || !isStatus(value.status) || !text(value.caseId)) {
    return null;
  }
  return {
    caseId: text(value.caseId),
    referenceNumber: text(value.referenceNumber) || text(value.caseId),
    service: value.service,
    serviceType: text(value.serviceType),
    status: value.status,
    submittedAt: text(value.submittedAt),
    updatedAt: text(value.updatedAt)
  };
}

function parseCustomer(value: unknown): Customer | null {
  if (!isObject(value) || !text(value.pan) || !text(value.name)) {
    return null;
  }
  const applications = Array.isArray(value.applications)
    ? value.applications.map(parseApplication).filter((entry): entry is CustomerApplication => entry !== null)
    : [];
  return {
    id: text(value.id) || text(value.pan),
    name: text(value.name),
    pan: text(value.pan),
    email: text(value.email),
    mobile: text(value.mobile),
    city: text(value.city),
    entityType: isEntityType(value.entityType) ? value.entityType : 'OTHER',
    applications,
    openCount: count(value.openCount),
    completedCount: count(value.completedCount),
    firstSeenAt: text(value.firstSeenAt),
    lastActivityAt: text(value.lastActivityAt)
  };
}

/** Accepts a plain list or `{ items }`; anything else is an invalid response. */
export function parseCustomerList(payload: unknown): Customer[] {
  const list = Array.isArray(payload) ? payload : isObject(payload) && Array.isArray(payload.items) ? payload.items : null;
  if (!list) {
    throw new ApiError('INVALID_RESPONSE', 'The server returned an invalid customer list.');
  }
  return list.map(parseCustomer).filter((entry): entry is Customer => entry !== null);
}
