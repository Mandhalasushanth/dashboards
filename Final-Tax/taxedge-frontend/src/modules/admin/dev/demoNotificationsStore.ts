import type { NotificationCategory } from '../shared/notifications.types';

/**
 * DEVELOPMENT ONLY. Sample notifications kept in this browser's localStorage while the backend
 * is unavailable, so the page can be exercised. Loaded through a dynamic import guarded by
 * `import.meta.env.DEV`; excluded from production bundles.
 */
const STORAGE_KEY = 'taxedge.demo.adminNotifications.v2';
// Drop the old copy, which still holds the sample entries.
try {
  window.localStorage.removeItem('taxedge.demo.adminNotifications');
} catch {
  /* storage unavailable */
}

interface StoredNotification {
  readonly id: string;
  readonly category: NotificationCategory;
  readonly title: string;
  readonly message: string;
  readonly createdAt: string;
  readonly read: boolean;
  readonly link: string | null;
}

/** Starts empty: only what really happens in this session is listed (no sample data). */
function seed(): StoredNotification[] {
  return [];
}

function load(): StoredNotification[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredNotification[]) : persist(seed());
  } catch {
    return seed();
  }
}

function persist(items: StoredNotification[]): StoredNotification[] {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage may be unavailable (private mode); changes then last for this page view only.
  }
  return items;
}

export const demoNotificationsStore = Object.freeze({
  async list(): Promise<unknown> {
    return load();
  },

  async setRead(id: string, read: boolean): Promise<void> {
    persist(load().map((item) => (item.id === id ? { ...item, read } : item)));
  },

  async readAll(): Promise<void> {
    persist(load().map((item) => ({ ...item, read: true })));
  },

  async remove(id: string): Promise<void> {
    persist(load().filter((item) => item.id !== id));
  },

  /** Unread count, used for the demo-mode bell and sidebar badges. */
  unreadCount(): number {
    return load().filter((item) => !item.read).length;
  }
});
