import type { Role } from '@/modules/authentication';
import type { DataCache } from '../api/adminDataCache';

/**
 * Someone the signed-in user may message, with a summary of the conversation. Who appears here is
 * decided per workspace (admin: all staff; managers: admin, their team; agents: their managers, admin)
 * and enforced by the server.
 */
export interface StaffContact {
  readonly id: string;
  readonly name: string;
  readonly role: ContactRole;
  readonly email: string;
  readonly unreadCount: number;
  readonly lastMessage: MessagePreview | null;
}

export interface MessagePreview {
  readonly body: string;
  /** ISO-8601 timestamp. */
  readonly sentAt: string;
  /** True when the signed-in user sent it. */
  readonly fromMe: boolean;
}

export interface ChatMessage {
  readonly id: string;
  readonly body: string;
  /** ISO-8601 timestamp. */
  readonly sentAt: string;
  /** True when the signed-in user sent it; false when the contact did. */
  readonly fromMe: boolean;
  /** For the signed-in user's own messages: whether the contact has read it. */
  readonly read: boolean;
}

/** A staff role, or a customer (managers can write to the customers on their applications). */
export type ContactRole = Role | 'CUSTOMER';

export type ContactRoleFilter = ContactRole | 'ALL';

/** Data access for one workspace's messaging; each module supplies its own, scoped by the server. */
export interface MessagingApi {
  readonly cache: DataCache<readonly StaffContact[]>;
  readonly fetchContacts: () => Promise<StaffContact[]>;
  readonly fetchConversation: (contactId: string) => Promise<ChatMessage[]>;
  readonly send: (contactId: string, body: string) => Promise<ChatMessage>;
  readonly markRead: (contactId: string) => Promise<void>;
  /** Calls back when a new message arrives so the open thread can refresh at once; returns an unsubscribe. */
  readonly subscribeIncoming: (listener: () => void) => () => void;
}

/** How one workspace presents messaging: its role tabs and the copy around the conversation. */
export interface MessagingPresentation {
  /** Role tabs in display order; 'ALL' first. */
  readonly filters: readonly ContactRoleFilter[];
  /** Label of the "ALL" tab, e.g. "All staff" or "All contacts". */
  readonly allLabel: string;
  readonly placeholderText: string;
  readonly emptyGroupText: string;
}
