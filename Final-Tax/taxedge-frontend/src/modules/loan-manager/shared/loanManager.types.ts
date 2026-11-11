import type { IconName } from '@/shared';

/** Keys of the live counters shown as sidebar and header badges. */
export type LoanManagerCounterKey = 'communication' | 'submitted' | 'readyToAssign' | 'docsMissing' | 'notifications';

export type LoanManagerNavCounters = Partial<Record<LoanManagerCounterKey, number>>;

/** One id per menu section; each has a matching folder under loan-manager/components (overview is the dashboard). */
export type LoanManagerSectionId =
  | 'overview'
  | 'verify'
  | 'mine'
  | 'payment'
  | 'working'
  | 'communication'
  | 'notifications';

export interface LoanManagerNavItem {
  readonly id: LoanManagerSectionId;
  readonly label: string;
  readonly path: string;
  readonly iconName: IconName;
  /** Sidebar group heading. */
  readonly group: string;
  /** Page description shown in the section header. */
  readonly description: string;
  /** Header title when it differs from the menu label. */
  readonly title?: string;
  readonly counterKey?: LoanManagerCounterKey;
}

/** Menu sections that render a work queue. */
export type LoanManagerQueueSectionId = 'verify' | 'mine' | 'payment' | 'working';
