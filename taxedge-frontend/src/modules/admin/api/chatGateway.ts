import { environment } from '@/core/config/environment';
import { ApiError } from '@/core/api';
import { isChatTokenExpired, loadChatCredentials, type ChatCredentials } from '@/modules/authentication';
import { fetchBucketClaims } from '@/modules/workflow';
import type { MessagingGateway } from './messagingClient';
import { connectStomp, type StompConnection } from './stompClient';

/**
 * The messaging gateway backed by ChatController: history over REST (/chat/history/{partnerId}) and sends
 * over STOMP (/app/chat.send). The server names chat accounts "ADMIN:<id>", "MANAGER:<id>" and "AGENT:<id>"
 * (a customer is just their customer id). Who may talk to whom:
 *   administrator <-> every manager and agent, manager <-> their agents, customer -> manager,
 *   and managers and agents can answer the administrator.
 */
const SEND_TIMEOUT_MS = 10_000;
const HISTORY_PAGE_SIZE = 100;
const RECONNECT_CHECK_MS = 5_000;

type RawRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is RawRecord => typeof value === 'object' && value !== null && !Array.isArray(value);

function wsUrl(): string {
  const configured = import.meta.env.VITE_WS_URL?.trim();
  if (configured) {
    return configured;
  }
  return `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws`;
}

function requireCredentials(): ChatCredentials {
  const credentials = loadChatCredentials();
  if (!credentials) {
    throw new ApiError('UNAUTHENTICATED', 'Sign in again to use messaging.');
  }
  if (isChatTokenExpired(credentials)) {
    // The server turns away an expired token even on its open endpoints, and staff tokens cannot be refreshed.
    throw new ApiError('UNAUTHENTICATED', 'Your session has expired. Sign out and sign in again to use Communication.');
  }
  return credentials;
}

/** The server's name for an account: the chat principal, e.g. "MANAGER:5". */
type Tier = 'ADMIN' | 'MANAGER' | 'AGENT';
const principalOf = (tier: Tier, id: string | number) => `${tier}:${id}`;
const myTier = (credentials: ChatCredentials): Tier => (credentials.role === 'ADMIN' ? 'ADMIN' : credentials.role.endsWith('_MANAGER') ? 'MANAGER' : 'AGENT');

async function getJson(path: string, credentials: ChatCredentials): Promise<unknown> {
  const response = await fetch(`${environment.apiBaseUrl}${path}`, {
    credentials: 'include',
    cache: 'no-store',
    headers: { Accept: 'application/json', Authorization: `Bearer ${credentials.accessToken}` }
  });
  if (!response.ok) {
    throw new ApiError(response.status === 401 ? 'UNAUTHENTICATED' : 'SERVER_ERROR', `Messaging request failed (HTTP ${response.status}).`, response.status);
  }
  return response.json();
}

const asList = (raw: unknown): RawRecord[] => (Array.isArray(raw) ? raw.filter(isRecord) : []);

function contactFrom(record: RawRecord, tier: Tier): RawRecord {
  return {
    id: principalOf(tier, record.id as string | number),
    name: record.fullName,
    role: record.role,
    email: record.email,
    unreadCount: 0,
    lastMessage: null
  };
}

/**
 * The customers whose applications this manager has taken, one contact per customer (read from the manager's
 * bucket, GET /api/v1/bucket/manager/0). The chat addresses a customer by their backend id (custId).
 */
async function listCustomerContacts(me: ChatCredentials): Promise<RawRecord[]> {
  try {
    const byId = new Map<string, RawRecord>();
    for (const claim of await fetchBucketClaims()) {
      const customer = claim.customer;
      if (claim.managerId === me.id && customer && !byId.has(customer.id)) {
        byId.set(customer.id, { id: customer.id, name: customer.name, role: 'CUSTOMER', email: customer.email, unreadCount: 0, lastMessage: null });
      }
    }
    return [...byId.values()];
  } catch {
    // The agents still load when the bucket cannot be read.
    return [];
  }
}

/**
 * What each contact last wrote or was sent, so the list shows a preview, puts the most recent conversations
 * first, and flags a message from them that has not been opened yet. "Opened" is remembered only while the page
 * is open; nothing is saved in the browser.
 */
const latestFromThem = new Map<string, string>();
const openedUpTo = new Map<string, string>();

async function withLastMessages(contacts: RawRecord[], me: ChatCredentials): Promise<RawRecord[]> {
  const mine = principalOf(myTier(me), me.id);
  return Promise.all(
    contacts.map(async (contact) => {
      try {
        const [latest] = asList(await getJson(`/chat/history/${encodeURIComponent(String(contact.id))}?page=0&size=1`, me));
        if (!latest || typeof latest.content !== 'string' || typeof latest.sentAt !== 'string') return contact;
        const fromMe = latest.senderId === mine;
        if (!fromMe) latestFromThem.set(String(contact.id), latest.sentAt);
        const unread = !fromMe && openedUpTo.get(String(contact.id)) !== latest.sentAt;
        return { ...contact, unreadCount: unread ? 1 : 0, lastMessage: { body: latest.content, sentAt: latest.sentAt, fromMe } };
      } catch {
        return contact;
      }
    })
  );
}

/**
 * The administrator, as a contact for managers and agents. The server has no "list admins" call, so the
 * account is looked up by the email in VITE_ADMIN_EMAIL (GET /admin/profile?email=); without it there is no
 * Administrator contact.
 */
let adminContact: Promise<RawRecord[]> | null = null;

function listAdminContact(me: ChatCredentials): Promise<RawRecord[]> {
  const email = import.meta.env.VITE_ADMIN_EMAIL?.trim();
  if (!email) return Promise.resolve([]);
  adminContact ??= getJson(`/admin/profile?email=${encodeURIComponent(email)}`, me)
    .then((profile) => (isRecord(profile) && profile.id !== undefined ? [contactFrom({ ...profile, role: 'ADMIN' }, 'ADMIN')] : []))
    .catch(() => {
      adminContact = null; // try again on the next refresh
      return [];
    });
  return adminContact;
}

async function listContacts(): Promise<unknown> {
  const me = requireCredentials();
  const tier = myTier(me);
  if (tier === 'ADMIN') {
    const [managers, agents] = await Promise.all([getJson('/admin/managers', me).then(asList), getJson('/admin/agents', me).then(asList)]);
    return withLastMessages([...managers.map((manager) => contactFrom(manager, 'MANAGER')), ...agents.map((agent) => contactFrom(agent, 'AGENT'))], me);
  }
  if (tier === 'MANAGER') {
    const [agents, customers, admin] = await Promise.all([
      getJson(`/admin/agents?managerId=${encodeURIComponent(me.id)}`, me).then(asList),
      listCustomerContacts(me),
      listAdminContact(me)
    ]);
    return withLastMessages([...agents.map((agent) => contactFrom(agent, 'AGENT')), ...customers, ...admin], me);
  }
  const [managers, admin] = await Promise.all([getJson('/admin/managers', me).then(asList), listAdminContact(me)]);
  return withLastMessages(
    [...managers.filter((manager) => String(manager.id) === me.managerId).map((manager) => contactFrom(manager, 'MANAGER')), ...admin],
    me
  );
}

function toMessage(raw: unknown, me: ChatCredentials): RawRecord | null {
  if (!isRecord(raw)) {
    return null;
  }
  return {
    id: raw.id ?? raw.clientMessageId,
    body: raw.content,
    sentAt: raw.sentAt,
    fromMe: raw.senderId === principalOf(myTier(me), me.id),
    read: raw.readAt != null
  };
}

async function listMessages(contactId: string): Promise<unknown> {
  const me = requireCredentials();
  const history = asList(await getJson(`/chat/history/${encodeURIComponent(contactId)}?page=0&size=${HISTORY_PAGE_SIZE}`, me));
  return history.map((entry) => toMessage(entry, me));
}

let connection: Promise<StompConnection> | null = null;
let connectionOwner: string | null = null;
const incomingListeners = new Set<() => void>();
const waiting = new Map<string, { resolve: (message: unknown) => void; reject: (error: Error) => void }>();

function parseBody(body: string): unknown {
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

function openConnection(me: ChatCredentials): Promise<StompConnection> {
  // A different user signing in on this tab must not reuse the previous user's socket.
  if (connection && connectionOwner !== me.accessToken) {
    connection = null;
  }
  const existing = connection;
  if (existing) {
    return existing.then((open) => (open.isOpen() ? open : reconnect(me)), () => reconnect(me));
  }
  return reconnect(me);
}

function reconnect(me: ChatCredentials): Promise<StompConnection> {
  connectionOwner = me.accessToken;
  const next = connectStomp(wsUrl(), me.accessToken).then((open) => {
    open.subscribe('/user/queue/messages', (frame) => {
      const dto = parseBody(frame.body);
      const clientId = isRecord(dto) && typeof dto.clientMessageId === 'string' ? dto.clientMessageId : null;
      const pending = clientId ? waiting.get(clientId) : undefined;
      if (clientId && pending && isRecord(dto) && dto.senderId === principalOf(myTier(me), me.id)) {
        waiting.delete(clientId);
        pending.resolve(toMessage(dto, me));
      } else {
        incomingListeners.forEach((listener) => listener());
      }
    });
    open.subscribe('/user/queue/errors', (frame) => {
      const error = new Error(frame.body || 'The message could not be sent.');
      waiting.forEach((pending) => pending.reject(error));
      waiting.clear();
    });
    return open;
  });
  connection = next;
  next.catch(() => {
    if (connection === next) {
      connection = null;
    }
  });
  return next;
}

async function sendMessage(contactId: string, body: string): Promise<unknown> {
  const me = requireCredentials();
  const open = await openConnection(me);
  const clientMessageId = crypto.randomUUID();
  return new Promise<unknown>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      waiting.delete(clientMessageId);
      reject(new Error('The message was not confirmed by the server. Try again.'));
    }, SEND_TIMEOUT_MS);
    waiting.set(clientMessageId, {
      resolve: (message) => {
        window.clearTimeout(timer);
        resolve(message);
      },
      reject: (error) => {
        window.clearTimeout(timer);
        reject(error);
      }
    });
    open.send('/app/chat.send', {
      recipientId: contactId,
      content: body,
      clientMessageId,
      senderName: me.fullName || undefined,
      messageType: 'TEXT'
    });
  });
}

/** The backend has no read receipts, so "read" is remembered for this page only (no browser storage). */
async function markRead(contactId: string): Promise<void> {
  const latest = latestFromThem.get(contactId);
  if (latest) openedUpTo.set(contactId, latest);
}

/**
 * Pushes: keeps the socket open while a page is listening and calls back when the other person's message
 * arrives, so replies show at once instead of at the next poll. Re-opens a dropped socket every few seconds.
 */
function subscribeIncoming(listener: () => void): () => void {
  incomingListeners.add(listener);
  const keepOpen = () => {
    const me = loadChatCredentials();
    if (me) {
      openConnection(me).catch(() => undefined);
    }
  };
  keepOpen();
  const timer = window.setInterval(keepOpen, RECONNECT_CHECK_MS);
  return () => {
    incomingListeners.delete(listener);
    window.clearInterval(timer);
  };
}

export const chatGateway: MessagingGateway = Object.freeze({ listContacts, listMessages, sendMessage, markRead, subscribeIncoming });

