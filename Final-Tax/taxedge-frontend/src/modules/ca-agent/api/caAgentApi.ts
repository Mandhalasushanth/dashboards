import { logger } from '@/core/logging/logger';
import { fetchUnreadNotificationCount, fetchWorkflowSummary, type CaseSummary } from '@/modules/workflow';

/**
 * CA Agent data access. The workflow backend scopes every response to the signed-in
 * ca agent; this module never sends a role, team or user id it could forge.
 */
export const caAgentApi = Object.freeze({
  async summary(): Promise<CaseSummary> {
    try {
      return await fetchWorkflowSummary();
    } catch (error) {
      logger.warn('CA Agent summary is unavailable.', { error });
      throw error;
    }
  },

  async unreadNotifications(): Promise<number> {
    try {
      return await fetchUnreadNotificationCount();
    } catch (error) {
      logger.warn('CA Agent notifications are unavailable.', { error });
      throw error;
    }
  }
});
