import { Button } from '@/shared';
import {
  NOTIFICATION_CATEGORIES,
  type NotificationCategoryFilter,
  type NotificationReadFilter
} from '../../shared/notifications.types';
import { NOTIFICATION_CATEGORY_CONFIG } from './config/notificationCategories';
import './NotificationsToolbar.css';

export interface NotificationsToolbarProps {
  readonly totalCount: number;
  readonly unreadCount: number;
  readonly readFilter: NotificationReadFilter;
  readonly categoryFilter: NotificationCategoryFilter;
  readonly markingAll: boolean;
  readonly onReadFilterChange: (filter: NotificationReadFilter) => void;
  readonly onCategoryFilterChange: (filter: NotificationCategoryFilter) => void;
  readonly onMarkAllRead: () => void;
}

const CATEGORY_FILTERS: readonly { value: NotificationCategoryFilter; label: string }[] = Object.freeze([
  { value: 'ALL', label: 'All categories' },
  ...NOTIFICATION_CATEGORIES.map((category) => ({ value: category, label: NOTIFICATION_CATEGORY_CONFIG[category].label }))
]);

/** Read-state switch, category chips and the "mark all as read" action. */
export function NotificationsToolbar({
  totalCount,
  unreadCount,
  readFilter,
  categoryFilter,
  markingAll,
  onReadFilterChange,
  onCategoryFilterChange,
  onMarkAllRead
}: NotificationsToolbarProps) {
  const readOptions: readonly { value: NotificationReadFilter; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: totalCount },
    { value: 'unread', label: 'Unread', count: unreadCount }
  ];

  return (
    <div className="tx-notif-toolbar">
      <div className="tx-notif-toolbar__row">
        <div className="tx-notif-toolbar__segments" role="radiogroup" aria-label="Show">
          {readOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={readFilter === option.value}
              className={readFilter === option.value ? 'tx-notif-toolbar__segment tx-notif-toolbar__segment--active' : 'tx-notif-toolbar__segment'}
              onClick={() => onReadFilterChange(option.value)}
            >
              {option.label}
              <span className="tx-notif-toolbar__count">{option.count}</span>
            </button>
          ))}
        </div>
        <Button
          variant="secondary"
          iconName="check-check"
          onClick={onMarkAllRead}
          loading={markingAll}
          loadingLabel="Marking…"
          disabled={unreadCount === 0}
        >
          Mark all as read
        </Button>
      </div>
      <div className="tx-notif-toolbar__chips" role="radiogroup" aria-label="Category">
        {CATEGORY_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            role="radio"
            aria-checked={categoryFilter === filter.value}
            className={categoryFilter === filter.value ? 'tx-notif-chip tx-notif-chip--active' : 'tx-notif-chip'}
            onClick={() => onCategoryFilterChange(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}
