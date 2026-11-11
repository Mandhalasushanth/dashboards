import { ROUTE_PATHS } from '@/core/config/routePaths';
import type { IconName } from '@/shared';

/** Keys of the live counters the server reports for sidebar badges. */
export type AdminCounterKey = 'applications' | 'communication' | 'notifications';

export type AdminNavCounters = Partial<Record<AdminCounterKey, number>>;

/** One id per admin menu section; each has a matching folder under admin/components. */
export type AdminSectionId =
  | 'overview'
  | 'applications'
  | 'customers'
  | 'managers'
  | 'agents'
  | 'services'
  | 'revenue'
  | 'reports'
  | 'communication'
  | 'notifications'
  | 'settings';

export interface AdminNavItem {
  readonly id: AdminSectionId;
  readonly label: string;
  readonly path: string;
  readonly iconName: IconName;
  /** Header title when it differs from the menu label. */
  readonly title?: string;
  /** Page description shown in the section header. */
  readonly description: string;
  readonly counterKey?: AdminCounterKey;
}

/** Admin "Main Menu", in display order. The first item is the admin landing page. */
export const ADMIN_NAV_ITEMS: readonly AdminNavItem[] = Object.freeze([
  {
    id: 'overview',
    label: 'Overview',
    path: ROUTE_PATHS.adminDashboard,
    iconName: 'layout-dashboard',
    title: 'Dashboard',
    description: 'Platform activity at a glance.'
  },
  {
    id: 'applications',
    label: 'Applications',
    path: ROUTE_PATHS.adminApplications,
    iconName: 'file-spreadsheet',
    description: 'Track every customer application across CA and loan services.',
    /** Badge: applications still waiting for an agent. */
    counterKey: 'applications'
  },
  {
    id: 'customers',
    label: 'Customers',
    path: ROUTE_PATHS.adminCustomers,
    iconName: 'users',
    description: 'Customer profiles, documents and service history.'
  },
  {
    id: 'managers',
    label: 'Managers',
    path: ROUTE_PATHS.adminManagers,
    iconName: 'shield',
    description: 'Provision and manage CA and loan manager accounts.'
  },
  {
    id: 'agents',
    label: 'Executives / Agents',
    path: ROUTE_PATHS.adminAgents,
    iconName: 'user-check',
    description: 'Provision and manage CA and loan agent accounts.'
  },
  {
    id: 'services',
    label: 'Service Catalog',
    path: ROUTE_PATHS.adminServices,
    iconName: 'layers',
    description: 'Services offered, pricing and required documents.'
  },
  {
    id: 'revenue',
    label: 'Financial Dashboard',
    path: ROUTE_PATHS.adminRevenue,
    iconName: 'trending-up',
    description: 'Today’s, monthly and yearly revenue by service, pending payments and revenue per staff member.'
  },
  {
    id: 'reports',
    label: 'Reports',
    path: ROUTE_PATHS.adminReports,
    iconName: 'bar-chart',
    description: 'Operational and financial reports.'
  },
  {
    id: 'communication',
    label: 'Communication',
    path: ROUTE_PATHS.adminCommunication,
    iconName: 'message-square',
    description: 'Conversations with managers and agents.',
    counterKey: 'communication'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    path: ROUTE_PATHS.adminNotifications,
    iconName: 'bell',
    description: 'System alerts and workflow updates.',
    counterKey: 'notifications'
  },
  {
    id: 'settings',
    label: 'Settings',
    path: ROUTE_PATHS.adminSettings,
    iconName: 'settings',
    description: 'Platform and account preferences.'
  }
]);

export function findAdminNavItem(pathname: string): AdminNavItem | undefined {
  return ADMIN_NAV_ITEMS.find((item) => item.path === pathname);
}

/** Looks up a section's menu entry; every AdminSectionId is defined above, so a miss is a programming error. */
export function getAdminNavItem(id: AdminSectionId): AdminNavItem {
  const item = ADMIN_NAV_ITEMS.find((entry) => entry.id === id);
  if (!item) {
    throw new Error(`Admin navigation item "${id}" is not configured.`);
  }
  return item;
}

/** Title shown in the top header for the current admin page. */
export function resolveAdminPageTitle(pathname: string): string {
  if (pathname === ROUTE_PATHS.adminProfile) {
    return 'Administrator Profile';
  }
  const item = findAdminNavItem(pathname) ?? ADMIN_NAV_ITEMS[0];
  return item.title ?? item.label;
}

/** Sidebar entries that also appear as quick-access buttons in the top header, in display order. */
export const ADMIN_HEADER_SHORTCUT_IDS: readonly AdminSectionId[] = Object.freeze(['notifications', 'communication']);
