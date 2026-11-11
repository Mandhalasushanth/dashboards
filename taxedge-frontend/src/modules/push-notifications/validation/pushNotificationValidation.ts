import { PUSH_LIMITS } from '../shared/pushNotification.config';
import type { PushDraftErrors, PushNotificationDraft } from '../shared/pushNotification.types';

function lengthError(label: string, value: string, min: number, max: number): string | undefined {
  const text = value.trim();
  if (!text) return `${label} is required.`;
  if (text.length < min) return `${label} must be at least ${min} characters.`;
  return text.length > max ? `${label} must be at most ${max} characters.` : undefined;
}

/** Every rule the composer checks before sending; an empty object means the draft can go. */
export function validatePushDraft(draft: PushNotificationDraft): PushDraftErrors {
  const errors: PushDraftErrors = {
    title: lengthError('Title', draft.title, PUSH_LIMITS.titleMin, PUSH_LIMITS.titleMax),
    message: lengthError('Message', draft.message, PUSH_LIMITS.messageMin, PUSH_LIMITS.messageMax),
    category: draft.category ? undefined : 'Choose a notification type.',
    recipientIds:
      draft.audience === 'SELECTED_CUSTOMERS' && draft.recipientIds.length === 0
        ? 'Select at least one customer.'
        : undefined
  };
  return Object.fromEntries(Object.entries(errors).filter(([, message]) => Boolean(message))) as PushDraftErrors;
}

export function hasPushErrors(errors: PushDraftErrors): boolean {
  return Object.keys(errors).length > 0;
}
