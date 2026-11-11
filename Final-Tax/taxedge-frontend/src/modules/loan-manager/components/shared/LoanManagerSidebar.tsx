import { BRAND_ASSETS } from '@/core/config/appConfig';
import { environment } from '@/core/config/environment';
import { getRoleProfile, useAuthentication } from '@/modules/authentication';
import { WorkspaceSidebar, type WorkspaceNavGroup } from '@/shared';
import { useLoanManagerNavCounters } from '../../hooks/useLoanManagerNavCounters';
import { LOAN_MANAGER_SIDEBAR_ID, LOAN_MANAGER_WORKSPACE_LABEL } from '../../shared/loanManager.config';
import { LOAN_MANAGER_NAV_ITEMS } from '../../shared/loanManagerNavigation';
import type { LoanManagerNavCounters, LoanManagerNavItem } from '../../shared/loanManager.types';

export interface LoanManagerSidebarProps {
  readonly collapsed: boolean;
  readonly mobileOpen: boolean;
  readonly onNavigate: () => void;
  readonly onOpenProfile?: () => void;
}

function badgeFor(item: LoanManagerNavItem, counters: LoanManagerNavCounters): number | null {
  const count = item.counterKey ? counters[item.counterKey] : undefined;
  return count ? count : null;
}

/** Menu groups in configured order, keeping the first-seen order of group names. */
function toGroups(counters: LoanManagerNavCounters): WorkspaceNavGroup[] {
  const labels = [...new Set(LOAN_MANAGER_NAV_ITEMS.map((item) => item.group))];
  return labels.map((label) => ({
    label,
    items: LOAN_MANAGER_NAV_ITEMS.filter((item) => item.group === label).map((item) => ({
      id: item.id,
      label: item.label,
      path: item.path,
      iconName: item.iconName,
      badge: badgeFor(item, counters)
    }))
  }));
}

/** Loan Manager navigation: the same sidebar design as the admin console, with live counters. */
export function LoanManagerSidebar(props: LoanManagerSidebarProps) {
  const { user, signOut, signingOut } = useAuthentication();
  const counters = useLoanManagerNavCounters();

  return (
    <WorkspaceSidebar
      {...props}
      id={LOAN_MANAGER_SIDEBAR_ID}
      ariaLabel={`${LOAN_MANAGER_WORKSPACE_LABEL} navigation`}
      brand={{ appName: environment.appName, tagline: environment.appTagline, logoSrc: BRAND_ASSETS.logo, homePath: LOAN_MANAGER_NAV_ITEMS[0].path }}
      groups={toGroups(counters)}
      user={user ? { displayName: user.displayName, roleLabel: getRoleProfile(user.role).label } : null}
      signingOut={signingOut}
      onSignOut={() => void signOut()}
    />
  );
}
