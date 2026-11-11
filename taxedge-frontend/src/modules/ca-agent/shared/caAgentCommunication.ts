import type { MessagingPresentation } from '@/modules/admin';

/** The fields a contact rule needs; matches the participant records the server and demo store hold. */
export interface MessagingParty {
  readonly id: string;
  readonly role: string;
  readonly managerId: string | null;
}

/**
 * Who a CA Agent may message: the administrator and the CA managers. Never the other team. The server
 * enforces the same rule on every request.
 */
export const canCaAgentMessage = (_me: MessagingParty, other: MessagingParty): boolean =>
  other.role === 'ADMIN' || other.role === 'CA_MANAGER';

/** Role tabs and copy for the CA Agent's Communication page. */
export const CA_AGENT_MESSAGING: MessagingPresentation = Object.freeze({
  filters: ['ALL', 'CA_MANAGER', 'ADMIN'] as const,
  allLabel: 'All contacts',
  placeholderText: 'Choose your CA manager or the administrator to ask about a case, a document or a deadline.',
  emptyGroupText: 'No one in this group yet.'
});
