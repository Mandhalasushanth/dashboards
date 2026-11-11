import type { ComponentType } from 'react';
import type { LoanAgentSectionId } from '../shared/loanAgent.types';

type PageLoader = () => Promise<{ default: ComponentType }>;

/** The profile page opened from the sidebar footer. */
export const loadLoanAgentProfilePage: PageLoader = () => import('../components/profile/LoanAgentProfileSection');

/**
 * Lazy page loader for every Loan Agent menu section, so each section ships as its own chunk.
 * "overview" is the dashboard; the rest live in loan-agent/components/<section>/.
 */
export const LOAN_AGENT_PAGE_LOADERS: Readonly<Record<LoanAgentSectionId, PageLoader>> = Object.freeze({
  overview: () => import('../dashboard/LoanAgentDashboardPage'),
  new: () => import('../components/new-assignments/NewAssignmentsSection'),
  missing: () => import('../components/waiting-for-documents/WaitingForDocumentsSection'),
  portal: () => import('../components/portal-work/PortalWorkSection'),
  completed: () => import('../components/completed/CompletedSection'),
  applications: () => import('../components/my-applications/MyApplicationsSection'),
  communication: () => import('../components/communication/CommunicationSection'),
  notifications: () => import('../components/notifications/NotificationsSection')
});
