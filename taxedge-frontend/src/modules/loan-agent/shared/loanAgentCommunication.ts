import type { MessagingPresentation } from '@/modules/admin';

/** The fields a contact rule needs; matches the participant records the server and demo store hold. */
export interface MessagingParty {
  readonly id: string;
  readonly role: string;
  readonly managerId: string | null;
}

/**
 * Who a Loan Agent may message: the administrator and the loan managers. Never the other team. The server
 * enforces the same rule on every request.
 */
export const canLoanAgentMessage = (_me: MessagingParty, other: MessagingParty): boolean =>
  other.role === 'ADMIN' || other.role === 'LOAN_MANAGER';

/** Role tabs and copy for the Loan Agent's Communication page. */
export const LOAN_AGENT_MESSAGING: MessagingPresentation = Object.freeze({
  filters: ['ALL', 'LOAN_MANAGER', 'ADMIN'] as const,
  allLabel: 'All contacts',
  placeholderText: 'Choose your loan manager or the administrator to ask about a case, a document or a deadline.',
  emptyGroupText: 'No one in this group yet.'
});
