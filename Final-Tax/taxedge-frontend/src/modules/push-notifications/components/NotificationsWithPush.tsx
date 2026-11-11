import { useState, type ReactNode } from 'react';
import { Icon } from '@/shared';
import { usePushNotifications, type RecipientLoader } from '../hooks/usePushNotifications';
import type { PushSenderMode } from '../shared/pushNotification.types';
import { PushComposer } from './PushComposer';
import { SentPushList } from './SentPushList';
import './NotificationsWithPush.css';

export interface NotificationsWithPushProps {
  readonly mode: PushSenderMode;
  /** The page's existing inbox, shown under the first tab. */
  readonly inbox: ReactNode;
  readonly loadRecipients: RecipientLoader;
}

type Tab = 'INBOX' | 'SEND';

function SendTab({ mode, loadRecipients }: Omit<NotificationsWithPushProps, 'inbox'>) {
  const controller = usePushNotifications(mode, loadRecipients);
  return (
    <div className="tx-push-page__send">
      <PushComposer controller={controller} />
      <SentPushList items={controller.sent} status={controller.sentStatus} onRetry={controller.reload} />
    </div>
  );
}

/** Notifications page with two tabs: what this user received, and push notifications to customers. */
export function NotificationsWithPush({ mode, inbox, loadRecipients }: NotificationsWithPushProps) {
  const [tab, setTab] = useState<Tab>('INBOX');

  // The admin has no inbox of their own: the page is only for sending to customers.
  if (mode === 'ADMIN') {
    return (
      <div className="tx-push-page">
        <SendTab mode={mode} loadRecipients={loadRecipients} />
      </div>
    );
  }

  const tabs: readonly { id: Tab; label: string; icon: 'inbox' | 'send' }[] = [
    { id: 'INBOX', label: 'My notifications', icon: 'inbox' },
    { id: 'SEND', label: 'Send to customers', icon: 'send' }
  ];

  return (
    <div className="tx-push-page">
      <div className="tx-push-page__tabs" role="tablist" aria-label="Notifications">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`tx-push-tab-${item.id}`}
            aria-selected={tab === item.id}
            aria-controls={`tx-push-panel-${item.id}`}
            className={`tx-push-page__tab${tab === item.id ? ' tx-push-page__tab--active' : ''}`}
            onClick={() => setTab(item.id)}
          >
            <Icon name={item.icon} size="sm" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`tx-push-panel-${tab}`} aria-labelledby={`tx-push-tab-${tab}`}>
        {tab === 'INBOX' ? inbox : <SendTab mode={mode} loadRecipients={loadRecipients} />}
      </div>
    </div>
  );
}
