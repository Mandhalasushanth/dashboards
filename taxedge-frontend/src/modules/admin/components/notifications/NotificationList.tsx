import { getDayGroup, type DayGroup } from '@/core/utils/dateUtils';
import type { AdminNotification } from '../../shared/notifications.types';
import { NotificationItem } from './NotificationItem';
import './NotificationList.css';

export interface NotificationListProps {
  readonly notifications: readonly AdminNotification[];
  readonly pendingIds: ReadonlySet<string>;
  readonly onToggleRead: (notification: AdminNotification) => void;
  readonly onDismiss: (id: string) => void;
}

const GROUP_ORDER: readonly DayGroup[] = Object.freeze(['Today', 'Yesterday', 'Earlier']);

/** Notifications grouped under Today / Yesterday / Earlier, newest first within each group. */
export function NotificationList({ notifications, pendingIds, onToggleRead, onDismiss }: NotificationListProps) {
  const now = new Date();
  const groups = GROUP_ORDER.map((group) => ({
    group,
    items: notifications.filter((item) => getDayGroup(item.createdAt, now) === group)
  })).filter((entry) => entry.items.length > 0);

  return (
    <div className="tx-notif-list">
      {groups.map(({ group, items }) => (
        <section key={group} className="tx-notif-list__group" aria-labelledby={`tx-notif-group-${group}`}>
          <h2 id={`tx-notif-group-${group}`} className="tx-notif-list__label">
            {group}
            <span className="tx-notif-list__label-count">{items.length}</span>
          </h2>
          <ul className="tx-notif-list__card">
            {items.map((item) => (
              <NotificationItem
                key={item.id}
                notification={item}
                pending={pendingIds.has(item.id)}
                onToggleRead={onToggleRead}
                onDismiss={onDismiss}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
