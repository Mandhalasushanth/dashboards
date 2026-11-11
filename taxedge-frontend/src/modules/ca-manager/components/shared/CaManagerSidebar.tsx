import { BRAND_ASSETS } from '@/core/config/appConfig';
import { environment } from '@/core/config/environment';
import { getRoleProfile, useAuthentication } from '@/modules/authentication';
import { WorkspaceSidebar, type WorkspaceNavGroup } from '@/shared';
import { useCaManagerNavCounters } from '../../hooks/useCaManagerNavCounters';
import { CA_MANAGER_SIDEBAR_ID, CA_MANAGER_WORKSPACE_LABEL } from '../../shared/caManager.config';
import { CA_MANAGER_NAV_ITEMS } from '../../shared/caManagerNavigation';
import type { CaManagerNavCounters, CaManagerNavItem } from '../../shared/caManager.types';

export interface CaManagerSidebarProps {
  readonly collapsed: boolean;
  readonly mobileOpen: boolean;
  readonly onNavigate: () => void;
  readonly onOpenProfile?: () => void;
}

function badgeFor(item: CaManagerNavItem, counters: CaManagerNavCounters): number | null {
  const count = item.counterKey ? counters[item.counterKey] : undefined;
  return count ? count : null;
}

/** Menu groups in configured order, keeping the first-seen order of group names. */
function toGroups(counters: CaManagerNavCounters): WorkspaceNavGroup[] {
  const labels = [...new Set(CA_MANAGER_NAV_ITEMS.map((item) => item.group))];
  return labels.map((label) => ({
    label,
    items: CA_MANAGER_NAV_ITEMS.filter((item) => item.group === label).map((item) => ({
      id: item.id,
      label: item.label,
      path: item.path,
      iconName: item.iconName,
      badge: badgeFor(item, counters)
    }))
  }));
}

/** CA Manager navigation: the same sidebar design as the admin console, with live counters. */
export function CaManagerSidebar(props: CaManagerSidebarProps) {
  const { user, signOut, signingOut } = useAuthentication();
  const counters = useCaManagerNavCounters();

  return (
    <WorkspaceSidebar
      {...props}
      id={CA_MANAGER_SIDEBAR_ID}
      ariaLabel={`${CA_MANAGER_WORKSPACE_LABEL} navigation`}
      brand={{ appName: environment.appName, tagline: environment.appTagline, logoSrc: BRAND_ASSETS.logo, homePath: CA_MANAGER_NAV_ITEMS[0].path }}
      groups={toGroups(counters)}
      user={user ? { displayName: user.displayName, roleLabel: getRoleProfile(user.role).label } : null}
      signingOut={signingOut}
      onSignOut={() => void signOut()}
    />
  );
}
