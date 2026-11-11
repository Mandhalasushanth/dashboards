import type { IconName } from '@/shared';
import type { CaseStatus, ServiceKind, SortKey, SummaryKey } from './workflow.types';

/** A configured work queue: one sidebar entry renders one preset; the server still scopes the data. */
export interface QueuePreset {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly statuses?: readonly CaseStatus[];
  /** Services this queue can show; also the options of the service filter. */
  readonly services: readonly ServiceKind[];
  readonly unassignedOnly?: boolean;
  readonly overdueOnly?: boolean;
  readonly sort?: SortKey;
  readonly kpis: readonly KpiDefinition[];
  readonly emptyTitle: string;
  readonly emptyMessage: string;
  /** Shows "Record Application" for assisted intake on a client's behalf. */
  readonly allowIntake?: boolean;
  /** Manager queues: a row offers "Take application" (then "View" once taken) instead of View. */
  readonly claiming?: boolean;
  /** "My Applications": lists only what the signed-in manager has taken. */
  readonly mineOnly?: boolean;
}

/** A KPI card: which summary count it shows and, when clicked, which statuses it filters the queue to. */
export interface KpiDefinition {
  readonly key: SummaryKey;
  readonly label: string;
  readonly iconName: IconName;
  readonly tone: 'default' | 'success' | 'danger' | 'orange';
  readonly filter?: { readonly statuses?: readonly CaseStatus[]; readonly unassignedOnly?: boolean; readonly overdueOnly?: boolean };
  /** Dashboard cards link to the queue that lists the counted cases. */
  readonly to?: string;
}

export const KPI_LIBRARY = Object.freeze({
  total: { key: 'total', label: 'All Applications', iconName: 'file-spreadsheet', tone: 'default' },
  submitted: { key: 'submitted', label: 'To Verify', iconName: 'inbox', tone: 'orange', filter: { statuses: ['SUBMITTED'] } },
  correctionNeeded: { key: 'correctionNeeded', label: 'Waiting on Customer', iconName: 'rotate-ccw', tone: 'default', filter: { statuses: ['CORRECTION_NEEDED'] } },
  paymentPending: { key: 'paymentPending', label: 'Awaiting Payment', iconName: 'credit-card', tone: 'orange', filter: { statuses: ['PAYMENT_PENDING'] } },
  readyToAssign: { key: 'readyToAssign', label: 'Ready to Assign', iconName: 'user-check', tone: 'orange', filter: { statuses: ['PAID'] } },
  assigned: { key: 'assigned', label: 'With Agent', iconName: 'briefcase', tone: 'default', filter: { statuses: ['ASSIGNED'] } },
  docsMissing: { key: 'docsMissing', label: 'Missing Documents', iconName: 'alert-triangle', tone: 'danger', filter: { statuses: ['DOCS_MISSING'] } },
  portalWork: { key: 'portalWork', label: 'Portal Work', iconName: 'globe', tone: 'default', filter: { statuses: ['PORTAL_WORK'] } },
  completed: { key: 'completed', label: 'Completed', iconName: 'circle-check', tone: 'success', filter: { statuses: ['COMPLETED'] } },
  closed: { key: 'closed', label: 'Rejected / Cancelled', iconName: 'x', tone: 'danger' },
  unassigned: { key: 'unassigned', label: 'Unassigned', iconName: 'user-check', tone: 'orange', filter: { unassignedOnly: true } },
  overdue: { key: 'overdue', label: 'Overdue', iconName: 'alert-triangle', tone: 'danger', filter: { overdueOnly: true } },
  dueSoon: { key: 'dueSoon', label: 'Due Soon', iconName: 'calendar', tone: 'orange' },
  staleUnassigned: { key: 'staleUnassigned', label: 'Paid, Not Assigned > 24h', iconName: 'clock', tone: 'danger', filter: { statuses: ['PAID'] } }
} satisfies Record<SummaryKey, KpiDefinition>);

/** Picks KPI cards from the library, optionally relabelled for a role ("Assigned to Me"). */
export function pickKpis(keys: readonly SummaryKey[], labels: Partial<Record<SummaryKey, string>> = {}): readonly KpiDefinition[] {
  return keys.map((key) => ({ ...KPI_LIBRARY[key], label: labels[key] ?? KPI_LIBRARY[key].label }));
}
