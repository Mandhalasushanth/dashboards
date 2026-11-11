import { onWorkflowChanged } from '@/modules/workflow';
import type { LoanAgentNavCounters } from '../shared/loanAgent.types';
import { loanAgentApi } from './loanAgentApi';
import { loanAgentMessagingApi } from './loanAgentCommunicationApi';

/** Badge counts are derived from the same server summary the dashboard and queues use. */
async function requestCounters(): Promise<LoanAgentNavCounters> {
  const [summary, unread, contacts] = await Promise.all([loanAgentApi.summary(), loanAgentApi.unreadNotifications(), loanAgentMessagingApi.fetchContacts()]);
  return {
    communication: contacts.reduce((total, contact) => total + contact.unreadCount, 0),
    assigned: summary.assigned,
    portalWork: summary.portalWork,
    notifications: unread
  };
}

let inFlight: Promise<LoanAgentNavCounters> | null = null;

/** The sidebar and header ask at the same time; concurrent callers share one request. */
export function fetchLoanAgentNavCounters(): Promise<LoanAgentNavCounters> {
  inFlight ??= requestCounters().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

const invalidationListeners = new Set<() => void>();

/** Subscribes to "counts may have changed" events. */
export function onLoanAgentNavCountersInvalidated(listener: () => void): () => void {
  invalidationListeners.add(listener);
  return () => {
    invalidationListeners.delete(listener);
  };
}

export function invalidateLoanAgentNavCounters(): void {
  invalidationListeners.forEach((listener) => listener());
}

// Any verification, payment, assignment or delivery can change a badge.
onWorkflowChanged(invalidateLoanAgentNavCounters);
