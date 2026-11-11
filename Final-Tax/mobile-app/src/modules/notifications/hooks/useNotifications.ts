import { useNotificationStore } from '../store/notificationStore';

export function useNotifications() {
  const notifications = useNotificationStore((s) => s.notifications);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);

  return { notifications, markAllAsRead };
}
export default useNotifications;
