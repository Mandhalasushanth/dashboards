export type NotificationType = 'gst' | 'itr' | 'loans' | 'insurance' | 'payment' | 'document' | 'general';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: NotificationType;
  actionRoute?: string;
}
