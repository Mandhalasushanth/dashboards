import type { CSSProperties } from 'react';
import { Icon } from '@/shared';
import { STATUS_META } from '../../shared/workflowStatuses';
import type { CaseStatus, WorkflowCase } from '../../shared/workflow.types';
import './CaseProgress.css';

interface Journey {
  readonly steps: readonly string[];
  /** Index of the step being worked on now; steps.length means every step is done. */
  readonly current: (item: WorkflowCase) => number;
}

/** Where a rejected or cancelled case stopped, from how far it had got. */
const stoppedAt = (item: WorkflowCase) => (item.assignment.agentId ? 3 : item.payment.state === 'PAID' ? 2 : item.payment.state === 'PENDING' ? 1 : 0);

const FULL_STEP: Readonly<Record<CaseStatus, (item: WorkflowCase) => number>> = Object.freeze({
  SUBMITTED: () => 0,
  CORRECTION_NEEDED: () => 0,
  PAYMENT_PENDING: () => 1,
  PAID: () => 2,
  ASSIGNED: () => 3,
  DOCS_MISSING: () => 3,
  PORTAL_WORK: () => 4,
  COMPLETED: () => 6,
  REJECTED: stoppedAt,
  CANCELLED: stoppedAt
});

/** Managers and admins follow the whole journey, from verification to the delivered result. */
const FULL_JOURNEY: Journey = Object.freeze({
  steps: Object.freeze(['Verify', 'Payment', 'Assign Agent', 'Agent Checks', 'Portal Work', 'Completed']),
  current: (item: WorkflowCase) => FULL_STEP[item.status](item)
});

const AGENT_STEP: Readonly<Partial<Record<CaseStatus, (item: WorkflowCase) => number>>> = Object.freeze({
  ASSIGNED: (item: WorkflowCase) => (item.documentsDownloadedAt ? 2 : 0),
  DOCS_MISSING: () => 0,
  PORTAL_WORK: () => 2,
  COMPLETED: () => 4
});

/** The agent's own part: from receiving the case to submitting the result. */
const AGENT_JOURNEY: Journey = Object.freeze({
  steps: Object.freeze(['Check Documents', 'Download', 'Portal Work', 'Submit Result']),
  current: (item: WorkflowCase) => AGENT_STEP[item.status]?.(item) ?? 0
});

const STOPPED: ReadonlySet<CaseStatus> = new Set<CaseStatus>(['REJECTED', 'CANCELLED']);
const ATTENTION: ReadonlySet<CaseStatus> = new Set<CaseStatus>(['CORRECTION_NEEDED', 'PAYMENT_PENDING', 'DOCS_MISSING']);

export interface CaseProgressProps {
  readonly item: WorkflowCase;
  /** Agents see only their own steps; everyone else sees the full journey. */
  readonly agentView?: boolean;
}

/** Horizontal status tracker: done steps are checked; a note appears only when the case is waiting or stopped. */
export function CaseProgress({ item, agentView = false }: CaseProgressProps) {
  const journey = agentView ? AGENT_JOURNEY : FULL_JOURNEY;
  const active = journey.current(item);
  const stopped = STOPPED.has(item.status);
  const attention = ATTENTION.has(item.status);

  const stateOf = (index: number) => {
    if (index < active) return 'done';
    if (index === active) return stopped ? 'stopped' : attention ? 'attention' : 'current';
    return 'pending';
  };

  return (
    <ol className="tx-case-progress" style={{ '--tx-progress-steps': journey.steps.length } as CSSProperties} aria-label={`Progress: ${STATUS_META[item.status].label}`}>
      {journey.steps.map((label, index) => {
        const state = stateOf(index);
        return (
          <li key={label} className={`tx-case-progress__step tx-case-progress__step--${state}`} aria-current={state !== 'done' && state !== 'pending' ? 'step' : undefined}>
            <span className="tx-case-progress__marker" aria-hidden="true">
              {state === 'done' ? <Icon name="check" size="sm" /> : state === 'stopped' ? <Icon name="x" size="sm" /> : index + 1}
            </span>
            <span className="tx-case-progress__label">{label}</span>
            {index === active && (stopped || attention) ? <span className="tx-case-progress__now">{STATUS_META[item.status].label}</span> : null}
          </li>
        );
      })}
    </ol>
  );
}
