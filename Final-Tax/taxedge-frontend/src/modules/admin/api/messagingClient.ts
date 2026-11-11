import type { ChatMessage, MessagingApi, StaffContact } from '../shared/communication.types';
import { parseContactList, parseMessage, parseMessageList } from '../validation/communicationSchema';
import { createDataCache } from './adminDataCache';
import { chatGateway } from './chatGateway';

/** What a workspace's messaging needs from the server; the chat backend (ChatController) implements it. */
export interface MessagingGateway {
  listContacts(): Promise<unknown>;
  listMessages(contactId: string): Promise<unknown>;
  sendMessage(contactId: string, body: string): Promise<unknown>;
  markRead(contactId: string): Promise<void>;
  /** Called when a message arrives from someone else; returns an unsubscribe function. */
  subscribeIncoming?(listener: () => void): () => void;
}

export interface MessagingClientOptions {
  /** Called after messages are read, so sidebar and header badges refresh. */
  readonly onRead: () => void;
}

/**
 * Builds a workspace's messaging API on the chat backend: contacts, history over REST and sends over STOMP.
 * Nothing is kept in the browser; every screen reads what the server holds.
 */
export function createMessagingApi({ onRead }: MessagingClientOptions): MessagingApi {
  const cache = createDataCache<readonly StaffContact[]>();
  const gateway: MessagingGateway = chatGateway;

  return Object.freeze({
    cache,
    async fetchContacts() {
      const contacts = parseContactList(await gateway.listContacts());
      cache.remember(contacts);
      return contacts;
    },
    async fetchConversation(contactId: string) {
      return parseMessageList(await gateway.listMessages(contactId));
    },
    async send(contactId: string, body: string): Promise<ChatMessage> {
      const stored = parseMessage(await gateway.sendMessage(contactId, body.trim()));
      if (!stored) {
        throw new Error('The server did not return the sent message.');
      }
      return stored;
    },
    subscribeIncoming(listener: () => void) {
      return gateway.subscribeIncoming?.(listener) ?? (() => undefined);
    },
    async markRead(contactId: string) {
      await gateway.markRead(contactId);
      onRead();
    }
  });
}
