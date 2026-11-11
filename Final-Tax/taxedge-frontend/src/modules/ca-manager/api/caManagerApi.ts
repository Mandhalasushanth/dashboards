import { logger } from '@/core/logging/logger';
import { fetchUnreadNotificationCount, fetchWorkflowSummary, type CaseSummary } from '@/modules/workflow';

/**
 * CA Manager data access. The workflow backend scopes every response to the signed-in
 * ca manager; this module never sends a role, team or user id it could forge.
 */
export const caManagerApi = Object.freeze({
  async summary(): Promise<CaseSummary> {
    try {
      return await fetchWorkflowSummary();
    } catch (error) {
      logger.warn('CA Manager summary is unavailable.', { error });
      throw error;
    }
  },

  async unreadNotifications(): Promise<number> {
    try {
      return await fetchUnreadNotificationCount();
    } catch (error) {
      logger.warn('CA Manager notifications are unavailable.', { error });
      throw error;
    }
  }
});
