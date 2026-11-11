import { onWorkflowChanged } from '@/modules/workflow';
import type { CaAgentNavCounters } from '../shared/caAgent.types';
import { caAgentApi } from './caAgentApi';
import { caAgentMessagingApi } from './caAgentCommunicationApi';

/** Badge counts are derived from the same server summary the dashboard and queues use. */
async function requestCounters(): Promise<CaAgentNavCounters> {
  const [summary, unread, contacts] = await Promise.all([caAgentApi.summary(), caAgentApi.unreadNotifications(), caAgentMessagingApi.fetchContacts()]);
  return {
    communication: contacts.reduce((total, contact) => total + contact.unreadCount, 0),
    assigned: summary.assigned,
    portalWork: summary.portalWork,
    notifications: unread
  };
}

let inFlight: Promise<CaAgentNavCounters> | null = null;

/** The sidebar and header ask at the same time; concurrent callers share one request. */
export function fetchCaAgentNavCounters(): Promise<CaAgentNavCounters> {
  inFlight ??= requestCounters().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

const invalidationListeners = new Set<() => void>();

/** Subscribes to "counts may have changed" events. */
export function onCaAgentNavCountersInvalidated(listener: () => void): () => void {
  invalidationListeners.add(listener);
  return () => {
    invalidationListeners.delete(listener);
  };
}

export function invalidateCaAgentNavCounters(): void {
  invalidationListeners.forEach((listener) => listener());
}

// Any verification, payment, assignment or delivery can change a badge.
onWorkflowChanged(invalidateCaAgentNavCounters);
