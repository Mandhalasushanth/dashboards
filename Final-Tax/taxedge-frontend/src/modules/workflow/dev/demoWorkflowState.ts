import { API_ENDPOINTS, ApiError, apiClient } from '@/core/api';
import type { StaffRole } from '@/modules/authentication/shared/types/role.types';
import { ROLE_DOMAIN } from '@/modules/admin/shared/staff.types';
import { authStore } from '@/store';
import { STATUS_META } from '../shared/workflowStatuses';
import { buildSeedCases, type DemoCaseSeed } from './demoWorkflowSeeds';
import type { StaffOption, WorkflowActor, WorkflowCase, WorkflowNotification } from '../shared/workflow.types';

/**
 * DEVELOPMENT ONLY. Persistence, staff directory and signed-in actor for the workflow demo backend.
 * Loaded only through the dev-guarded demo store; excluded from production builds.
 */
const STORAGE_KEY = 'taxedge.demo.workflow.v8';

/**
 * Applications come only from the backend database: the app keeps them in memory for the open page and
 * re-reads the database on every load, and nothing is saved in the browser. Unit tests still use storage,
 * since their fixtures reset state through it.
 */
const PERSIST_IN_BROWSER = import.meta.env.MODE === 'test';

// Copies saved by earlier versions would show applications the database no longer has; remove them.
if (!PERSIST_IN_BROWSER) {
  try {
    for (const key of Object.keys(window.localStorage)) {
      if (key.startsWith('taxedge.demo.workflow.')) window.localStorage.removeItem(key);
    }
  } catch {
    // Storage blocked: nothing was saved there either.
  }
}

export interface StoredNotification extends WorkflowNotification {
  readonly recipientId: string;
}

export interface DemoState {
  readonly cases: readonly WorkflowCase[];
  readonly notifications: readonly StoredNotification[];
}


export interface DirectoryEntry {
  readonly option: StaffOption;
  readonly username: string;
}

/** A manager or agent as GET /api/v1/admin/managers and /admin/agents return them. */
interface BackendStaff {
  readonly id: number;
  readonly fullName: string;
  readonly email: string;
  readonly role: StaffRole;
  readonly managerId?: number | null;
}

const BACKEND_STAFF_TTL_MS = 10_000;
let backendStaffAt = 0;
let backendStaffRefresh: Promise<DirectoryEntry[]> | null = null;
/** The last staff list read from the database, kept in memory for this page only. */
let lastBackendStaff: DirectoryEntry[] | null = null;

function cacheStaff(entries: DirectoryEntry[]): void {
  lastBackendStaff = entries;
}

try {
  window.sessionStorage.removeItem('taxedge.demo.backendStaff.v1');
} catch {
  // Storage blocked: nothing was saved there either.
}

const fromBackend = (member: BackendStaff, prefix: 'MGR' | 'AGT'): DirectoryEntry | null => {
  const team = ROLE_DOMAIN[member.role];
  if (!team || !member.email) return null;
  const email = member.email.toLowerCase();
  return {
    username: email,
    option: {
      id: `BE-${prefix}-${member.id}`,
      name: member.fullName,
      email,
      managerId: member.managerId == null ? null : `BE-MGR-${member.managerId}`,
      role: member.role,
      team,
      active: true
    }
  };
};

/**
 * The managers and agents saved in the backend, so the accounts the administrator created there can
 * sign in and receive work. Fetched at most every few seconds; an unreachable backend adds nobody.
 */
function loadBackendStaff(): Promise<DirectoryEntry[]> {
  if (!backendStaffRefresh && Date.now() - backendStaffAt > BACKEND_STAFF_TTL_MS) {
    backendStaffAt = Date.now();
    const list = (path: string) => apiClient.get<unknown>(path).then((value) => (Array.isArray(value) ? (value as BackendStaff[]) : []));
    backendStaffRefresh = Promise.all([list(API_ENDPOINTS.admin.managers), list(API_ENDPOINTS.admin.agents)])
      .then(([managers, agents]) => [...managers.map((m) => fromBackend(m, 'MGR')), ...agents.map((a) => fromBackend(a, 'AGT'))])
      .then((items) => {
        const entries = items.filter((item): item is DirectoryEntry => item !== null);
        cacheStaff(entries);
        return entries;
      })
      .catch(() => lastBackendStaff ?? [])
      .finally(() => {
        backendStaffRefresh = null;
      });
  }
  // A known list answers at once while the refresh runs; only the first load of a page waits for the database.
  return lastBackendStaff ? Promise.resolve(lastBackendStaff) : (backendStaffRefresh ?? Promise.resolve([]));
}

/**
 * Staff come from the backend and from the demo directory the admin manages in the browser, so accounts
 * created in either place can receive work. When both hold the same email, the backend account is used.
 */
export async function loadDirectory(): Promise<DirectoryEntry[]> {
  const { demoStaffStore } = await import('@/modules/admin/dev/demoStaffStore');
  const [managers, agents, backend] = await Promise.all([demoStaffStore.list('MANAGER'), demoStaffStore.list('AGENT'), loadBackendStaff()]);
  const fromBackendEmails = new Set(backend.map((entry) => entry.username));
  const local = [...managers, ...agents]
    .filter((member) => !fromBackendEmails.has(member.username.toLowerCase()))
    .map((member) => ({
      username: member.username,
      option: { id: member.id, name: member.fullName, email: member.username, managerId: member.managerId, role: member.role, team: ROLE_DOMAIN[member.role], active: member.active }
    }));
  return [...backend, ...local];
}

/** The server resolves the actor from the session cookie; the demo resolves it from the signed-in user. */
export function resolveActor(directory: readonly DirectoryEntry[]): WorkflowActor {
  const user = authStore.getState().user;
  if (!user) {
    throw new ApiError('UNAUTHENTICATED', 'Your session has expired. Please sign in again.', 401);
  }
  const member = directory.find((entry) => entry.username === user.username.toLowerCase())?.option;
  return { id: member?.id ?? `USR-${user.id}`, name: member?.name ?? user.displayName, role: user.role };
}

/** A stored case from an older demo version (unknown status, missing payment or files) would break the screens. */
const isCurrentCase = (value: unknown): boolean => {
  const item = value as Partial<WorkflowCase> | null;
  return Boolean(
    item &&
      typeof item.status === 'string' &&
      item.status in STATUS_META &&
      item.payment &&
      Array.isArray(item.documents) &&
      Array.isArray(item.outputs) &&
      Array.isArray(item.history) &&
      Array.isArray(item.notes)
  );
};

/** Returns the saved demo data, or null (so fresh sample data is loaded) when it is missing or outdated. */
function readState(): DemoState | null {
  if (!PERSIST_IN_BROWSER) return memoryState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as DemoState) : null;
    const valid = parsed !== null && Array.isArray(parsed.cases) && Array.isArray(parsed.notifications) && parsed.cases.every(isCurrentCase);
    return valid ? parsed : null;
  } catch {
    return null;
  }
}

function writeState(state: DemoState): void {
  if (!PERSIST_IN_BROWSER) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked: the change still applies for this page session.
  }
}

let memoryState: DemoState | null = null;

/** Storage is re-read on every request so changes made under another demo login are always visible. */
/**
 * Each role module ships sample cases for its own queues. Only the unit tests load them; the dashboard
 * itself starts with no applications.
 */
async function loadSeeds(): Promise<DemoCaseSeed[]> {
  const modules = await Promise.all([
    import('@/modules/ca-manager/dev/demoCaManagerSeeds').then((module) => module.CA_MANAGER_DEMO_SEEDS),
    import('@/modules/ca-agent/dev/demoCaAgentSeeds').then((module) => module.CA_AGENT_DEMO_SEEDS),
    import('@/modules/loan-manager/dev/demoLoanManagerSeeds').then((module) => module.LOAN_MANAGER_DEMO_SEEDS),
    import('@/modules/loan-agent/dev/demoLoanAgentSeeds').then((module) => module.LOAN_AGENT_DEMO_SEEDS)
  ]);
  return modules.flat();
}

/** A fresh system: every sample is a customer submission waiting for a manager, assigned to no one. */
const asFreshSubmission = ([service, serviceType, client, pan, city, , , daysAgo, dueIn, details]: DemoCaseSeed): DemoCaseSeed =>
  [service, serviceType, client, pan, city, 'SUBMITTED', null, daysAgo, dueIn, details];

export async function loadState(staff: readonly StaffOption[]): Promise<DemoState> {
  const stored = readState();
  if (stored) {
    return stored;
  }
  memoryState ??= saveState({
    cases: import.meta.env.MODE === 'test' ? buildSeedCases((await loadSeeds()).map(asFreshSubmission), staff) : [],
    notifications: []
  });
  return memoryState;
}

export function saveState(state: DemoState): DemoState {
  memoryState = state;
  writeState(state);
  return state;
}

