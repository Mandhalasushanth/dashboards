import type { CasePriority, WorkflowCase } from '../shared/workflow.types';

/** The priorities the bucket endpoint accepts (BucketPriority), lowest first. */
export const PRIORITIES: readonly { readonly value: CasePriority; readonly label: string }[] = Object.freeze([
  { value: 'LOW', label: 'Low' },
  { value: 'NORMAL', label: 'Normal' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' }
]);

export const DEFAULT_PRIORITY: CasePriority = 'NORMAL';

const RANK: Readonly<Record<CasePriority, number>> = Object.freeze({ URGENT: 0, HIGH: 1, NORMAL: 2, LOW: 3 });

/** Urgent first, then High, Normal, Low; applications with no priority count as Normal. Keeps the incoming order within a priority. */
export const byPriority = (a: WorkflowCase, b: WorkflowCase): number =>
  RANK[a.assignment.priority ?? DEFAULT_PRIORITY] - RANK[b.assignment.priority ?? DEFAULT_PRIORITY];
