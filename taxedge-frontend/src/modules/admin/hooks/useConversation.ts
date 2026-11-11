import { useCallback, useEffect, useRef, useState } from 'react';
import { defaultMessageFor, isApiError } from '@/core/api';
import { logger } from '@/core/logging/logger';
import type { ChatMessage, MessagingApi, StaffContact } from '../shared/communication.types';
import { validateMessageBody } from '../validation/communicationSchema';

/** How often the open conversation checks for new messages while the page is visible. */
const CONVERSATION_REFRESH_MS = 3_000;

export type ConversationStatus = 'idle' | 'loading' | 'ready' | 'error';

/** A message shown before the server confirms it. */
export interface DisplayMessage extends ChatMessage {
  readonly pending?: boolean;
}

export interface ConversationController {
  readonly status: ConversationStatus;
  readonly error: string | null;
  readonly messages: readonly DisplayMessage[];
  readonly sending: boolean;
  /** Validates and sends; resolves true when the server accepted the message. */
  readonly send: (body: string) => Promise<boolean>;
  readonly reload: () => void;
}

export interface ConversationCallbacks {
  readonly onRead: (contactId: string) => void;
  readonly onSent: (contactId: string, message: ChatMessage) => void;
}

function toMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }
  logger.error('Unexpected conversation failure.', error);
  return defaultMessageFor('UNKNOWN');
}

/** Loads and sends messages for one contact, marking their messages read when opened. */
export function useConversation(
  api: MessagingApi,
  contact: StaffContact | null,
  { onRead, onSent }: ConversationCallbacks
): ConversationController {
  const contactId = contact?.id ?? null;
  const [messages, setMessages] = useState<readonly DisplayMessage[]>([]);
  const [status, setStatus] = useState<ConversationStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [loadCount, setLoadCount] = useState(0);
  const unreadRef = useRef(contact?.unreadCount ?? 0);
  unreadRef.current = contact?.unreadCount ?? 0;

  useEffect(() => {
    if (!contactId) {
      setStatus('idle');
      setMessages([]);
      return undefined;
    }
    let active = true;
    const load = async (quiet: boolean) => {
      if (!quiet) {
        setStatus('loading');
      }
      try {
        const result = await api.fetchConversation(contactId);
        if (!active) {
          return;
        }
        setMessages(result);
        setError(null);
        setStatus('ready');
        if (unreadRef.current > 0) {
          onRead(contactId);
          await api.markRead(contactId);
        }
      } catch (loadError) {
        if (active) {
          setError(toMessage(loadError));
          setStatus(quiet ? 'ready' : 'error');
        }
      }
    };
    void load(false);
    const stopListening = api.subscribeIncoming(() => void load(true));
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void load(true);
      }
    }, CONVERSATION_REFRESH_MS);
    return () => {
      active = false;
      stopListening();
      window.clearInterval(timer);
    };
  }, [api, contactId, loadCount, onRead]);

  const send = useCallback(
    async (body: string): Promise<boolean> => {
      const invalid = validateMessageBody(body);
      if (!contactId || invalid || sending) {
        setError(invalid);
        return false;
      }
      const draft: DisplayMessage = {
        id: `pending-${Date.now()}`,
        body: body.trim(),
        sentAt: new Date().toISOString(),
        fromMe: true,
        read: false,
        pending: true
      };
      setMessages((current) => [...current, draft]);
      setSending(true);
      setError(null);
      try {
        const stored = await api.send(contactId, body);
        setMessages((current) => current.map((message) => (message.id === draft.id ? stored : message)));
        onSent(contactId, stored);
        return true;
      } catch (sendError) {
        setMessages((current) => current.filter((message) => message.id !== draft.id));
        setError(toMessage(sendError));
        return false;
      } finally {
        setSending(false);
      }
    },
    [api, contactId, onSent, sending]
  );

  const reload = useCallback(() => setLoadCount((count) => count + 1), []);

  return { status, error, messages, sending, send, reload };
}
