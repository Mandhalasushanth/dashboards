import type { PushRecipient } from './pushNotification.types';

/** The customer fields every source shares (admin customer list, workflow case client). */
interface CustomerLike {
  readonly name: string;
  readonly email: string;
  readonly mobile: string;
  readonly pan: string;
}

interface CaseLike {
  readonly referenceNumber: string;
  readonly client: CustomerLike;
}

const recipientId = (customer: CustomerLike) =>
  (customer.pan || customer.email || customer.mobile).trim().toUpperCase();

const byName = (a: PushRecipient, b: PushRecipient) => a.name.localeCompare(b.name);

/** Admin: one recipient per customer in the customer directory. */
export function recipientsFromCustomers(
  customers: readonly (CustomerLike & { readonly applications: readonly { readonly referenceNumber: string }[] })[]
): PushRecipient[] {
  return customers
    .filter((customer) => recipientId(customer))
    .map((customer) => ({
      id: recipientId(customer),
      name: customer.name,
      email: customer.email,
      mobile: customer.mobile,
      references: customer.applications.map((application) => application.referenceNumber)
    }))
    .sort(byName);
}

/** Manager: the customers on the team's applications, one entry per customer with all their references. */
export function recipientsFromCases(cases: readonly CaseLike[]): PushRecipient[] {
  const grouped = cases
    .filter((entry) => recipientId(entry.client))
    .reduce<Map<string, PushRecipient>>((map, entry) => {
      const id = recipientId(entry.client);
      const existing = map.get(id);
      return map.set(id, {
        id,
        name: entry.client.name,
        email: entry.client.email,
        mobile: entry.client.mobile,
        references: existing ? [...existing.references, entry.referenceNumber] : [entry.referenceNumber]
      });
    }, new Map());
  return [...grouped.values()].sort(byName);
}
