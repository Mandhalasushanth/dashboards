import { BRAND_ASSETS } from '@/core/config/appConfig';
import { environment } from '@/core/config/environment';
import { getRoleProfile, useAuthentication } from '@/modules/authentication';
import { WorkspaceSidebar, type WorkspaceNavGroup } from '@/shared';
import { useLoanAgentNavCounters } from '../../hooks/useLoanAgentNavCounters';
import { LOAN_AGENT_SIDEBAR_ID, LOAN_AGENT_WORKSPACE_LABEL } from '../../shared/loanAgent.config';
import { LOAN_AGENT_NAV_ITEMS } from '../../shared/loanAgentNavigation';
import type { LoanAgentNavCounters, LoanAgentNavItem } from '../../shared/loanAgent.types';

export interface LoanAgentSidebarProps {
  readonly collapsed: boolean;
  readonly mobileOpen: boolean;
  readonly onNavigate: () => void;
  readonly onOpenProfile?: () => void;
}

function badgeFor(item: LoanAgentNavItem, counters: LoanAgentNavCounters): number | null {
  const count = item.counterKey ? counters[item.counterKey] : undefined;
  return count ? count : null;
}

/** Menu groups in configured order, keeping the first-seen order of group names. */
function toGroups(counters: LoanAgentNavCounters): WorkspaceNavGroup[] {
  const labels = [...new Set(LOAN_AGENT_NAV_ITEMS.map((item) => item.group))];
  return labels.map((label) => ({
    label,
    items: LOAN_AGENT_NAV_ITEMS.filter((item) => item.group === label && !item.hiddenFromMenu).map((item) => ({
      id: item.id,
      label: item.label,
      path: item.path,
      iconName: item.iconName,
      badge: badgeFor(item, counters)
    }))
  }));
}

/** Loan Agent navigation: the same sidebar design as the admin console, with live counters. */
export function LoanAgentSidebar(props: LoanAgentSidebarProps) {
  const { user, signOut, signingOut } = useAuthentication();
  const counters = useLoanAgentNavCounters();

  return (
    <WorkspaceSidebar
      {...props}
      id={LOAN_AGENT_SIDEBAR_ID}
      ariaLabel={`${LOAN_AGENT_WORKSPACE_LABEL} navigation`}
      brand={{ appName: environment.appName, tagline: environment.appTagline, logoSrc: BRAND_ASSETS.logo, homePath: LOAN_AGENT_NAV_ITEMS[0].path }}
      groups={toGroups(counters)}
      user={user ? { displayName: user.displayName, roleLabel: getRoleProfile(user.role).label } : null}
      signingOut={signingOut}
      onSignOut={() => void signOut()}
    />
  );
}
