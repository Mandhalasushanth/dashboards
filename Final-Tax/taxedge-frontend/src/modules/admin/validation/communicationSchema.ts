import { isRole } from '@/modules/authentication';
import type { ChatMessage, MessagePreview, StaffContact } from '../shared/communication.types';

type RawRecord = Record<string, unknown>;

/** Longest message the composer accepts; the server must enforce the same limit. */
export const MAX_MESSAGE_LENGTH = 1000;

function isRecord(value: unknown): value is RawRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readText(record: RawRecord, key: string, maxLength: number): string | null {
  const value = record[key];
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, maxLength) : null;
}

function readId(record: RawRecord): string | null {
  return typeof record.id === 'number' ? String(record.id) : readText(record, 'id', 64);
}

function readTimestamp(record: RawRecord, key: string): string | null {
  const value = record[key];
  return typeof value === 'string' && !Number.isNaN(Date.parse(value)) ? value : null;
}

function listFrom(raw: unknown): unknown[] {
  return Array.isArray(raw) ? raw : isRecord(raw) && Array.isArray(raw.items) ? raw.items : [];
}

function parsePreview(raw: unknown): MessagePreview | null {
  if (!isRecord(raw)) {
    return null;
  }
  const body = readText(raw, 'body', MAX_MESSAGE_LENGTH);
  const sentAt = readTimestamp(raw, 'sentAt');
  return body && sentAt ? { body, sentAt, fromMe: readFromMe(raw) } : null;
}

/** "Sent by me": workspace endpoints send `fromMe`; the original admin contract sends `fromAdmin`. */
function readFromMe(record: RawRecord): boolean {
  return record.fromMe === true || (record.fromMe === undefined && record.fromAdmin === true);
}

/** Contact from the server; entries without an id, name or known role are skipped. */
export function parseContact(raw: unknown): StaffContact | null {
  if (!isRecord(raw)) {
    return null;
  }
  const id = readId(raw);
  const name = readText(raw, 'name', 120);
  if (!id || !name || !(isRole(raw.role) || raw.role === 'CUSTOMER')) {
    return null;
  }
  const unread = raw.unreadCount;
  return Object.freeze({
    id,
    name,
    role: raw.role,
    email: readText(raw, 'email', 160) ?? '',
    unreadCount: typeof unread === 'number' && Number.isInteger(unread) && unread > 0 ? unread : 0,
    lastMessage: parsePreview(raw.lastMessage)
  });
}

/** Most recent conversation first; people never messaged are listed alphabetically after them. */
export function parseContactList(raw: unknown): StaffContact[] {
  const latest = (contact: StaffContact) => (contact.lastMessage ? Date.parse(contact.lastMessage.sentAt) : 0);
  return listFrom(raw)
    .map(parseContact)
    .filter((contact): contact is StaffContact => contact !== null)
    .sort((a, b) => latest(b) - latest(a) || a.name.localeCompare(b.name));
}

export function parseMessage(raw: unknown): ChatMessage | null {
  if (!isRecord(raw)) {
    return null;
  }
  const id = readId(raw);
  const body = readText(raw, 'body', MAX_MESSAGE_LENGTH);
  const sentAt = readTimestamp(raw, 'sentAt');
  return id && body && sentAt ? Object.freeze({ id, body, sentAt, fromMe: readFromMe(raw), read: raw.read === true }) : null;
}

/** Oldest first, as a chat thread reads top to bottom. */
export function parseMessageList(raw: unknown): ChatMessage[] {
  return listFrom(raw)
    .map(parseMessage)
    .filter((message): message is ChatMessage => message !== null)
    .sort((a, b) => Date.parse(a.sentAt) - Date.parse(b.sentAt));
}

/** Validates a message before sending: returns an error message, or null when it can be sent. */
export function validateMessageBody(body: string): string | null {
  const trimmed = body.trim();
  if (trimmed === '') {
    return 'Type a message to send.';
  }
  return trimmed.length > MAX_MESSAGE_LENGTH ? `Messages can be at most ${MAX_MESSAGE_LENGTH} characters.` : null;
}

/** Search is matched on name, email and role label; capped so a pasted essay cannot slow the list. */
export const MAX_SEARCH_LENGTH = 60;
