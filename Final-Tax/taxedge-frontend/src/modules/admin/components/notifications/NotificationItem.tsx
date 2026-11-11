import { useNavigate } from 'react-router-dom';
import { formatDateTime, formatRelativeTime } from '@/core/utils/dateUtils';
import { Icon } from '@/shared';
import type { AdminNotification } from '../../shared/notifications.types';
import { NOTIFICATION_CATEGORY_CONFIG } from './config/notificationCategories';
import './NotificationItem.css';

export interface NotificationItemProps {
  readonly notification: AdminNotification;
  readonly pending: boolean;
  readonly onToggleRead: (notification: AdminNotification) => void;
  readonly onDismiss: (id: string) => void;
}

/** One notification row: category tile, text, time, and read / open / dismiss actions. */
export function NotificationItem({ notification, pending, onToggleRead, onDismiss }: NotificationItemProps) {
  const navigate = useNavigate();
  const category = NOTIFICATION_CATEGORY_CONFIG[notification.category];
  const classes = ['tx-notif-item', notification.read ? '' : 'tx-notif-item--unread', pending ? 'tx-notif-item--pending' : '']
    .filter(Boolean)
    .join(' ');

  const open = () => {
    if (!notification.link) {
      return;
    }
    if (!notification.read) {
      onToggleRead(notification);
    }
    navigate(notification.link);
  };

  return (
    <li className={classes}>
      <span className={`tx-notif-item__tile tx-notif-item__tile--${category.tone}`}>
        <Icon name={category.iconName} />
      </span>

      <div className="tx-notif-item__body">
        <div className="tx-notif-item__heading">
          {notification.read ? null : <span className="tx-notif-item__dot" aria-label="Unread" />}
          <h3 className="tx-notif-item__title">{notification.title}</h3>
        </div>
        {notification.message ? <p className="tx-notif-item__message">{notification.message}</p> : null}
        <p className="tx-notif-item__meta">
          <span className="tx-notif-item__category">{category.label}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={notification.createdAt} title={formatDateTime(notification.createdAt)}>
            {formatRelativeTime(notification.createdAt)}
          </time>
        </p>
      </div>

      <div className="tx-notif-item__actions">
        {notification.link ? (
          <button type="button" className="tx-notif-item__open" onClick={open} disabled={pending}>
            <span>Open</span>
            <Icon name="arrow-right" size="sm" />
          </button>
        ) : null}
        <button
          type="button"
          className="tx-notif-item__icon-button"
          onClick={() => onToggleRead(notification)}
          disabled={pending}
          aria-label={notification.read ? `Mark "${notification.title}" as unread` : `Mark "${notification.title}" as read`}
          title={notification.read ? 'Mark as unread' : 'Mark as read'}
        >
          <Icon name={notification.read ? 'mail' : 'check'} size="sm" />
        </button>
        <button
          type="button"
          className="tx-notif-item__icon-button tx-notif-item__icon-button--danger"
          onClick={() => onDismiss(notification.id)}
          disabled={pending}
          aria-label={`Dismiss "${notification.title}"`}
          title="Dismiss"
        >
          <Icon name="trash" size="sm" />
        </button>
      </div>
    </li>
  );
}
