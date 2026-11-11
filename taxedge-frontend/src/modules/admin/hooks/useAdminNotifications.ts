import { useCallback, useEffect, useMemo, useState } from 'react';
import { defaultMessageFor, isApiError } from '@/core/api';
import { logger } from '@/core/logging/logger';
import {
  adminNotificationsCache,
  deleteNotification,
  fetchAdminNotifications,
  markAllNotificationsRead,
  setNotificationRead
} from '../api/adminNotificationsApi';
import type {
  AdminNotification,
  NotificationCategoryFilter,
  NotificationReadFilter
} from '../shared/notifications.types';

export type NotificationsStatus = 'loading' | 'ready' | 'error';

export interface AdminNotificationsController {
  readonly status: NotificationsStatus;
  readonly error: string | null;
  readonly visible: readonly AdminNotification[];
  readonly totalCount: number;
  readonly unreadCount: number;
  readonly readFilter: NotificationReadFilter;
  readonly categoryFilter: NotificationCategoryFilter;
  /** ids with a request in flight, so their buttons can be disabled. */
  readonly pendingIds: ReadonlySet<string>;
  readonly markingAll: boolean;
  readonly setReadFilter: (filter: NotificationReadFilter) => void;
  readonly setCategoryFilter: (filter: NotificationCategoryFilter) => void;
  readonly toggleRead: (notification: AdminNotification) => Promise<void>;
  readonly markAllRead: () => Promise<void>;
  readonly dismiss: (id: string) => Promise<void>;
  readonly reload: () => void;
}

function toMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }
  logger.error('Unexpected notifications failure.', error);
  return defaultMessageFor('UNKNOWN');
}

function matchesFilters(item: AdminNotification, read: NotificationReadFilter, category: NotificationCategoryFilter): boolean {
  return (read === 'all' || !item.read) && (category === 'ALL' || item.category === category);
}

/**
 * Loads admin notifications and applies read/dismiss changes optimistically:
 * the list updates at once and rolls back if the server rejects the change.
 */
export function useAdminNotifications(): AdminNotificationsController {
  const [cached] = useState(() => adminNotificationsCache.peek());
  const [items, setItems] = useState<readonly AdminNotification[]>(cached ?? []);
  const [status, setStatus] = useState<NotificationsStatus>(cached ? 'ready' : 'loading');
  const [error, setError] = useState<string | null>(null);
  const [readFilter, setReadFilter] = useState<NotificationReadFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<NotificationCategoryFilter>('ALL');
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(new Set());
  const [markingAll, setMarkingAll] = useState(false);
  const [loadCount, setLoadCount] = useState(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      // With a cached list on screen, refresh quietly instead of showing the spinner again.
      if (!adminNotificationsCache.peek()) {
        setStatus('loading');
      }
      try {
        const result = await fetchAdminNotifications();
        if (active) {
          setItems(result);
          setError(null);
          setStatus('ready');
        }
      } catch (loadError) {
        if (active) {
          setError(toMessage(loadError));
          setStatus(adminNotificationsCache.peek() ? 'ready' : 'error');
        }
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [loadCount]);

  // Keep the cache in step with read / dismiss changes, so the next visit shows the latest state.
  useEffect(() => {
    if (status === 'ready') {
      adminNotificationsCache.remember(items);
    }
  }, [items, status]);

  const visible = useMemo(
    () => items.filter((item) => matchesFilters(item, readFilter, categoryFilter)),
    [items, readFilter, categoryFilter]
  );
  const unreadCount = useMemo(() => items.filter((item) => !item.read).length, [items]);

  const withPending = useCallback(async (id: string, optimistic: readonly AdminNotification[], request: () => Promise<void>) => {
    const previous = items;
    setItems(optimistic);
    setPendingIds((current) => new Set(current).add(id));
    setError(null);
    try {
      await request();
    } catch (requestError) {
      setItems(previous);
      setError(toMessage(requestError));
    } finally {
      setPendingIds((current) => new Set([...current].filter((pendingId) => pendingId !== id)));
    }
  }, [items]);

  const toggleRead = useCallback(
    (notification: AdminNotification) =>
      withPending(
        notification.id,
        items.map((item) => (item.id === notification.id ? { ...item, read: !item.read } : item)),
        () => setNotificationRead(notification.id, !notification.read)
      ),
    [items, withPending]
  );

  const dismiss = useCallback(
    (id: string) => withPending(id, items.filter((item) => item.id !== id), () => deleteNotification(id)),
    [items, withPending]
  );

  const markAllRead = useCallback(async () => {
    const previous = items;
    setItems(items.map((item) => ({ ...item, read: true })));
    setMarkingAll(true);
    setError(null);
    try {
      await markAllNotificationsRead();
    } catch (requestError) {
      setItems(previous);
      setError(toMessage(requestError));
    } finally {
      setMarkingAll(false);
    }
  }, [items]);

  const reload = useCallback(() => setLoadCount((count) => count + 1), []);

  return {
    status,
    error,
    visible,
    totalCount: items.length,
    unreadCount,
    readFilter,
    categoryFilter,
    pendingIds,
    markingAll,
    setReadFilter,
    setCategoryFilter,
    toggleRead,
    markAllRead,
    dismiss,
    reload
  };
}
