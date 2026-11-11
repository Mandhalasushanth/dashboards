import { logger } from '@/core/logging/logger';
import { fetchUnreadNotificationCount, fetchWorkflowSummary, type CaseSummary } from '@/modules/workflow';

/**
 * Loan Agent data access. The workflow backend scopes every response to the signed-in
 * loan agent; this module never sends a role, team or user id it could forge.
 */
export const loanAgentApi = Object.freeze({
  async summary(): Promise<CaseSummary> {
    try {
      return await fetchWorkflowSummary();
    } catch (error) {
      logger.warn('Loan Agent summary is unavailable.', { error });
      throw error;
    }
  },

  async unreadNotifications(): Promise<number> {
    try {
      return await fetchUnreadNotificationCount();
    } catch (error) {
      logger.warn('Loan Agent notifications are unavailable.', { error });
      throw error;
    }
  }
});
