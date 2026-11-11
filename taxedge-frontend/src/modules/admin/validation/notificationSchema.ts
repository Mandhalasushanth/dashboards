import {
  NOTIFICATION_CATEGORIES,
  type AdminNotification,
  type NotificationCategory
} from '../shared/notifications.types';

type RawRecord = Record<string, unknown>;

const MAX_TITLE_LENGTH = 160;
const MAX_MESSAGE_LENGTH = 600;

function isRecord(value: unknown): value is RawRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isCategory(value: unknown): value is NotificationCategory {
  return typeof value === 'string' && (NOTIFICATION_CATEGORIES as readonly string[]).includes(value);
}

function readText(record: RawRecord, key: string, maxLength: number): string | null {
  const value = record[key];
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, maxLength) : null;
}

/** Only in-app admin paths are followed, so a notification can never send the user off-site. */
function readLink(record: RawRecord): string | null {
  const link = record.link;
  return typeof link === 'string' && /^\/admin\/[a-z0-9/-]*$/i.test(link) ? link : null;
}

function readTimestamp(record: RawRecord): string | null {
  const value = record.createdAt;
  return typeof value === 'string' && !Number.isNaN(Date.parse(value)) ? value : null;
}

/** Validates one server notification; returns null for anything malformed so it is skipped, not rendered. */
export function parseNotification(raw: unknown): AdminNotification | null {
  if (!isRecord(raw)) {
    return null;
  }
  const id = typeof raw.id === 'number' ? String(raw.id) : readText(raw, 'id', 64);
  const title = readText(raw, 'title', MAX_TITLE_LENGTH);
  const createdAt = readTimestamp(raw);
  if (!id || !title || !createdAt) {
    return null;
  }
  return Object.freeze({
    id,
    category: isCategory(raw.category) ? raw.category : 'SYSTEM',
    title,
    message: readText(raw, 'message', MAX_MESSAGE_LENGTH) ?? '',
    createdAt,
    read: raw.read === true,
    link: readLink(raw)
  });
}

/** Accepts a plain array or `{ items: [...] }`, drops invalid entries, newest first. */
export function parseNotificationList(raw: unknown): AdminNotification[] {
  const items = Array.isArray(raw) ? raw : isRecord(raw) && Array.isArray(raw.items) ? raw.items : [];
  return items
    .map(parseNotification)
    .filter((item): item is AdminNotification => item !== null)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}
