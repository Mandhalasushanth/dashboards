import { formatDateTime, formatRelativeTime } from '@/core/utils/dateUtils';
import { Button, EmptyState, Icon, LoadingSpinner } from '@/shared';
import type { LoadStatus } from '../hooks/usePushNotifications';
import { AUDIENCE_LABELS, PUSH_CATEGORIES } from '../shared/pushNotification.config';
import type { SentPushNotification } from '../shared/pushNotification.types';
import './SentPushList.css';

export interface SentPushListProps {
  readonly items: readonly SentPushNotification[];
  readonly status: LoadStatus;
  readonly onRetry: () => void;
}

function reachText(item: SentPushNotification): string {
  if (item.audience === 'ALL_CUSTOMERS') return `${AUDIENCE_LABELS.ALL_CUSTOMERS} (${item.recipientCount})`;
  const more = item.recipientCount - item.recipientPreview.length;
  return `${item.recipientPreview.join(', ')}${more > 0 ? ` and ${more} more` : ''}`;
}

/** Push notifications this sender already sent, newest first. */
export function SentPushList({ items, status, onRetry }: SentPushListProps) {
  const body = () => {
    if (status === 'loading') {
      return (
        <div className="tx-push-sent__state">
          <LoadingSpinner label="Loading sent notifications" />
        </div>
      );
    }
    if (status === 'error') {
      return (
        <div className="tx-push-sent__state" role="alert">
          <p>Sent notifications could not be loaded.</p>
          <Button variant="secondary" iconName="rotate-ccw" onClick={onRetry}>
            Try again
          </Button>
        </div>
      );
    }
    if (items.length === 0) {
      return <EmptyState iconName="send" title="Nothing sent yet" message="Push notifications you send will be listed here." />;
    }
    return (
      <ul className="tx-push-sent__list">
        {items.map((item) => {
          const meta = PUSH_CATEGORIES[item.category];
          return (
            <li key={item.id} className="tx-push-sent__item">
              <span className="tx-push-sent__icon">
                <Icon name={meta?.icon ?? 'bell'} size="sm" />
              </span>
              <div className="tx-push-sent__content">
                <div className="tx-push-sent__top">
                  <span className="tx-push-sent__title">{item.title}</span>
                  <span className="tx-push-sent__tag">{meta?.label ?? item.category}</span>
                </div>
                <p className="tx-push-sent__message">{item.message}</p>
                <p className="tx-push-sent__meta">
                  <Icon name="users" size="sm" />
                  <span>{reachText(item)}</span>
                </p>
                <p className="tx-push-sent__meta">
                  <Icon name="clock" size="sm" />
                  <time dateTime={item.sentAt} title={formatDateTime(item.sentAt)}>
                    {formatRelativeTime(item.sentAt)}
                  </time>
                  <span>· by {item.sentBy}</span>
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <section className="tx-push-sent" aria-labelledby="tx-push-sent-title">
      <h2 id="tx-push-sent-title" className="tx-push-sent__heading">
        Sent notifications {status === 'ready' ? <span className="tx-push-sent__count">{items.length}</span> : null}
      </h2>
      {body()}
    </section>
  );
}
