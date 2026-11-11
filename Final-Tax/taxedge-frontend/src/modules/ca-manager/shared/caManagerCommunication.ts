import type { MessagingPresentation } from '@/modules/admin';

/** The fields a contact rule needs; matches the participant records the server and demo store hold. */
export interface MessagingParty {
  readonly id: string;
  readonly role: string;
  readonly managerId: string | null;
}

/**
 * Who a CA Manager may message: the administrator, the CA agents who report to them, and fellow CA
 * managers. Never the other team. The server enforces the same rule on every request.
 */
export const canCaManagerMessage = (me: MessagingParty, other: MessagingParty): boolean =>
  other.role === 'ADMIN' ||
  (other.role === 'CA_AGENT' && other.managerId === me.id) ||
  other.role === 'CA_MANAGER';

/** Role tabs and copy for the CA Manager's Communication page. */
export const CA_MANAGER_MESSAGING: MessagingPresentation = Object.freeze({
  filters: ['ALL', 'CA_AGENT', 'CUSTOMER', 'ADMIN'] as const,
  allLabel: 'All contacts',
  placeholderText: 'Choose one of your CA agents, a customer or the administrator to view messages and coordinate work.',
  emptyGroupText: 'No one in this group yet.'
});
