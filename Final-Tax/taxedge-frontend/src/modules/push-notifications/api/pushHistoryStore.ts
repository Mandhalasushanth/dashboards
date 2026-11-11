import type { PushSenderMode, SentPushNotification } from '../shared/pushNotification.types';

/**
 * The backend sends pushes but has no endpoint that lists them, so this browser keeps a history of
 * what was sent from here. It is per sender and lives in localStorage; other devices do not see it.
 */
const STORAGE_KEY = (mode: PushSenderMode) => `taxedge.push.history.${mode.toLowerCase()}`;
const MAX_ITEMS = 50;

export function readPushHistory(mode: PushSenderMode): SentPushNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(mode));
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as SentPushNotification[]) : [];
  } catch {
    return [];
  }
}

export function savePushHistory(mode: PushSenderMode, item: SentPushNotification): void {
  try {
    localStorage.setItem(STORAGE_KEY(mode), JSON.stringify([item, ...readPushHistory(mode)].slice(0, MAX_ITEMS)));
  } catch {
    // Storage blocked: the item still shows until the page reloads.
  }
}
