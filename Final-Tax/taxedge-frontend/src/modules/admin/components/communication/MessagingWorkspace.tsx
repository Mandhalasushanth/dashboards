import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, DeferredContent, LoadingSpinner, useDocumentTitle } from '@/shared';
import { useConversation } from '../../hooks/useConversation';
import { useStaffContacts } from '../../hooks/useStaffContacts';
import type { MessagingApi, MessagingPresentation } from '../../shared/communication.types';
import { CommunicationToolbar } from './CommunicationToolbar';
import { ContactList } from './ContactList';
import { ConversationPanel } from './ConversationPanel';
import './MessagingWorkspace.css';

export interface MessagingWorkspaceProps {
  readonly title: string;
  /** The workspace's own data access; the server decides who appears in it. */
  readonly api: MessagingApi;
  readonly presentation: MessagingPresentation;
}

const CONTACT_PARAM = 'contact';

/**
 * Communication page shared by every workspace: role tabs, contact directory and conversation.
 * Admin, managers and agents use the same layout; each passes its own API and contact rules.
 * The open conversation lives in the URL (?contact=…), so it survives refresh and mobile back navigation.
 */
export function MessagingWorkspace({ title, api, presentation }: MessagingWorkspaceProps) {
  useDocumentTitle(title);
  const [searchParams, setSearchParams] = useSearchParams();
  const directory = useStaffContacts(api);
  const selectedId = searchParams.get(CONTACT_PARAM);
  // The open conversation must belong to the tab being shown: switching to another group (Agents, Customers,
  // Administrator) closes a conversation that is not part of it instead of leaving it on screen.
  const selected =
    directory.contacts.find(
      (contact) => contact.id === selectedId && (directory.roleFilter === 'ALL' || contact.role === directory.roleFilter)
    ) ?? null;
  const conversation = useConversation(api, selected, { onRead: directory.markReadLocally, onSent: directory.recordSent });

  const openContact = (contactId: string) => setSearchParams({ [CONTACT_PARAM]: contactId });
  const backToList = () => setSearchParams({}, { replace: true });

  const totalUnread = useMemo(
    () => directory.contacts.reduce((sum, contact) => sum + contact.unreadCount, 0),
    [directory.contacts]
  );

  if (directory.status === 'loading') {
    return (
      <DeferredContent>
        <div className="tx-communication__state">
          <LoadingSpinner size="lg" label="Loading contacts" />
        </div>
      </DeferredContent>
    );
  }

  return (
    <div className="tx-communication-page">
      <CommunicationToolbar
        filters={presentation.filters}
        allLabel={presentation.allLabel}
        roleFilter={directory.roleFilter}
        roleCounts={directory.roleCounts}
        unreadCount={totalUnread}
        onRoleFilterChange={directory.setRoleFilter}
      />
      {directory.status === 'error' ? (
        <div className="tx-communication__alert" role="alert">
          <span>{directory.error}</span>
          <Button variant="secondary" iconName="rotate-ccw" onClick={directory.reload}>
            Try again
          </Button>
        </div>
      ) : null}
      <div className={selected ? 'tx-communication tx-communication--chat-open' : 'tx-communication'}>
        <ContactList
          directory={directory}
          allLabel={presentation.allLabel}
          emptyGroupText={presentation.emptyGroupText}
          selectedId={selected?.id ?? null}
          onSelect={openContact}
        />
        <ConversationPanel contact={selected} placeholderText={presentation.placeholderText} conversation={conversation} onBack={backToList} />
      </div>
    </div>
  );
}
