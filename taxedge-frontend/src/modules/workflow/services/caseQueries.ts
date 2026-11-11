import { getServiceType } from '../shared/serviceTypes';
import { SERVICE_KINDS } from '../shared/workflowServices';
import { ASSIGNMENT_TARGET_HOURS, CLOSED_STATUSES, DEFAULT_PAGE_SIZE, DUE_SOON_DAYS, STATUS_META } from '../shared/workflowStatuses';
import type {
  AgentWorkload,
  CasePage,
  CaseQuery,
  CaseSummary,
  ServiceKind,
  SortKey,
  StaffOption,
  WorkflowCase
} from '../shared/workflow.types';

const DAY_MS = 86_400_000;

export function isClosed(item: WorkflowCase): boolean {
  return CLOSED_STATUSES.includes(item.status);
}

export function isOverdue(item: WorkflowCase, now: number = Date.now()): boolean {
  return !isClosed(item) && item.dueDate !== null && Date.parse(item.dueDate) < now;
}

export function isDueSoon(item: WorkflowCase, now: number = Date.now()): boolean {
  if (isClosed(item) || item.dueDate === null) {
    return false;
  }
  const due = Date.parse(item.dueDate);
  return due >= now && due - now <= DUE_SOON_DAYS * DAY_MS;
}

function matchesSearch(item: WorkflowCase, search: string): boolean {
  const query = search.trim().toLowerCase();
  if (!query) {
    return true;
  }
  return [item.referenceNumber, item.client.name, item.client.pan, item.client.mobile, item.assignment.agentName ?? '', getServiceType(item.serviceType, item.service).label]
    .some((value) => value.toLowerCase().includes(query));
}

export function matchesQuery(item: WorkflowCase, query: CaseQuery, now: number = Date.now()): boolean {
  const checks: readonly boolean[] = [
    !query.statuses?.length || query.statuses.includes(item.status),
    !query.services?.length || query.services.includes(item.service),
    !query.serviceTypes?.length || query.serviceTypes.includes(item.serviceType),
    !query.agentId || query.agentId === 'ALL' || item.assignment.agentId === query.agentId,
    !query.unassignedOnly || item.assignment.agentId === null,
    !query.overdueOnly || isOverdue(item, now),
    matchesSearch(item, query.search ?? '')
  ];
  return checks.every(Boolean);
}

/** Equal times keep one fixed order (by application id), so a list never reshuffles between refreshes. */
const byId = (a: WorkflowCase, b: WorkflowCase) => a.referenceNumber.localeCompare(b.referenceNumber);

const dueTime = (item: WorkflowCase) => (item.dueDate ? Date.parse(item.dueDate) : Number.MAX_SAFE_INTEGER);

const byDueThenSubmitted = (a: WorkflowCase, b: WorkflowCase) =>
  dueTime(a) - dueTime(b) || Date.parse(a.submittedAt) - Date.parse(b.submittedAt) || byId(a, b);

const SORTERS: Readonly<Record<SortKey, (a: WorkflowCase, b: WorkflowCase) => number>> = Object.freeze({
  updatedAt: (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt) || byId(a, b),
  // Newest submission first: the order applications reached the database, latest at the top.
  submittedAt: (a, b) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt) || byId(a, b),
  // Earliest due date first, applications without one last; ties go to the oldest submission, so the order is stable.
  dueDate: (a, b) => byDueThenSubmitted(a, b),
  // The server does not know priorities, so it sends this order and the priority is applied on top of it.
  priority: (a, b) => byDueThenSubmitted(a, b)
});

/** Filter → sort → paginate. The same contract the backend list endpoint implements. */
export function queryCases(items: readonly WorkflowCase[], query: CaseQuery, now: number = Date.now()): CasePage {
  const pageSize = Math.max(1, query.pageSize ?? DEFAULT_PAGE_SIZE);
  const matched = items.filter((item) => matchesQuery(item, query, now)).sort(SORTERS[query.sort ?? 'submittedAt']);
  const lastPage = Math.max(1, Math.ceil(matched.length / pageSize));
  const page = Math.min(Math.max(1, query.page ?? 1), lastPage);
  return { items: matched.slice((page - 1) * pageSize, page * pageSize), total: matched.length, page, pageSize };
}

const EMPTY_BY_SERVICE = (): Record<ServiceKind, number> =>
  SERVICE_KINDS.reduce((acc, kind) => ({ ...acc, [kind]: 0 }), {} as Record<ServiceKind, number>);

export function summarizeCases(items: readonly WorkflowCase[], now: number = Date.now()): CaseSummary {
  const count = (predicate: (item: WorkflowCase) => boolean) => items.filter(predicate).length;
  const inBucket = (bucket: string) => count((item) => STATUS_META[item.status].bucket === bucket);
  return {
    total: items.length,
    submitted: inBucket('submitted'),
    correctionNeeded: inBucket('correctionNeeded'),
    paymentPending: inBucket('paymentPending'),
    readyToAssign: inBucket('readyToAssign'),
    assigned: inBucket('assigned'),
    docsMissing: inBucket('docsMissing'),
    portalWork: inBucket('portalWork'),
    completed: inBucket('completed'),
    closed: inBucket('closed'),
    unassigned: count((item) => item.assignment.agentId === null && !isClosed(item)),
    overdue: count((item) => isOverdue(item, now)),
    dueSoon: count((item) => isDueSoon(item, now)),
    staleUnassigned: count((item) => hoursUnassigned(item, now) >= ASSIGNMENT_TARGET_HOURS),
    byService: items.reduce((acc, item) => ({ ...acc, [item.service]: acc[item.service] + 1 }), EMPTY_BY_SERVICE())
  };
}

/** Per-agent load so managers can compare before assigning. */
export function computeWorkload(agents: readonly StaffOption[], items: readonly WorkflowCase[], now: number = Date.now()): AgentWorkload[] {
  return agents.map((agent) => {
    const mine = items.filter((item) => item.assignment.agentId === agent.id);
    return {
      agent,
      activeCases: mine.filter((item) => !isClosed(item)).length,
      portalWork: mine.filter((item) => item.status === 'PORTAL_WORK').length,
      overdue: mine.filter((item) => isOverdue(item, now)).length,
      completed: mine.filter((item) => item.status === 'COMPLETED').length
    };
  });
}

/** Hours a paid case has waited for an agent, for "waiting too long for assignment" alerts. */
export function hoursUnassigned(item: WorkflowCase, now: number = Date.now()): number {
  return item.status === 'PAID' && item.payment.paidAt ? Math.floor((now - Date.parse(item.payment.paidAt)) / 3_600_000) : 0;
}
