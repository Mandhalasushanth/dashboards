import type { ChangeEvent } from 'react';
import { formatListTimestamp } from '@/core/utils/dateUtils';
import { Icon } from '@/shared';
import type { StaffContactsController } from '../../hooks/useStaffContacts';
import type { ContactRoleFilter, StaffContact } from '../../shared/communication.types';
import { MAX_SEARCH_LENGTH } from '../../validation/communicationSchema';
import { ContactAvatar } from './ContactAvatar';
import { STAFF_ROLE_THEME, contactRoleLabel } from './config/staffRoleTheme';
import './ContactList.css';

export interface ContactListProps {
  readonly directory: StaffContactsController;
  readonly allLabel: string;
  readonly emptyGroupText: string;
  readonly selectedId: string | null;
  readonly onSelect: (contactId: string) => void;
}

function filterLabel(filter: ContactRoleFilter, allLabel: string): string {
  return filter === 'ALL' ? allLabel : STAFF_ROLE_THEME[filter].pluralLabel;
}

function previewText(contact: StaffContact): string {
  if (!contact.lastMessage) {
    return 'No messages yet';
  }
  return contact.lastMessage.fromMe ? `You: ${contact.lastMessage.body}` : contact.lastMessage.body;
}

/** Left pane: search and the list of staff conversations. */
export function ContactList({ directory, allLabel, emptyGroupText, selectedId, onSelect }: ContactListProps) {
  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => directory.setSearch(event.target.value);
  const isSearching = directory.search.trim().length > 0;

  const renderContact = (contact: StaffContact) => {
    const selected = contact.id === selectedId;
    const unread = contact.unreadCount > 0;
    const classes = ['tx-contact', selected ? 'tx-contact--selected' : '', unread ? 'tx-contact--unread' : ''].filter(Boolean).join(' ');

    return (
      <li key={contact.id}>
        <button type="button" className={classes} onClick={() => onSelect(contact.id)} aria-current={selected ? 'true' : undefined}>
          <ContactAvatar name={contact.name} role={contact.role} />
          <span className="tx-contact__body">
            <span className="tx-contact__top">
              <span className="tx-contact__name">{contact.name}</span>
              {contact.lastMessage ? (
                <time className="tx-contact__time" dateTime={contact.lastMessage.sentAt}>
                  {formatListTimestamp(contact.lastMessage.sentAt)}
                </time>
              ) : null}
            </span>
            <span className={`tx-contact__role tx-contact__role--${STAFF_ROLE_THEME[contact.role].tone}`}>
              {contactRoleLabel(contact.role)}
            </span>
            <span className="tx-contact__bottom">
              <span className="tx-contact__preview">{previewText(contact)}</span>
              {unread ? (
                <span className="tx-contact__unread" aria-label={`${contact.unreadCount} unread`}>
                  {contact.unreadCount}
                </span>
              ) : null}
            </span>
          </span>
        </button>
      </li>
    );
  };

  return (
    <aside className="tx-contacts" aria-label="Conversations">
      <div className="tx-contacts__header">
        <label className="tx-contacts__search">
          <Icon name="search" size="sm" />
          <span className="tx-sr-only">Search contacts</span>
          <input
            type="search"
            value={directory.search}
            onChange={handleSearch}
            placeholder="Search by name, email or role…"
            maxLength={MAX_SEARCH_LENGTH}
            autoComplete="off"
            spellCheck={false}
          />
          {isSearching ? (
            <button
              type="button"
              className="tx-contacts__search-clear-btn"
              onClick={() => directory.setSearch('')}
              aria-label="Clear search"
              title="Clear search"
            >
              ×
            </button>
          ) : null}
        </label>
        <div className="tx-contacts__meta-row">
          <span className="tx-contacts__count">
            {isSearching ? `Matching "${directory.search.trim()}"` : filterLabel(directory.roleFilter, allLabel)}
            <span className="tx-contacts__count-pill">{directory.visible.length}</span>
          </span>
          {isSearching ? (
            <button type="button" className="tx-contacts__reset-link" onClick={() => directory.setSearch('')}>
              Clear
            </button>
          ) : null}
        </div>
      </div>

      {directory.visible.length > 0 ? (
        <ul className="tx-contacts__list">{directory.visible.map(renderContact)}</ul>
      ) : (
        <div className="tx-contacts__empty">
          <p className="tx-contacts__empty-text">
            {isSearching ? `No one matches "${directory.search.trim()}".` : emptyGroupText}
          </p>
          {isSearching ? (
            <button type="button" className="tx-contacts__empty-btn" onClick={() => directory.setSearch('')}>
              Reset search
            </button>
          ) : null}
        </div>
      )}
    </aside>
  );
}
