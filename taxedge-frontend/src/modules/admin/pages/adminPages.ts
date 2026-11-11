import type { ComponentType } from 'react';
import type { AdminSectionId } from '../shared/adminNavigation';

type PageLoader = () => Promise<{ default: ComponentType }>;

/**
 * Lazy page loader for every admin menu section, so each section ships as its own chunk.
 * "overview" is the admin dashboard; the rest live in admin/components/<section>/.
 */
export const ADMIN_PAGE_LOADERS: Readonly<Record<AdminSectionId, PageLoader>> = Object.freeze({
  overview: () => import('../dashboard/AdminDashboardPage'),
  applications: () => import('../components/applications/ApplicationsSection'),
  customers: () => import('../components/customers/CustomersSection'),
  managers: () => import('../components/managers/ManagersSection'),
  agents: () => import('../components/agents/AgentsSection'),
  services: () => import('../components/service-catalog/ServiceCatalogSection'),
  revenue: () => import('../components/financial/FinancialDashboardSection'),
  reports: () => import('../components/reports/ReportsSection'),
  communication: () => import('../components/communication/CommunicationSection'),
  notifications: () => import('../components/notifications/NotificationsSection'),
  settings: () => import('../components/settings/SettingsSection')
});
