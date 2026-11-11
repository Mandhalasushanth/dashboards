import { BRAND_ASSETS } from '@/core/config/appConfig';
import { environment } from '@/core/config/environment';
import { getRoleProfile, useAuthentication } from '@/modules/authentication';
import { WorkspaceSidebar, type WorkspaceNavGroup } from '@/shared';
import { useCaAgentNavCounters } from '../../hooks/useCaAgentNavCounters';
import { CA_AGENT_SIDEBAR_ID, CA_AGENT_WORKSPACE_LABEL } from '../../shared/caAgent.config';
import { CA_AGENT_NAV_ITEMS } from '../../shared/caAgentNavigation';
import type { CaAgentNavCounters, CaAgentNavItem } from '../../shared/caAgent.types';

export interface CaAgentSidebarProps {
  readonly collapsed: boolean;
  readonly mobileOpen: boolean;
  readonly onNavigate: () => void;
  readonly onOpenProfile?: () => void;
}

function badgeFor(item: CaAgentNavItem, counters: CaAgentNavCounters): number | null {
  const count = item.counterKey ? counters[item.counterKey] : undefined;
  return count ? count : null;
}

/** Menu groups in configured order, keeping the first-seen order of group names. */
function toGroups(counters: CaAgentNavCounters): WorkspaceNavGroup[] {
  const labels = [...new Set(CA_AGENT_NAV_ITEMS.map((item) => item.group))];
  return labels.map((label) => ({
    label,
    items: CA_AGENT_NAV_ITEMS.filter((item) => item.group === label && !item.hiddenFromMenu).map((item) => ({
      id: item.id,
      label: item.label,
      path: item.path,
      iconName: item.iconName,
      badge: badgeFor(item, counters)
    }))
  }));
}

/** CA Agent navigation: the same sidebar design as the admin console, with live counters. */
export function CaAgentSidebar(props: CaAgentSidebarProps) {
  const { user, signOut, signingOut } = useAuthentication();
  const counters = useCaAgentNavCounters();

  return (
    <WorkspaceSidebar
      {...props}
      id={CA_AGENT_SIDEBAR_ID}
      ariaLabel={`${CA_AGENT_WORKSPACE_LABEL} navigation`}
      brand={{ appName: environment.appName, tagline: environment.appTagline, logoSrc: BRAND_ASSETS.logo, homePath: CA_AGENT_NAV_ITEMS[0].path }}
      groups={toGroups(counters)}
      user={user ? { displayName: user.displayName, roleLabel: getRoleProfile(user.role).label } : null}
      signingOut={signingOut}
      onSignOut={() => void signOut()}
    />
  );
}
