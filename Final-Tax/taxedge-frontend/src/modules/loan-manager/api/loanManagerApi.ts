import { logger } from '@/core/logging/logger';
import { fetchUnreadNotificationCount, fetchWorkflowSummary, type CaseSummary } from '@/modules/workflow';

/**
 * Loan Manager data access. The workflow backend scopes every response to the signed-in
 * loan manager; this module never sends a role, team or user id it could forge.
 */
export const loanManagerApi = Object.freeze({
  async summary(): Promise<CaseSummary> {
    try {
      return await fetchWorkflowSummary();
    } catch (error) {
      logger.warn('Loan Manager summary is unavailable.', { error });
      throw error;
    }
  },

  async unreadNotifications(): Promise<number> {
    try {
      return await fetchUnreadNotificationCount();
    } catch (error) {
      logger.warn('Loan Manager notifications are unavailable.', { error });
      throw error;
    }
  }
});
