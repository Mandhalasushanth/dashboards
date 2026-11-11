import type { IconName } from '@/shared';

/** Keys of the live counters shown as sidebar and header badges. */
export type LoanAgentCounterKey = 'communication' | 'assigned' | 'portalWork' | 'notifications';

export type LoanAgentNavCounters = Partial<Record<LoanAgentCounterKey, number>>;

/** One id per menu section; each has a matching folder under loan-agent/components (overview is the dashboard). */
export type LoanAgentSectionId =
  | 'overview'
  | 'new'
  | 'missing'
  | 'portal'
  | 'completed'
  | 'applications'
  | 'communication'
  | 'notifications';

export interface LoanAgentNavItem {
  readonly id: LoanAgentSectionId;
  readonly label: string;
  readonly path: string;
  readonly iconName: IconName;
  /** Sidebar group heading. */
  readonly group: string;
  /** Page description shown in the section header. */
  readonly description: string;
  /** Header title when it differs from the menu label. */
  readonly title?: string;
  readonly counterKey?: LoanAgentCounterKey;
  /** Reachable from links on the dashboard but left out of the sidebar menu. */
  readonly hiddenFromMenu?: boolean;
}

/** Menu sections that render a work queue. */
export type LoanAgentQueueSectionId = 'new' | 'missing' | 'portal' | 'completed' | 'applications';
