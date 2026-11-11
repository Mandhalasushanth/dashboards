import type { IconName } from '@/shared';

export const NOTIFICATION_CATEGORIES = Object.freeze(['APPLICATION', 'DOCUMENT', 'PAYMENT', 'SLA', 'SYSTEM'] as const);

export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

export interface AdminNotification {
  readonly id: string;
  readonly category: NotificationCategory;
  readonly title: string;
  readonly message: string;
  /** ISO-8601 timestamp. */
  readonly createdAt: string;
  readonly read: boolean;
  /** In-app path to open, e.g. /admin/applications. */
  readonly link: string | null;
}

export type NotificationReadFilter = 'all' | 'unread';

export type NotificationCategoryFilter = NotificationCategory | 'ALL';

export interface NotificationCategoryConfig {
  readonly label: string;
  readonly iconName: IconName;
  /** CSS modifier for the icon tile colour. */
  readonly tone: 'blue' | 'orange' | 'green' | 'red' | 'navy';
}
