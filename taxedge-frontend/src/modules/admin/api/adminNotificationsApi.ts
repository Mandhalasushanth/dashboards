import { API_ENDPOINTS, apiClient } from '@/core/api';
import { environment } from '@/core/config/environment';
import type { AdminNotification } from '../shared/notifications.types';
import { parseNotificationList } from '../validation/notificationSchema';
import { createDataCache } from './adminDataCache';
import { invalidateAdminNavCounters } from './adminNavigationApi';

/** Last notification list shown, so revisiting the page is instant. */
export const adminNotificationsCache = createDataCache<readonly AdminNotification[]>();

interface NotificationsGateway {
  list(): Promise<unknown>;
  setRead(id: string, read: boolean): Promise<void>;
  readAll(): Promise<void>;
  remove(id: string): Promise<void>;
}

const itemPath = (id: string) => `${API_ENDPOINTS.admin.notifications}/${encodeURIComponent(id)}`;

const httpGateway: NotificationsGateway = Object.freeze({
  list: () => apiClient.get<unknown>(API_ENDPOINTS.admin.notifications),
  setRead: async (id: string, read: boolean) => {
    await apiClient.patch<unknown>(itemPath(id), { read });
  },
  readAll: async () => {
    await apiClient.post<unknown>(API_ENDPOINTS.admin.notificationsReadAll);
  },
  remove: async (id: string) => {
    await apiClient.delete<unknown>(itemPath(id));
  }
});

async function getGateway(): Promise<NotificationsGateway> {
  // Statically removed from production builds, like the demo authentication gateway.
  if (import.meta.env.DEV && environment.demoAuthEnabled) {
    const { demoNotificationsStore } = await import('../dev/demoNotificationsStore');
    return demoNotificationsStore;
  }
  return httpGateway;
}

/** Runs a change, then tells the sidebar and header badges to refresh their counts. */
async function mutate(change: (gateway: NotificationsGateway) => Promise<void>): Promise<void> {
  await change(await getGateway());
  invalidateAdminNavCounters();
}

export async function fetchAdminNotifications(): Promise<AdminNotification[]> {
  const gateway = await getGateway();
  const items = parseNotificationList(await gateway.list());
  adminNotificationsCache.remember(items);
  return items;
}

export const setNotificationRead = (id: string, read: boolean) => mutate((gateway) => gateway.setRead(id, read));

export const markAllNotificationsRead = () => mutate((gateway) => gateway.readAll());

export const deleteNotification = (id: string) => mutate((gateway) => gateway.remove(id));
