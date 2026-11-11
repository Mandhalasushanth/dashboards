import { addToBucket, canUseBucket, fetchBucketClaims, removeFromBucket, updateBucketItem } from '../api/bucketApi';
import { loadChatCredentials } from '@/modules/authentication';
import { emitWorkflowChanged } from '../api/workflowEvents';
import type { AssignInput, WorkflowCase } from '../shared/workflow.types';
import { serverItemOf, setServerClaimItems, setServerClaims, type ManagerClaim } from './managerClaims';

/** Keeps "taken by" in step with the bucket the server holds, asking it at most once every few seconds. */
const REFRESH_INTERVAL_MS = 5_000;
let lastRefreshAt = 0;
let pending: Promise<void> | null = null;
let lastSnapshot = '';

async function load(): Promise<void> {
  try {
    const claims = await fetchBucketClaims();
    const map: Record<string, ManagerClaim> = {};
    const items = new Map<string, string>();
    claims.forEach((claim) => {
      map[claim.caseId] = {
        managerId: claim.managerId,
        managerName: claim.managerName,
        takenAt: claim.takenAt,
        priority: claim.priority,
        notes: claim.notes,
        assignedAgentId: claim.assignedAgentId,
        updatedAt: claim.updatedAt
      };
      items.set(claim.caseId, claim.itemId);
    });
    setServerClaims(map);
    setServerClaimItems(items);
    const snapshot = JSON.stringify(map);
    if (snapshot !== lastSnapshot) {
      lastSnapshot = snapshot;
      emitWorkflowChanged();
    }
  } catch {
    // Keep what is already known; the next refresh tries again.
  }
}

/** Reads the bucket from the server (real sign-ins only). Never throws and never holds a page up for long. */
export function syncBucket(force = false): Promise<void> {
  if (!canUseBucket()) {
    // Signed out (or a demo sign-in): forget whatever the previous user's bucket said.
    setServerClaims({});
    setServerClaimItems(new Map());
    return Promise.resolve();
  }
  if (pending) return pending;
  if (!force && Date.now() - lastRefreshAt < REFRESH_INTERVAL_MS) return Promise.resolve();
  lastRefreshAt = Date.now();
  pending = load().finally(() => {
    pending = null;
  });
  return pending;
}

/**
 * "Take application": saves it in the manager's bucket through POST /api/v1/bucket/add, then reads the bucket back
 * from the server to confirm it was saved. Taking over one another manager holds first removes their bucket row.
 * Throws (with a message to show) when the server refuses or the row is not found afterwards.
 */
export async function takeApplication(item: WorkflowCase): Promise<void> {
  if (!canUseBucket()) throw new Error('Sign in with your manager account to take applications.');
  const previous = serverItemOf(item.id);
  if (previous) await removeFromBucket(previous);
  const saved = await addToBucket(item.id);
  if (!saved) throw new Error('This application is not stored on the server, so it cannot be taken.');
  await syncBucket(true);
  if (!serverItemOf(item.id)) throw new Error('The server did not confirm the application was taken. Try again.');
}

/** The bin button: DELETE /api/v1/bucket/{id} takes the application back out of the manager's cart, then re-reads the bucket. */
export async function releaseApplication(item: WorkflowCase): Promise<void> {
  const itemId = serverItemOf(item.id);
  if (!itemId) return;
  await removeFromBucket(itemId);
  await syncBucket(true);
  if (serverItemOf(item.id)) throw new Error('The server did not remove the application. Try again.');
}

/**
 * After the agent is assigned (PUT /api/v1/ca-manager/assign), saves the priority, note and due date on the
 * application's bucket row (PUT /api/v1/bucket/{id}), adding the row first when the manager had not taken it.
 * The assignment itself is already saved by then, so a failure here is reported but does not undo it.
 */
export async function saveAssignmentDetails(caseId: string, input: AssignInput): Promise<void> {
  if (!canUseBucket()) return;
  await syncBucket();
  if (!serverItemOf(caseId)) {
    // Only a manager has a bucket; an administrator reassigning an application nobody took leaves the row out.
    if (!loadChatCredentials()?.role.endsWith('_MANAGER')) return;
    if (!(await addToBucket(caseId))) return;
    await syncBucket(true);
  }
  const itemId = serverItemOf(caseId);
  if (!itemId) return;
  await updateBucketItem(itemId, {
    ...(input.priority ? { priority: input.priority } : {}),
    notes: input.instructions,
    ...(input.dueDate ? { dueDate: input.dueDate.slice(0, 10) } : {}),
    ...(/^BE-AGT-\d+$/.test(input.agentId) ? { agentId: Number(input.agentId.slice('BE-AGT-'.length)) } : {})
  });
  await syncBucket(true);
}
