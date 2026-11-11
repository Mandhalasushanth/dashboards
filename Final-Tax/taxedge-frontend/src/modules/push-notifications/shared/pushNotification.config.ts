import type { IconName } from '@/shared';
import type { PushAudience, PushCategory, PushSenderMode } from './pushNotification.types';

/** Push limits that keep the text readable on a phone lock screen without being cut off. */
export const PUSH_LIMITS = Object.freeze({
  titleMin: 3,
  titleMax: 65,
  messageMin: 10,
  messageMax: 240,
  /** Names shown in the sent list before "and N more". */
  previewNames: 3
});

export interface PushCategoryMeta {
  readonly label: string;
  readonly icon: IconName;
  readonly placeholderTitle: string;
  readonly placeholderMessage: string;
}

export const PUSH_CATEGORIES: Readonly<Record<PushCategory, PushCategoryMeta>> = Object.freeze({
  ANNOUNCEMENT: {
    label: 'Announcement',
    icon: 'bell',
    placeholderTitle: 'e.g. New services now available',
    placeholderMessage: 'e.g. You can now apply for GST registration directly from the app.'
  },
  OFFER: {
    label: 'Offer',
    icon: 'star',
    placeholderTitle: 'e.g. 20% off ITR filing this week',
    placeholderMessage: 'e.g. File your income tax return before 31 July and save 20% on our fee.'
  },
  REMINDER: {
    label: 'Reminder',
    icon: 'clock',
    placeholderTitle: 'e.g. GST return due in 3 days',
    placeholderMessage: 'e.g. Your GSTR-3B for this month is due on the 20th. Upload your invoices in the app.'
  },
  ALERT: {
    label: 'Important alert',
    icon: 'alert-triangle',
    placeholderTitle: 'e.g. Scheduled maintenance tonight',
    placeholderMessage: 'e.g. The app will be unavailable from 11 PM to 1 AM while we upgrade our systems.'
  },
  DOCUMENT_REQUEST: {
    label: 'Document request',
    icon: 'file-up',
    placeholderTitle: 'e.g. Please upload your bank statement',
    placeholderMessage: 'e.g. We need your last 6 months of bank statements to continue your application.'
  },
  PAYMENT_REMINDER: {
    label: 'Payment reminder',
    icon: 'credit-card',
    placeholderTitle: 'e.g. Payment pending for your application',
    placeholderMessage: 'e.g. Complete the service fee payment in the app so we can start work on your application.'
  },
  STATUS_UPDATE: {
    label: 'Application update',
    icon: 'circle-check',
    placeholderTitle: 'e.g. Your application is in progress',
    placeholderMessage: 'e.g. Our team has verified your documents and started filing your return.'
  }
});

/** The admin speaks to every customer; a manager writes about the customers' own applications. */
export const CATEGORIES_BY_MODE: Readonly<Record<PushSenderMode, readonly PushCategory[]>> = Object.freeze({
  ADMIN: Object.freeze<PushCategory[]>(['ANNOUNCEMENT', 'OFFER', 'REMINDER', 'ALERT']),
  MANAGER: Object.freeze<PushCategory[]>(['DOCUMENT_REQUEST', 'PAYMENT_REMINDER', 'STATUS_UPDATE', 'REMINDER'])
});

export const AUDIENCE_BY_MODE: Readonly<Record<PushSenderMode, PushAudience>> = Object.freeze({
  ADMIN: 'ALL_CUSTOMERS',
  MANAGER: 'SELECTED_CUSTOMERS'
});

export const AUDIENCE_LABELS: Readonly<Record<PushAudience, string>> = Object.freeze({
  ALL_CUSTOMERS: 'All customers',
  SELECTED_CUSTOMERS: 'Selected customers'
});

export const DEFAULT_PLACEHOLDERS = Object.freeze({
  title: 'Enter a short title (shown in bold on the phone)',
  message: 'Enter the message customers will read in the notification'
});
