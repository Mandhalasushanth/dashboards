import { API_ENDPOINTS, ApiError, apiClient } from '@/core/api';
import { environment } from '@/core/config/environment';
import { assignGstApplication, fetchAgentGstRegistrations, fetchGstRegistrations } from './backendApplications';
import { fetchAgentGstServices, fetchCaManagerGstServices } from './backendServiceLists';
import { logger } from '@/core/logging/logger';
import { authStore } from '@/store';
import { byPriority } from '../services/casePriority';
import { saveAssignmentDetails, syncBucket } from '../services/bucketSync';
import { isTakenBy, withClaim as withManagerClaim } from '../services/managerClaims';
import { emitWorkflowChanged } from './workflowEvents';
import type {
  AgentWorkload,
  AuditPage,
  AuditQuery,
  CaseIntakeInput,
  CaseMutation,
  CasePage,
  CaseQuery,
  CaseSummary,
  StaffOption,
  WorkflowCase,
  WorkflowNotification
} from '../shared/workflow.types';

const { workflow: ENDPOINTS } = API_ENDPOINTS;

/** The browser demo replaces the backend only on the Vite dev server with demo auth switched on. */
const useDemo = () => import.meta.env.DEV && environment.demoAuthEnabled;
const loadDemo = async () => {
  const store = await loadDemoStore();
  const firstLoad = importBackendApplications(store);
  // Nothing is kept in the browser, so the first request of a page load waits for the database once;
  // after that every request answers at once and the database is re-read in the background.
  if (!hasImported) await firstLoad;
  return store;
};

/**
 * Brings the GST registrations saved in the backend into the demo's application list. A failed fetch
 * (backend down, signed out) leaves the list as it was rather than breaking the page.
 */
type DemoStore = Awaited<ReturnType<typeof loadDemoStore>>;
const loadDemoStore = () => import('../dev/demoWorkflowStore').then((module) => module.demoWorkflowStore);

function importBackendApplications(store: DemoStore): Promise<void> {
  // Never makes a page wait: lists, overviews and "View" read what is already loaded, while the backend
  // (whose responses carry every uploaded file) is re-read at most once per interval in the background.
  // When it brings anything new, the open pages are told to refresh.
  if (pendingImport) return pendingImport;
  if (Date.now() - lastImportAt < IMPORT_INTERVAL_MS) return Promise.resolve();
  lastImportAt = Date.now();
  pendingImport = importForSignedInUser(store)
    .then((changed) => {
      if (changed) emitWorkflowChanged();
    })
    .catch(() => {
      // Keep showing what is already loaded; the next interval tries again.
    })
    .finally(() => {
      hasImported = true;
      pendingImport = null;
    });
  return pendingImport;
}

/** An agent saved in the backend gets their assigned list; everyone else gets every registration. */
/** True when the backend brought something new, so open pages should re-read their data. */
async function importForSignedInUser(store: DemoStore): Promise<boolean> {
  const agentId = await store.backendAgentId();
  if (agentId === null) {
    const [registrations, services] = await Promise.all([fetchGstRegistrations(), fetchCaManagerGstServices()]);
    const imported = await store.importApplications([...registrations, ...services]);
    // Who each application is assigned to needs every agent's lists too; reading them must not hold up the
    // first page, so it runs after it and the open pages refresh when it brings a change.
    void applyEveryAgentsAssignments(store)
      .then((assigned) => {
        if (assigned) emitWorkflowChanged();
      })
      .catch(() => {
        // The next background refresh tries again.
      });
    return imported;
  }
  const [registrations, services] = await Promise.all([fetchAgentGstRegistrations(agentId), fetchAgentGstServices(agentId)]);
  const assigned = [...registrations, ...services];
  const imported = await store.importApplications(assigned);
  const assignedNow = await store.applyBackendAssignments(assigned.map((item) => item.caseId ?? `GST-REG-${item.sourceId}`));
  return imported || assignedNow;
}

/**
 * The manager's lists carry no assigned agent, but each agent's own lists do, so the assignments saved in
 * the database are read per agent. Each agent's lists hold only their work, so this is never more than the
 * full lists already read.
 */
async function applyEveryAgentsAssignments(store: DemoStore): Promise<boolean> {
  const agents = await store.backendAgents();
  const results = await Promise.all(
    agents.map(async ({ backendId, staffId }) => {
      const [registrations, services] = await Promise.all([
        fetchAgentGstRegistrations(backendId).catch(() => []),
        fetchAgentGstServices(backendId)
      ]);
      const caseIds = [...registrations, ...services].map((item) => item.caseId ?? `GST-REG-${item.sourceId}`);
      return store.applyBackendAssignments(caseIds, staffId);
    })
  );
  return results.some(Boolean);
}

/** Backend agents appear in the staff list as "BE-AGT-<id>". */
const BACKEND_AGENT_PREFIX = 'BE-AGT-';

/** Assigning any backend GST application to a backend agent is saved in the database first, so the agent sees it. */
async function saveBackendAssignment(id: string, mutation: CaseMutation): Promise<void> {
  if (mutation.type !== 'ASSIGN' || !mutation.input.agentId.startsWith(BACKEND_AGENT_PREFIX)) return;
  await assignGstApplication(id, mutation.input.agentId.slice(BACKEND_AGENT_PREFIX.length));
}

/** Server cases plus who took them, and the priority and note chosen when assigning, from the bucket. */
const withClaim = (item: WorkflowCase): WorkflowCase => withManagerClaim(item);

/** Saves what the manager chose in the assign dialog on the application's bucket row. Never undoes the assignment. */
async function saveAssignmentChoices(id: string, mutation: CaseMutation): Promise<void> {
  if (mutation.type !== 'ASSIGN') return;
  try {
    await saveAssignmentDetails(id, mutation.input);
  } catch (error) {
    logger.warn('The assignment was saved, but its priority and note were not.', { error });
  }
}

const IMPORT_INTERVAL_MS = 30_000;
const MINE_FETCH_SIZE = 1000;
const currentManagerId = (): string | null => {
  const user = authStore.getState().user;
  return user ? String(user.id) : null;
};
let lastImportAt = 0;
let pendingImport: Promise<void> | null = null;
let hasImported = false;

const casePath = (id: string, suffix = '') => `${ENDPOINTS.cases}/${encodeURIComponent(id)}${suffix}`;

function toQueryString(params: Readonly<Record<string, unknown>>): string {
  const search = new URLSearchParams(
    Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== '' && value !== 'ALL' && value !== false)
      .map(([key, value]) => [key, Array.isArray(value) ? value.join(',') : String(value)])
  ).toString();
  return search ? `?${search}` : '';
}

function expectObject<T>(value: unknown, what: string): T {
  if (!value || typeof value !== 'object') {
    throw new ApiError('INVALID_RESPONSE', `The server returned an invalid ${what}.`);
  }
  return value as T;
}

function expectArray<T>(value: unknown, what: string): T[] {
  if (!Array.isArray(value)) {
    throw new ApiError('INVALID_RESPONSE', `The server returned an invalid ${what} list.`);
  }
  return value as T[];
}

/** HTTP route for each mutation type; every body carries the version it was based on. */
function sendMutation(id: string, expectedVersion: number, mutation: CaseMutation): Promise<unknown> {
  switch (mutation.type) {
    case 'ASSIGN':
      return apiClient.post(casePath(id, '/assignment'), { expectedVersion, ...mutation.input });
    case 'TRANSITION':
      return apiClient.post(casePath(id, '/transitions'), { expectedVersion, ...mutation.input });
    case 'DOCUMENTS_DOWNLOADED':
      return apiClient.post(casePath(id, '/documents/downloaded'), { expectedVersion });
    case 'REMOVE_OUTPUT':
      return apiClient.delete(casePath(id, `/outputs/${encodeURIComponent(mutation.outputId)}?expectedVersion=${expectedVersion}`));
    case 'NOTE':
      return apiClient.post(casePath(id, '/notes'), { expectedVersion, text: mutation.text });
    case 'DOCUMENT_REVIEW':
      return apiClient.post(casePath(id, `/documents/${encodeURIComponent(mutation.documentId)}/review`), {
        expectedVersion,
        decision: mutation.decision,
        reason: mutation.reason
      });
  }
}

/**
 * Single gateway to the workflow backend. Scope (team, assignment) and every rule are enforced by the
 * server from the session; the frontend never sends role or actor ids it could forge.
 */
export const workflowApi = Object.freeze({
  async listCases(query: CaseQuery): Promise<CasePage> {
    // "My Applications" and the priority order are applied here (the server knows neither claims nor
    // priorities), so those queries read every page first.
    const { claim, ...serverQuery } = query;
    const byUrgency = query.sort === 'priority';
    const wide = claim || byUrgency ? { ...serverQuery, page: 1, pageSize: MINE_FETCH_SIZE } : serverQuery;
    const page = useDemo()
      ? await (await loadDemo()).listCases(wide)
      : expectObject<CasePage>(await apiClient.get<unknown>(`${ENDPOINTS.cases}${toQueryString({ ...wide })}`), 'case page');
    await syncBucket();
    const items = page.items.map((item) => withClaim(item));
    if (!claim && !byUrgency) return { ...page, items };
    const wanted = (claim ? items.filter((item) => isTakenBy(item, currentManagerId())) : items).slice();
    if (byUrgency) wanted.sort(byPriority); // stable: the server's due-date order holds within a priority
    const size = query.pageSize ?? wanted.length;
    const from = ((query.page ?? 1) - 1) * size;
    return { items: wanted.slice(from, from + size), total: wanted.length, page: query.page ?? 1, pageSize: size };
  },

  async getCase(id: string): Promise<WorkflowCase> {
    const found = useDemo()
      ? await (await loadDemo()).getCase(id)
      : expectObject<WorkflowCase>(await apiClient.get<unknown>(casePath(id)), 'application');
    await syncBucket();
    return withClaim(found);
  },

  async summary(): Promise<CaseSummary> {
    if (useDemo()) return (await loadDemo()).summary();
    return expectObject<CaseSummary>(await apiClient.get<unknown>(ENDPOINTS.summary), 'summary');
  },

  async submitCase(input: CaseIntakeInput): Promise<WorkflowCase> {
    if (useDemo()) return (await loadDemo()).submitCase(input);
    return expectObject<WorkflowCase>(await apiClient.post<unknown>(ENDPOINTS.cases, input), 'application');
  },

  async mutate(id: string, expectedVersion: number, mutation: CaseMutation): Promise<WorkflowCase> {
    if (useDemo()) {
      const store = await loadDemo();
      await saveBackendAssignment(id, mutation);
      const updated = await store.mutate(id, expectedVersion, mutation);
      await saveAssignmentChoices(id, mutation);
      return withClaim(updated);
    }
    const saved = expectObject<WorkflowCase>(await sendMutation(id, expectedVersion, mutation), 'application');
    await saveAssignmentChoices(id, mutation);
    return withClaim(saved);
  },

  async uploadDocument(id: string, expectedVersion: number, documentId: string, file: File): Promise<WorkflowCase> {
    if (useDemo()) return (await loadDemo()).uploadDocument(id, expectedVersion, documentId, file);
    const form = new FormData();
    form.append('file', file);
    form.append('expectedVersion', String(expectedVersion));
    return expectObject<WorkflowCase>(
      await apiClient.upload<unknown>(casePath(id, `/documents/${encodeURIComponent(documentId)}`), form),
      'application'
    );
  },

  async uploadOutput(id: string, expectedVersion: number, file: File): Promise<WorkflowCase> {
    if (useDemo()) return (await loadDemo()).uploadOutput(id, expectedVersion, file);
    const form = new FormData();
    form.append('file', file);
    form.append('expectedVersion', String(expectedVersion));
    return expectObject<WorkflowCase>(await apiClient.upload<unknown>(casePath(id, '/outputs'), form), 'application');
  },

  async listAgents(): Promise<StaffOption[]> {
    if (useDemo()) return (await loadDemo()).listAgents();
    return expectArray<StaffOption>(await apiClient.get<unknown>(ENDPOINTS.agents), 'agent');
  },

  async workload(): Promise<AgentWorkload[]> {
    if (useDemo()) return (await loadDemo()).workload();
    return expectArray<AgentWorkload>(await apiClient.get<unknown>(ENDPOINTS.workload), 'workload');
  },

  async auditLog(query: AuditQuery): Promise<AuditPage> {
    if (useDemo()) return (await loadDemo()).auditLog(query);
    return expectObject<AuditPage>(await apiClient.get<unknown>(`${ENDPOINTS.audit}${toQueryString({ ...query })}`), 'audit page');
  },

  async notifications(): Promise<WorkflowNotification[]> {
    if (useDemo()) return (await loadDemo()).notifications();
    return expectArray<WorkflowNotification>(await apiClient.get<unknown>(ENDPOINTS.notifications), 'notification');
  },

  async markNotificationRead(id: string): Promise<void> {
    if (useDemo()) return (await loadDemo()).markNotificationRead(id);
    await apiClient.patch(`${ENDPOINTS.notifications}/${encodeURIComponent(id)}/read`);
  },

  async markAllNotificationsRead(): Promise<void> {
    if (useDemo()) return (await loadDemo()).markAllNotificationsRead();
    await apiClient.post(ENDPOINTS.notificationsReadAll);
  }
});
