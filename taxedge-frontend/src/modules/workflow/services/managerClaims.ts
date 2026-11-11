import type { CasePriority, WorkflowCase } from '../shared/workflow.types';

const PRIORITY_VALUES: readonly string[] = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];

/**
 * Which manager has taken each application. The only source is the bucket the server holds
 * (GET /api/v1/bucket/manager/...), kept in memory for the open page; nothing is saved in the browser. Until the
 * server has answered, no application counts as taken.
 */
export interface ManagerClaim {
  readonly managerId: string;
  readonly managerName: string;
  /** ISO timestamp the server recorded when the application was added to the manager's bucket. */
  readonly takenAt: string;
  readonly priority?: string | null;
  readonly notes?: string | null;
  readonly assignedAgentId?: string | null;
  readonly updatedAt?: string | null;
}

export type ClaimMap = Readonly<Record<string, ManagerClaim>>;

let serverClaims: ClaimMap = {};

export function setServerClaims(claims: ClaimMap): void {
  serverClaims = claims;
}

/** The bucket row behind a case, when the server holds one. */
const serverItems = new Map<string, string>();

export function setServerClaimItems(items: ReadonlyMap<string, string>): void {
  serverItems.clear();
  items.forEach((itemId, caseId) => serverItems.set(caseId, itemId));
}

export const serverItemOf = (caseId: string): string | undefined => serverItems.get(caseId);

/** The case with its taker, when it has been taken, in `assignment` (next to the assigned agent). */
export function withClaim(item: WorkflowCase, claims: ClaimMap = serverClaims): WorkflowCase {
  const claim = claims[item.id];
  if (!claim) {
    return { ...item, assignment: { ...item.assignment, managerTakenAt: null } };
  }
  const priority = PRIORITY_VALUES.includes(claim.priority ?? '') ? (claim.priority as CasePriority) : undefined;
  // The note and priority belong to the assignment, so they only show once an agent has the application.
  const assigned = item.assignment.agentId !== null;
  return {
    ...item,
    assignment: {
      ...item.assignment,
      managerId: claim.managerId,
      managerName: claim.managerName,
      managerTakenAt: claim.takenAt,
      ...(assigned && priority ? { priority } : {}),
      ...(assigned && claim.notes ? { instructions: claim.notes, instructionsBy: claim.managerName, instructionsAt: claim.updatedAt ?? claim.takenAt } : {})
    }
  };
}

export const isTaken = (item: WorkflowCase): boolean => Boolean(item.assignment.managerTakenAt);
export const isTakenBy = (item: WorkflowCase, managerId: string | null): boolean => isTaken(item) && managerId !== null && item.assignment.managerId === managerId;
