/** Who a push goes to: the admin reaches every customer, a manager picks customers by hand. */
export type PushAudience = 'ALL_CUSTOMERS' | 'SELECTED_CUSTOMERS';

/** Which composer is open; decides the audience and the categories on offer. */
export type PushSenderMode = 'ADMIN' | 'MANAGER';

export type PushCategory =
  | 'ANNOUNCEMENT'
  | 'OFFER'
  | 'REMINDER'
  | 'ALERT'
  | 'DOCUMENT_REQUEST'
  | 'PAYMENT_REMINDER'
  | 'STATUS_UPDATE';

/** A customer who can receive a push on the mobile app. */
export interface PushRecipient {
  /** Stable id (the PAN when known, otherwise the email). */
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly mobile: string;
  /** Application references this customer has with the sender, for context in the picker. */
  readonly references: readonly string[];
}

export interface PushNotificationDraft {
  readonly title: string;
  readonly message: string;
  readonly category: PushCategory | '';
  readonly audience: PushAudience;
  readonly recipientIds: readonly string[];
}

export interface SentPushNotification {
  readonly id: string;
  readonly title: string;
  readonly message: string;
  readonly category: PushCategory;
  readonly audience: PushAudience;
  readonly recipientCount: number;
  /** First few names, so the sent list can say who it reached. */
  readonly recipientPreview: readonly string[];
  readonly sentBy: string;
  readonly sentAt: string;
}

export type PushDraftField = 'title' | 'message' | 'category' | 'recipientIds';

export type PushDraftErrors = Partial<Record<PushDraftField, string>>;
