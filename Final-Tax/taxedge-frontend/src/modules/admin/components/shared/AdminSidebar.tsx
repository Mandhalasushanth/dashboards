import { BRAND_ASSETS } from '@/core/config/appConfig';
import { environment } from '@/core/config/environment';
import { getRoleProfile, useAuthentication } from '@/modules/authentication';
import { WorkspaceSidebar, type WorkspaceNavGroup } from '@/shared';
import { ADMIN_NAV_ITEMS, type AdminNavCounters, type AdminNavItem } from '../../shared/adminNavigation';
import { useAdminNavCounters } from '../../hooks/useAdminNavCounters';

export const ADMIN_SIDEBAR_ID = 'tx-admin-sidebar';

export interface AdminSidebarProps {
  readonly collapsed: boolean;
  readonly mobileOpen: boolean;
  readonly onNavigate: () => void;
  readonly onOpenProfile?: () => void;
}

function badgeFor(item: AdminNavItem, counters: AdminNavCounters): number | null {
  const count = item.counterKey ? counters[item.counterKey] : undefined;
  return count ? count : null;
}

/** Admin navigation: the shared workspace sidebar fed with the admin menu and its live counters. */
export function AdminSidebar(props: AdminSidebarProps) {
  const { user, signOut, signingOut } = useAuthentication();
  const counters = useAdminNavCounters();

  const groups: readonly WorkspaceNavGroup[] = [
    {
      label: 'Main Menu',
      items: ADMIN_NAV_ITEMS.map((item) => ({ id: item.id, label: item.label, path: item.path, iconName: item.iconName, badge: badgeFor(item, counters) }))
    }
  ];

  return (
    <WorkspaceSidebar
      {...props}
      id={ADMIN_SIDEBAR_ID}
      ariaLabel="Admin navigation"
      brand={{ appName: environment.appName, tagline: environment.appTagline, logoSrc: BRAND_ASSETS.logo, homePath: ADMIN_NAV_ITEMS[0].path }}
      groups={groups}
      user={user ? { displayName: user.displayName, roleLabel: getRoleProfile(user.role).label } : null}
      signingOut={signingOut}
      onSignOut={() => void signOut()}
    />
  );
}
