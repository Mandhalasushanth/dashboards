import type { IconName } from '@/shared';

/** Keys of the live counters shown as sidebar and header badges. */
export type CaAgentCounterKey = 'communication' | 'assigned' | 'portalWork' | 'notifications';

export type CaAgentNavCounters = Partial<Record<CaAgentCounterKey, number>>;

/** One id per menu section; each has a matching folder under ca-agent/components (overview is the dashboard). */
export type CaAgentSectionId =
  | 'overview'
  | 'new'
  | 'missing'
  | 'portal'
  | 'completed'
  | 'applications'
  | 'communication'
  | 'notifications';

export interface CaAgentNavItem {
  readonly id: CaAgentSectionId;
  readonly label: string;
  readonly path: string;
  readonly iconName: IconName;
  /** Sidebar group heading. */
  readonly group: string;
  /** Page description shown in the section header. */
  readonly description: string;
  /** Header title when it differs from the menu label. */
  readonly title?: string;
  readonly counterKey?: CaAgentCounterKey;
  /** Reachable from links on the dashboard but left out of the sidebar menu. */
  readonly hiddenFromMenu?: boolean;
}

/** Menu sections that render a work queue. */
export type CaAgentQueueSectionId = 'new' | 'missing' | 'portal' | 'completed' | 'applications';
