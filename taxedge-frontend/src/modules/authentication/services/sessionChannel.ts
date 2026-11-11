import { SESSION_BROADCAST_CHANNEL } from '../shared/constants/authentication.constants';

export type SessionEvent = 'signed-in' | 'signed-out';

/**
 * Each tab keeps its own sign-in, so different people (admin, manager, agent) can work in different tabs
 * of one browser. The username says whose session changed, so a sign-out only ends that person's tabs.
 */
export interface SessionMessage {
  readonly event: SessionEvent;
  readonly username: string | null;
}

type SessionEventHandler = (message: SessionMessage) => void;

/**
 * One channel per tab for both sending and receiving: a BroadcastChannel never receives
 * its own messages, so a tab only reacts to events from other tabs.
 */
let channel: BroadcastChannel | null | undefined;
const handlers = new Set<SessionEventHandler>();

function isSessionEvent(value: unknown): value is SessionEvent {
  return value === 'signed-in' || value === 'signed-out';
}

function toSessionMessage(value: unknown): SessionMessage | null {
  if (isSessionEvent(value)) {
    return { event: value, username: null };
  }
  const candidate = value as Partial<SessionMessage> | null;
  if (candidate && typeof candidate === 'object' && isSessionEvent(candidate.event)) {
    return { event: candidate.event, username: typeof candidate.username === 'string' ? candidate.username : null };
  }
  return null;
}

function getChannel(): BroadcastChannel | null {
  if (channel !== undefined) {
    return channel;
  }
  try {
    channel = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(SESSION_BROADCAST_CHANNEL);
  } catch {
    channel = null;
  }
  if (channel) {
    channel.onmessage = (message: MessageEvent<unknown>) => {
      const data = toSessionMessage(message.data);
      if (data) {
        handlers.forEach((handler) => handler(data));
      }
    };
  }
  return channel;
}

/** Tells other open tabs that this tab signed in or out, so they can resynchronise. */
export function broadcastSessionEvent(event: SessionEvent, username: string | null): void {
  const message: SessionMessage = { event, username: username?.toLowerCase() ?? null };
  getChannel()?.postMessage(message);
}

export function subscribeToSessionEvents(handler: SessionEventHandler): () => void {
  getChannel();
  handlers.add(handler);
  return () => {
    handlers.delete(handler);
  };
}
