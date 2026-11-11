import { onWorkflowChanged } from '@/modules/workflow';
import type { CaManagerNavCounters } from '../shared/caManager.types';
import { caManagerApi } from './caManagerApi';
import { caManagerMessagingApi } from './caManagerCommunicationApi';

/** Badge counts are derived from the same server summary the dashboard and queues use. */
async function requestCounters(): Promise<CaManagerNavCounters> {
  const [summary, unread, contacts] = await Promise.all([caManagerApi.summary(), caManagerApi.unreadNotifications(), caManagerMessagingApi.fetchContacts()]);
  return {
    communication: contacts.reduce((total, contact) => total + contact.unreadCount, 0),
    submitted: summary.submitted,
    readyToAssign: summary.readyToAssign,
    docsMissing: summary.docsMissing,
    notifications: unread
  };
}

let inFlight: Promise<CaManagerNavCounters> | null = null;

/** The sidebar and header ask at the same time; concurrent callers share one request. */
export function fetchCaManagerNavCounters(): Promise<CaManagerNavCounters> {
  inFlight ??= requestCounters().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

const invalidationListeners = new Set<() => void>();

/** Subscribes to "counts may have changed" events. */
export function onCaManagerNavCountersInvalidated(listener: () => void): () => void {
  invalidationListeners.add(listener);
  return () => {
    invalidationListeners.delete(listener);
  };
}

export function invalidateCaManagerNavCounters(): void {
  invalidationListeners.forEach((listener) => listener());
}

// Any verification, payment, assignment or delivery can change a badge.
onWorkflowChanged(invalidateCaManagerNavCounters);
