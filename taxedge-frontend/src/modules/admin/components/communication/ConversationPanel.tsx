import { DOMAIN_LABELS, ROLE_PROFILES } from '@/modules/authentication';
import { Button, DeferredContent, Icon, LoadingSpinner } from '@/shared';
import type { ConversationController } from '../../hooks/useConversation';
import type { StaffContact } from '../../shared/communication.types';
import { ContactAvatar } from './ContactAvatar';
import { STAFF_ROLE_THEME, contactRoleLabel } from './config/staffRoleTheme';
import { MessageComposer } from './MessageComposer';
import { MessageThread } from './MessageThread';
import './ConversationPanel.css';

export interface ConversationPanelProps {
  readonly contact: StaffContact | null;
  readonly placeholderText: string;
  readonly conversation: ConversationController;
  /** Mobile only: returns to the staff list. */
  readonly onBack: () => void;
}

function firstName(name: string): string {
  return name.split(/\s+/)[0] ?? name;
}

/** Right pane: staff header with presence, the scrollable message thread, and composer. */
export function ConversationPanel({ contact, placeholderText, conversation, onBack }: ConversationPanelProps) {
  if (!contact) {
    return (
      <section className="tx-conversation tx-conversation--placeholder" aria-label="Conversation placeholder">
        <span className="tx-conversation__placeholder-icon" aria-hidden="true">
          <Icon name="message-square" size="lg" />
        </span>
        <h2 className="tx-conversation__placeholder-title">Select a conversation</h2>
        <p className="tx-conversation__placeholder-desc">
          {placeholderText}
        </p>
        <div className="tx-conversation__placeholder-hint">
          <Icon name="shield-check" size="sm" />
          <span>Messages are encrypted and synchronized with staff workspaces</span>
        </div>
      </section>
    );
  }

  const profile = contact.role === 'CUSTOMER' ? null : ROLE_PROFILES[contact.role];

  return (
    <section className="tx-conversation" aria-label={`Conversation with ${contact.name}`}>
      <header className="tx-conversation__header">
        <button type="button" className="tx-conversation__back" onClick={onBack} aria-label="Back to contacts">
          <Icon name="chevron-left" />
        </button>
        <ContactAvatar name={contact.name} role={contact.role} size="lg" />
        <div className="tx-conversation__identity">
          <div className="tx-conversation__name-row">
            <h2 className="tx-conversation__name">{contact.name}</h2>
            <span className="tx-conversation__presence" title="Active on platform">
              <span className="tx-conversation__presence-dot" aria-hidden="true" />
              <span>Active</span>
            </span>
          </div>
          <div className="tx-conversation__details">
            <span className={`tx-conversation__role tx-conversation__role--${STAFF_ROLE_THEME[contact.role].tone}`}>
              {contactRoleLabel(contact.role)}
            </span>
            {profile ? <span className="tx-conversation__area">{DOMAIN_LABELS[profile.domain]}</span> : null}
            {contact.email ? <span className="tx-conversation__email">{contact.email}</span> : null}
          </div>
        </div>
      </header>

      {conversation.status === 'loading' ? (
        <div className="tx-conversation__state">
          <DeferredContent>
            <LoadingSpinner size="lg" label="Loading messages" />
          </DeferredContent>
        </div>
      ) : conversation.status === 'error' ? (
        <div className="tx-conversation__state" role="alert">
          <p>{conversation.error}</p>
          <Button variant="secondary" iconName="rotate-ccw" onClick={conversation.reload}>
            Try again
          </Button>
        </div>
      ) : (
        <MessageThread messages={conversation.messages} contactFirstName={firstName(contact.name)} />
      )}

      {conversation.error && conversation.status === 'ready' ? (
        <p className="tx-conversation__error" role="alert">
          <Icon name="alert-circle" size="sm" />
          <span>{conversation.error}</span>
        </p>
      ) : null}

      <MessageComposer
        conversationKey={contact.id}
        recipientName={firstName(contact.name)}
        sending={conversation.sending}
        onSend={conversation.send}
      />
    </section>
  );
}
