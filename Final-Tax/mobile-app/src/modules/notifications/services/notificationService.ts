import { useNotificationStore } from '../../../store/notificationStore';
import type { AppNotification, NotificationType } from '../../../types/domain';

export const notificationService = {
  getNotifications: (): AppNotification[] =>
    useNotificationStore.getState().notifications,

  getUnreadCount: (): number =>
    useNotificationStore.getState().unreadCount,

  markAllAsRead: () =>
    useNotificationStore.getState().markAllAsRead(),

  markAsRead: (id: string) =>
    useNotificationStore.getState().markAsRead(id),

  clearAll: () =>
    useNotificationStore.getState().clearAll(),

  /**
   * Generic notification dispatcher
   */
  notify: (title: string, body: string, type: NotificationType = "general") => {
    useNotificationStore.getState().addNotification(title, body, type);
  },

  /**
   * 1. Application / Service Submitted
   */
  notifyApplicationSubmitted: (serviceName: string, _appId?: string) => {
    const sName = serviceName || "service";
    const lower = sName.toLowerCase();
    const type: NotificationType = lower.includes("gst")
      ? "gst"
      : lower.includes("itr")
      ? "itr"
      : lower.includes("loan")
      ? "loans"
      : lower.includes("insurance")
      ? "insurance"
      : "general";

    useNotificationStore.getState().addNotification(
      "Application Submitted",
      `Your ${sName} request has been submitted successfully.`,
      type
    );
  },

  /**
   * 2. Documents Required
   */
  notifyDocumentsRequired: (serviceName: string) => {
    useNotificationStore.getState().addNotification(
      "Documents Required",
      `Our CA has requested additional documents for your ${serviceName || "application"}.`,
      "document"
    );
  },

  /**
   * 3. Application Approved
   */
  notifyApplicationApproved: (serviceName: string) => {
    useNotificationStore.getState().addNotification(
      "Application Approved",
      `Your ${serviceName || "application"} has been approved.`,
      "general"
    );
  },

  /**
   * 4. Application Rejected / Requires Correction
   */
  notifyApplicationUpdate: (serviceName?: string, reason?: string) => {
    useNotificationStore.getState().addNotification(
      "Application Update",
      reason || `Your ${serviceName || "application"} requires corrections.`,
      "document"
    );
  },

  /**
   * 5. Payment Successful
   */
  notifyPaymentSuccessful: (amount?: number, serviceName?: string) => {
    const formattedAmount = amount ? `₹${amount.toLocaleString("en-IN")}` : "";
    const body =
      amount && serviceName
        ? `Your payment of ${formattedAmount} for ${serviceName} was received successfully.`
        : amount
        ? `Your payment of ${formattedAmount} has been received successfully.`
        : "Your payment has been received successfully.";

    useNotificationStore.getState().addNotification(
      "Payment Successful",
      body,
      "payment"
    );
  },

  /**
   * 6. GST Certificate Ready
   */
  notifyCertificateReady: (serviceName = "GST", identifier?: string) => {
    const target = identifier ? ` for ${identifier}` : "";
    useNotificationStore.getState().addNotification(
      "Certificate Ready",
      `Your ${serviceName} Certificate${target} is now available for download.`,
      "gst"
    );
  },

  /**
   * 7. Upcoming Filing / Compliance Reminder
   */
  notifyUpcomingFilingReminder: (filingName = "GST", dueDate?: string) => {
    const dueInfo = dueDate ? ` (${dueDate})` : "";
    useNotificationStore.getState().addNotification(
      "Upcoming Filing Reminder",
      `Your ${filingName} filing due date${dueInfo} is approaching.`,
      "gst"
    );
  },
};

export default notificationService;
