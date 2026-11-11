import type { NotificationCategory, NotificationCategoryConfig } from '../../../shared/notifications.types';

/** Label, icon and colour for each notification category, in filter-chip order. */
export const NOTIFICATION_CATEGORY_CONFIG: Readonly<Record<NotificationCategory, NotificationCategoryConfig>> = Object.freeze({
  APPLICATION: { label: 'Applications', iconName: 'file-spreadsheet', tone: 'blue' },
  DOCUMENT: { label: 'Documents', iconName: 'file-up', tone: 'navy' },
  PAYMENT: { label: 'Payments', iconName: 'credit-card', tone: 'green' },
  SLA: { label: 'SLA alerts', iconName: 'clock', tone: 'red' },
  SYSTEM: { label: 'System', iconName: 'shield-check', tone: 'orange' }
});
