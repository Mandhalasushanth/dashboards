import type { IconName } from '@/shared';

/** Keys of the live counters shown as sidebar and header badges. */
export type CaManagerCounterKey = 'communication' | 'submitted' | 'readyToAssign' | 'docsMissing' | 'notifications';

export type CaManagerNavCounters = Partial<Record<CaManagerCounterKey, number>>;

/** One id per menu section; each has a matching folder under ca-manager/components (overview is the dashboard). */
export type CaManagerSectionId =
  | 'overview'
  | 'verify'
  | 'mine'
  | 'payment'
  | 'working'
  | 'communication'
  | 'notifications';

export interface CaManagerNavItem {
  readonly id: CaManagerSectionId;
  readonly label: string;
  readonly path: string;
  readonly iconName: IconName;
  /** Sidebar group heading. */
  readonly group: string;
  /** Page description shown in the section header. */
  readonly description: string;
  /** Header title when it differs from the menu label. */
  readonly title?: string;
  readonly counterKey?: CaManagerCounterKey;
}

/** Menu sections that render a work queue. */
export type CaManagerQueueSectionId = 'verify' | 'mine' | 'payment' | 'working';
