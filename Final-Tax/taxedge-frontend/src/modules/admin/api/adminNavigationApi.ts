import { API_ENDPOINTS, apiClient } from '@/core/api';
import { environment } from '@/core/config/environment';
import { fetchWorkflowSummary, onWorkflowChanged } from '@/modules/workflow';
import type { AdminNavCounters } from '../shared/adminNavigation';
import { parseAdminNavCounters } from '../validation/adminCountersSchema';

/**
 * Counts always come from the server. In demo mode there is no backend, so the notifications and
 * communication badges come from the dev-only stores and the applications badge from the workflow summary.
 */
async function requestCounters(): Promise<AdminNavCounters> {
  if (import.meta.env.DEV && environment.demoAuthEnabled) {
    const [{ demoNotificationsStore }, summary] = await Promise.all([import('../dev/demoNotificationsStore'), fetchWorkflowSummary()]);
    return parseAdminNavCounters({
      notifications: demoNotificationsStore.unreadCount(),
      communication: 0, // the chat backend keeps no unread counts
      applications: summary.unassigned
    });
  }
  return parseAdminNavCounters(await apiClient.get<unknown>(API_ENDPOINTS.admin.navigationCounters));
}

let inFlight: Promise<AdminNavCounters> | null = null;

/** The sidebar and header ask at the same time; concurrent callers share one request. */
export function fetchAdminNavCounters(): Promise<AdminNavCounters> {
  inFlight ??= requestCounters().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

const invalidationListeners = new Set<() => void>();

/** Subscribes to "counts may have changed" events (e.g. after reading notifications). */
export function onAdminNavCountersInvalidated(listener: () => void): () => void {
  invalidationListeners.add(listener);
  return () => {
    invalidationListeners.delete(listener);
  };
}

export function invalidateAdminNavCounters(): void {
  invalidationListeners.forEach((listener) => listener());
}

// Assigning, cancelling or recording an application changes the applications badge.
onWorkflowChanged(invalidateAdminNavCounters);
