import type { MessagingPresentation } from '@/modules/admin';

/** The fields a contact rule needs; matches the participant records the server and demo store hold. */
export interface MessagingParty {
  readonly id: string;
  readonly role: string;
  readonly managerId: string | null;
}

/**
 * Who a Loan Manager may message: the administrator, the loan agents who report to them, and fellow loan
 * managers. Never the other team. The server enforces the same rule on every request.
 */
export const canLoanManagerMessage = (me: MessagingParty, other: MessagingParty): boolean =>
  other.role === 'ADMIN' ||
  (other.role === 'LOAN_AGENT' && other.managerId === me.id) ||
  other.role === 'LOAN_MANAGER';

/** Role tabs and copy for the Loan Manager's Communication page. */
export const LOAN_MANAGER_MESSAGING: MessagingPresentation = Object.freeze({
  filters: ['ALL', 'LOAN_AGENT', 'CUSTOMER', 'ADMIN'] as const,
  allLabel: 'All contacts',
  placeholderText: 'Choose one of your loan agents, a customer or the administrator to view messages and coordinate work.',
  emptyGroupText: 'No one in this group yet.'
});
