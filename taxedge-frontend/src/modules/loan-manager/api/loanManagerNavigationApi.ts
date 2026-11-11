import { onWorkflowChanged } from '@/modules/workflow';
import type { LoanManagerNavCounters } from '../shared/loanManager.types';
import { loanManagerApi } from './loanManagerApi';
import { loanManagerMessagingApi } from './loanManagerCommunicationApi';

/** Badge counts are derived from the same server summary the dashboard and queues use. */
async function requestCounters(): Promise<LoanManagerNavCounters> {
  const [summary, unread, contacts] = await Promise.all([loanManagerApi.summary(), loanManagerApi.unreadNotifications(), loanManagerMessagingApi.fetchContacts()]);
  return {
    communication: contacts.reduce((total, contact) => total + contact.unreadCount, 0),
    submitted: summary.submitted,
    readyToAssign: summary.readyToAssign,
    docsMissing: summary.docsMissing,
    notifications: unread
  };
}

let inFlight: Promise<LoanManagerNavCounters> | null = null;

/** The sidebar and header ask at the same time; concurrent callers share one request. */
export function fetchLoanManagerNavCounters(): Promise<LoanManagerNavCounters> {
  inFlight ??= requestCounters().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

const invalidationListeners = new Set<() => void>();

/** Subscribes to "counts may have changed" events. */
export function onLoanManagerNavCountersInvalidated(listener: () => void): () => void {
  invalidationListeners.add(listener);
  return () => {
    invalidationListeners.delete(listener);
  };
}

export function invalidateLoanManagerNavCounters(): void {
  invalidationListeners.forEach((listener) => listener());
}

// Any verification, payment, assignment or delivery can change a badge.
onWorkflowChanged(invalidateLoanManagerNavCounters);
