import { useCallback, useEffect, useMemo, useState } from 'react';
import { defaultMessageFor, isApiError } from '@/core/api';
import { logger } from '@/core/logging/logger';
import { useAuthentication } from '@/modules/authentication';
import { pushNotificationsApi, type PushFailure } from '../api/pushNotificationsApi';
import { AUDIENCE_BY_MODE } from '../shared/pushNotification.config';
import type {
  PushDraftErrors,
  PushDraftField,
  PushNotificationDraft,
  PushRecipient,
  PushSenderMode,
  SentPushNotification
} from '../shared/pushNotification.types';
import { hasPushErrors, validatePushDraft } from '../validation/pushNotificationValidation';

export type LoadStatus = 'loading' | 'ready' | 'error';

/** Loads the customers a push can reach: every customer for the admin, the team's customers for a manager. */
export type RecipientLoader = () => Promise<readonly PushRecipient[]>;

function toMessage(error: unknown): string {
  if (isApiError(error)) return error.message;
  logger.error('Unexpected push notification failure.', error);
  return defaultMessageFor('UNKNOWN');
}

const plural = (count: number) => `${count} customer${count === 1 ? '' : 's'}`;

/** What the sender sees after a send, including who the push could not reach. */
function sentNotice(mode: PushSenderMode, delivered: number, failures: readonly PushFailure[]) {
  if (mode === 'ADMIN') {
    return { tone: 'info' as const, message: `Broadcast started to ${plural(delivered)} with the app installed.` };
  }
  const missed = failures.map((failure) => `${failure.name} (${failure.reason})`).join(', ');
  return failures.length > 0
    ? { tone: 'warning' as const, message: `Sent to ${plural(delivered)}. Not delivered to: ${missed}` }
    : { tone: 'info' as const, message: `Push notification sent to ${plural(delivered)}.` };
}

const emptyDraft = (mode: PushSenderMode): PushNotificationDraft => ({
  title: '',
  message: '',
  category: '',
  audience: AUDIENCE_BY_MODE[mode],
  recipientIds: []
});

/** Compose, validate and send a push, plus the list of pushes this sender already sent. */
export function usePushNotifications(mode: PushSenderMode, loadRecipients: RecipientLoader) {
  const { user } = useAuthentication();
  const [draft, setDraft] = useState<PushNotificationDraft>(() => emptyDraft(mode));
  const [errors, setErrors] = useState<PushDraftErrors>({});
  const [recipients, setRecipients] = useState<readonly PushRecipient[]>([]);
  const [recipientStatus, setRecipientStatus] = useState<LoadStatus>('loading');
  const [sent, setSent] = useState<readonly SentPushNotification[]>([]);
  const [sentStatus, setSentStatus] = useState<LoadStatus>('loading');
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<{ tone: 'info' | 'warning' | 'error'; message: string } | null>(null);
  const [loadCount, setLoadCount] = useState(0);

  useEffect(() => {
    let active = true;
    setRecipientStatus('loading');
    setSentStatus('loading');
    loadRecipients()
      .then((list) => {
        if (!active) return;
        setRecipients(list);
        setRecipientStatus('ready');
      })
      .catch((error: unknown) => {
        if (!active) return;
        logger.warn('Push recipients could not be loaded.', { error });
        setRecipientStatus('error');
      });
    pushNotificationsApi
      .listSent(mode)
      .then((list) => {
        if (!active) return;
        setSent(list);
        setSentStatus('ready');
      })
      .catch((error: unknown) => {
        if (!active) return;
        logger.warn('Sent push notifications could not be loaded.', { error });
        setSentStatus('error');
      });
    return () => {
      active = false;
    };
  }, [mode, loadRecipients, loadCount]);

  const selectedRecipients = useMemo(
    () => recipients.filter((recipient) => draft.recipientIds.includes(recipient.id)),
    [recipients, draft.recipientIds]
  );

  const recipientCount = draft.audience === 'ALL_CUSTOMERS' ? recipients.length : selectedRecipients.length;

  const change = useCallback(<K extends keyof PushNotificationDraft>(field: K, value: PushNotificationDraft[K]) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field as PushDraftField]: undefined }));
    setNotice(null);
  }, []);

  const toggleRecipient = useCallback((id: string) => {
    setDraft((current) => ({
      ...current,
      recipientIds: current.recipientIds.includes(id)
        ? current.recipientIds.filter((value) => value !== id)
        : [...current.recipientIds, id]
    }));
    setErrors((current) => ({ ...current, recipientIds: undefined }));
  }, []);

  const setSelection = useCallback((ids: readonly string[]) => {
    setDraft((current) => ({ ...current, recipientIds: ids }));
    setErrors((current) => ({ ...current, recipientIds: undefined }));
  }, []);

  const reset = useCallback(() => {
    setDraft(emptyDraft(mode));
    setErrors({});
  }, [mode]);

  /** Returns true once the server accepted the push. */
  const send = useCallback(async (): Promise<boolean> => {
    const found = validatePushDraft(draft);
    if (hasPushErrors(found) || !draft.category) {
      setErrors(found);
      return false;
    }
    setSending(true);
    setNotice(null);
    try {
      const { sent: created, failures } = await pushNotificationsApi.send(
        mode,
        {
          title: draft.title.trim(),
          message: draft.message.trim(),
          category: draft.category,
          recipients: draft.audience === 'ALL_CUSTOMERS' ? [] : selectedRecipients
        },
        user?.displayName ?? 'You'
      );
      setSent((current) => [created, ...current]);
      setNotice(sentNotice(mode, created.recipientCount, failures));
      setDraft(emptyDraft(mode));
      setErrors({});
      return true;
    } catch (error) {
      setNotice({ tone: 'error', message: toMessage(error) });
      return false;
    } finally {
      setSending(false);
    }
  }, [draft, mode, selectedRecipients, user]);

  const reload = useCallback(() => setLoadCount((value) => value + 1), []);

  return {
    mode,
    draft,
    errors,
    recipients,
    recipientStatus,
    recipientCount,
    selectedRecipients,
    sent,
    sentStatus,
    sending,
    notice,
    change,
    toggleRecipient,
    setSelection,
    reset,
    send,
    reload
  };
}

export type PushNotificationsController = ReturnType<typeof usePushNotifications>;
