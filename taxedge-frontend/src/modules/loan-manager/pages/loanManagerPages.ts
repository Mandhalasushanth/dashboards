import type { ComponentType } from 'react';
import type { LoanManagerSectionId } from '../shared/loanManager.types';

type PageLoader = () => Promise<{ default: ComponentType }>;

/** The profile page opened from the sidebar footer. */
export const loadLoanManagerProfilePage: PageLoader = () => import('../components/profile/LoanManagerProfileSection');

/**
 * Lazy page loader for every Loan Manager menu section, so each section ships as its own chunk.
 * "overview" is the dashboard; the rest live in loan-manager/components/<section>/.
 */
export const LOAN_MANAGER_PAGE_LOADERS: Readonly<Record<LoanManagerSectionId, PageLoader>> = Object.freeze({
  overview: () => import('../dashboard/LoanManagerDashboardPage'),
  verify: () => import('../components/to-verify/ToVerifySection'),
  mine: () => import('../components/my-applications/MyApplicationsSection'),
  payment: () => import('../components/awaiting-payment/AwaitingPaymentSection'),
  working: () => import('../components/with-agents/WithAgentsSection'),
  communication: () => import('../components/communication/CommunicationSection'),
  notifications: () => import('../components/notifications/NotificationsSection')
});
