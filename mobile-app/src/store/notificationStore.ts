import { create } from "zustand";
import { localStorage } from "@/core/storage/localStorage";
import { authStorage } from "@/modules/authentication/services/authStorage";
import type { AppNotification, NotificationType } from "@/types/domain";
import { logger } from "@/core/logging/logger";
import { getErrorMessage } from "@/core/error-handling/errorMessage";

const getNotificationsStorageKey = (): string => {
  const activeMobile = String(authStorage.getSession()?.activeMobile || "").replace(/\D/g, "");
  return activeMobile ? `@finsolz_notifications_${activeMobile}` : "@finsolz_notifications_anonymous";
};

/**
 * Notifications created before `createdAt` existed stored only the display
 * string "Just now". Their id is `notif_<Date.now() at creation>_<random>`,
 * so the real creation time is recovered from the id. Anything else keeps no
 * createdAt and is shown as "Date unavailable" (never as a current time).
 */
const withCreatedAt = (n: AppNotification): AppNotification => {
  if (n.createdAt) return n;
  const match = /^notif_(\d{12,14})_/.exec(n.id);
  if (!match) return n;
  const created = new Date(Number(match[1]));
  return isNaN(created.getTime()) ? n : { ...n, createdAt: created.toISOString() };
};

export interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (
    title: string,
    body: string,
    type: NotificationType,
  ) => void;
  markAllAsRead: () => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
  loadPersisted: () => Promise<void>;
}

const persistNotifications = async (notifications: AppNotification[]) => {
  try {
    await localStorage.setItem(getNotificationsStorageKey(), JSON.stringify(notifications));
  } catch (err) {
    logger.warn("[NotificationStore] Failed to persist notifications", { error: getErrorMessage(err) });
  }
};

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (title, body, type) => {
    set((state) => {
      // The notification is created now, so now is its real creation time.
      const createdAtMs = Date.now();
      const newNotif: AppNotification = {
        id: `notif_${createdAtMs}_${Math.floor(Math.random() * 10000)}`,
        title,
        body,
        type,
        read: false,
        createdAt: new Date(createdAtMs).toISOString(),
      };
      const newNotifs = [newNotif, ...state.notifications];
      persistNotifications(newNotifs);
      return {
        notifications: newNotifs,
        unreadCount: newNotifs.filter((n) => !n.read).length,
      };
    });
  },

  markAllAsRead: () => {
    set((state) => {
      const updated = state.notifications.map((n) => ({ ...n, read: true }));
      persistNotifications(updated);
      return {
        notifications: updated,
        unreadCount: 0,
      };
    });
  },

  markAsRead: (id) => {
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      );
      persistNotifications(updated);
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.read).length,
      };
    });
  },

  clearAll: () => {
    persistNotifications([]);
    set({ notifications: [], unreadCount: 0 });
  },

  loadPersisted: async () => {
    try {
      const raw = await localStorage.getItem(getNotificationsStorageKey());
      if (raw) {
        const parsed: AppNotification[] = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const real = parsed
            .filter((n) => n && n.id && !n.id.startsWith("notif-"))
            .map(withCreatedAt);
          set({
            notifications: real,
            unreadCount: real.filter((n) => !n.read).length,
          });
          return;
        }
      }
    } catch (err) {
      logger.warn("[NotificationStore] Failed to load notifications from storage", { error: getErrorMessage(err) });
    }
    set({ notifications: [], unreadCount: 0 });
  },
}));

// Hydrate saved notifications on application start
useNotificationStore.getState().loadPersisted().catch((err) => {
  logger.debug("[NotificationStore] Initial loadPersisted skipped/failed", { error: getErrorMessage(err) });
});

export default useNotificationStore;
