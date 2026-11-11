import type { ComponentType } from 'react';
import type { CaAgentSectionId } from '../shared/caAgent.types';

type PageLoader = () => Promise<{ default: ComponentType }>;

/** The profile page opened from the sidebar footer. */
export const loadCaAgentProfilePage: PageLoader = () => import('../components/profile/CaAgentProfileSection');

/**
 * Lazy page loader for every CA Agent menu section, so each section ships as its own chunk.
 * "overview" is the dashboard; the rest live in ca-agent/components/<section>/.
 */
export const CA_AGENT_PAGE_LOADERS: Readonly<Record<CaAgentSectionId, PageLoader>> = Object.freeze({
  overview: () => import('../dashboard/CaAgentDashboardPage'),
  new: () => import('../components/new-assignments/NewAssignmentsSection'),
  missing: () => import('../components/waiting-for-documents/WaitingForDocumentsSection'),
  portal: () => import('../components/portal-work/PortalWorkSection'),
  completed: () => import('../components/completed/CompletedSection'),
  applications: () => import('../components/my-applications/MyApplicationsSection'),
  communication: () => import('../components/communication/CommunicationSection'),
  notifications: () => import('../components/notifications/NotificationsSection')
});
