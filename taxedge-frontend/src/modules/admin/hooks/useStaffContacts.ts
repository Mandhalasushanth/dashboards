import { useCallback, useEffect, useMemo, useState } from 'react';
import { defaultMessageFor, isApiError } from '@/core/api';
import { logger } from '@/core/logging/logger';
import { ROLES } from '@/modules/authentication';
import { contactRoleLabel } from '../components/communication/config/staffRoleTheme';
import type { ChatMessage, ContactRole, ContactRoleFilter, MessagingApi, StaffContact } from '../shared/communication.types';
import { MAX_SEARCH_LENGTH } from '../validation/communicationSchema';

/** How often the staff list is refreshed while the page is open and visible. */
const CONTACTS_REFRESH_MS = 10_000;

export type ContactsStatus = 'loading' | 'ready' | 'error';

export interface StaffContactsController {
  readonly status: ContactsStatus;
  readonly error: string | null;
  readonly contacts: readonly StaffContact[];
  readonly visible: readonly StaffContact[];
  readonly roleCounts: Readonly<Record<ContactRoleFilter, number>>;
  readonly roleFilter: ContactRoleFilter;
  readonly search: string;
  readonly setRoleFilter: (filter: ContactRoleFilter) => void;
  readonly setSearch: (value: string) => void;
  readonly markReadLocally: (contactId: string) => void;
  readonly recordSent: (contactId: string, message: ChatMessage) => void;
  readonly reload: () => void;
}

function toMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }
  logger.error('Unexpected staff directory failure.', error);
  return defaultMessageFor('UNKNOWN');
}

function matchesSearch(contact: StaffContact, query: string): boolean {
  const haystack = `${contact.name} ${contact.email} ${contactRoleLabel(contact.role)}`.toLowerCase();
  return query.split(/\s+/).every((word) => haystack.includes(word));
}

function countByRole(contacts: readonly StaffContact[]): Record<ContactRoleFilter, number> {
  const perRole = Object.fromEntries(
    [...ROLES, 'CUSTOMER' as const].map((role) => [role, contacts.filter((contact) => contact.role === role).length])
  ) as Record<ContactRole, number>;
  return { ALL: contacts.length, ...perRole };
}

/** Contact directory for a Communication page: role tabs, search and live unread counts. */
export function useStaffContacts(api: MessagingApi): StaffContactsController {
  const [cached] = useState(() => api.cache.peek());
  const [contacts, setContacts] = useState<readonly StaffContact[]>(cached ?? []);
  const [status, setStatus] = useState<ContactsStatus>(cached ? 'ready' : 'loading');
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<ContactRoleFilter>('ALL');
  const [search, setSearchValue] = useState('');
  const [loadCount, setLoadCount] = useState(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const result = await api.fetchContacts();
        if (active) {
          setContacts(result);
          setError(null);
          setStatus('ready');
        }
      } catch (loadError) {
        if (active) {
          setError(toMessage(loadError));
          setStatus(api.cache.peek() ? 'ready' : 'error');
        }
      }
    };
    void load();
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void load();
      }
    }, CONTACTS_REFRESH_MS);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [api, loadCount]);

  useEffect(() => {
    if (status === 'ready') {
      api.cache.remember(contacts);
    }
  }, [api, contacts, status]);

  const query = search.trim().toLowerCase();
  const visible = useMemo(
    () =>
      contacts.filter(
        (contact) => (roleFilter === 'ALL' || contact.role === roleFilter) && (query === '' || matchesSearch(contact, query))
      ),
    [contacts, roleFilter, query]
  );
  const roleCounts = useMemo(() => countByRole(contacts), [contacts]);

  const setSearch = useCallback((value: string) => setSearchValue(value.slice(0, MAX_SEARCH_LENGTH)), []);

  const markReadLocally = useCallback((contactId: string) => {
    setContacts((current) => current.map((contact) => (contact.id === contactId ? { ...contact, unreadCount: 0 } : contact)));
  }, []);

  /** Moves the conversation to the top with the new message as its preview. */
  const recordSent = useCallback((contactId: string, message: ChatMessage) => {
    setContacts((current) => {
      const target = current.find((contact) => contact.id === contactId);
      if (!target) {
        return current;
      }
      const updated = { ...target, lastMessage: { body: message.body, sentAt: message.sentAt, fromMe: true } };
      return [updated, ...current.filter((contact) => contact.id !== contactId)];
    });
  }, []);

  const reload = useCallback(() => {
    setStatus('loading');
    setLoadCount((count) => count + 1);
  }, []);

  return { status, error, contacts, visible, roleCounts, roleFilter, search, setRoleFilter, setSearch, markReadLocally, recordSent, reload };
}
