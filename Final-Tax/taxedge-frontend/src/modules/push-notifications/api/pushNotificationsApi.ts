import { ApiError } from '@/core/api';
import { environment } from '@/core/config/environment';
import type {
  PushCategory,
  PushRecipient,
  PushSenderMode,
  SentPushNotification
} from '../shared/pushNotification.types';
import { readPushHistory, savePushHistory } from './pushHistoryStore';

/**
 * AdminPushNotificationController (@RequestMapping("/notifications")):
 *  - POST /broadcast {title, message}               → every customer with the app (admin)
 *  - POST /send      {mobileNumber, title, message} → one customer, found by mobile number (manager)
 */
const PATHS = Object.freeze({ broadcast: '/broadcast', send: '/send' });

export interface PushSendRequest {
  readonly title: string;
  readonly message: string;
  readonly category: PushCategory;
  /** Admin: ignored, the server reaches every registered device. Manager: the chosen customers. */
  readonly recipients: readonly PushRecipient[];
}

/** A customer the push did not reach, with the server's reason. */
export interface PushFailure {
  readonly name: string;
  readonly reason: string;
}

export interface PushSendResult {
  readonly sent: SentPushNotification;
  readonly failures: readonly PushFailure[];
}

interface BroadcastResponse {
  readonly accepted?: boolean;
  readonly message?: string;
  readonly totalRecipients?: number;
}

interface SendResponse {
  readonly success?: boolean;
  readonly message?: string;
  readonly recipientName?: string;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${environment.notificationsBaseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body)
  }).catch(() => {
    throw new ApiError('NETWORK_ERROR', 'Could not reach the server. Check your connection and try again.');
  });
  const payload = (await response.json().catch(() => null)) as (T & { message?: string }) | null;
  if (!response.ok) {
    throw new ApiError(response.status >= 500 ? 'SERVER_ERROR' : 'VALIDATION_FAILED', payload?.message || `The server refused the notification (${response.status}).`, response.status);
  }
  return (payload ?? {}) as T;
}

const reasonOf = (result: PromiseSettledResult<SendResponse>) =>
  result.status === 'rejected'
    ? result.reason instanceof Error
      ? result.reason.message
      : 'Not delivered.'
    : result.value.message || 'Not delivered.';

function record(mode: PushSenderMode, request: PushSendRequest, sentBy: string, recipientCount: number, names: readonly string[], audience: SentPushNotification['audience']): SentPushNotification {
  const sent: SentPushNotification = Object.freeze({
    id: `push-${Date.now().toString(36)}`,
    title: request.title,
    message: request.message,
    category: request.category,
    audience,
    recipientCount,
    recipientPreview: names.slice(0, 3),
    sentBy,
    sentAt: new Date().toISOString()
  });
  savePushHistory(mode, sent);
  return sent;
}

/** Admin: one broadcast call; the server counts and reaches every customer with a registered device. */
async function broadcast(request: PushSendRequest, sentBy: string): Promise<PushSendResult> {
  const response = await postJson<BroadcastResponse>(PATHS.broadcast, { title: request.title, message: request.message });
  if (response.accepted === false) {
    throw new ApiError('UNKNOWN', response.message || 'The broadcast was not accepted.');
  }
  const total = response.totalRecipients ?? 0;
  return { sent: record('ADMIN', request, sentBy, total, [], 'ALL_CUSTOMERS'), failures: [] };
}

/** Manager: one call per chosen customer, by mobile number; a customer without the app is reported back. */
async function sendToSelected(request: PushSendRequest, sentBy: string): Promise<PushSendResult> {
  const withMobile = request.recipients.filter((recipient) => recipient.mobile.trim());
  const noMobile = request.recipients
    .filter((recipient) => !recipient.mobile.trim())
    .map((recipient) => ({ name: recipient.name, reason: 'No mobile number on file.' }));
  const results = await Promise.allSettled(
    withMobile.map((recipient) =>
      postJson<SendResponse>(PATHS.send, { mobileNumber: recipient.mobile, title: request.title, message: request.message })
    )
  );
  const delivered = withMobile.filter((_, index) => {
    const result = results[index];
    return result?.status === 'fulfilled' && result.value.success === true;
  });
  const failures = [
    ...noMobile,
    ...withMobile
      .map((recipient, index) => ({ recipient, result: results[index] }))
      .filter(({ result }) => !(result?.status === 'fulfilled' && result.value.success === true))
      .map(({ recipient, result }) => ({ name: recipient.name, reason: result ? reasonOf(result) : 'Not delivered.' }))
  ];
  if (delivered.length === 0) {
    throw new ApiError('UNKNOWN', `Not delivered. ${failures.map((failure) => `${failure.name}: ${failure.reason}`).join(' ')}`);
  }
  const names = delivered.map((recipient) => recipient.name);
  return { sent: record('MANAGER', request, sentBy, names.length, names, 'SELECTED_CUSTOMERS'), failures };
}

export const pushNotificationsApi = Object.freeze({
  async listSent(mode: PushSenderMode): Promise<SentPushNotification[]> {
    return readPushHistory(mode);
  },

  send(mode: PushSenderMode, request: PushSendRequest, sentBy: string): Promise<PushSendResult> {
    return mode === 'ADMIN' ? broadcast(request, sentBy) : sendToSelected(request, sentBy);
  }
});
