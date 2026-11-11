import { HeaderIconLink } from '@/shared';
import { useLoanManagerNavCounters } from '../../hooks/useLoanManagerNavCounters';
import { LOAN_MANAGER_HEADER_SHORTCUT_IDS, getLoanManagerNavItem } from '../../shared/loanManagerNavigation';
import type { LoanManagerNavItem } from '../../shared/loanManager.types';

const SHORTCUT_ITEMS: readonly LoanManagerNavItem[] = LOAN_MANAGER_HEADER_SHORTCUT_IDS.map(getLoanManagerNavItem);

/** Header shortcuts with the same live counts as the sidebar. */
export function LoanManagerHeaderActions() {
  const counters = useLoanManagerNavCounters();

  const renderShortcut = (item: LoanManagerNavItem) => (
    <HeaderIconLink
      key={item.id}
      to={item.path}
      iconName={item.iconName}
      label={item.label}
      count={item.counterKey ? counters[item.counterKey] : undefined}
    />
  );

  return <>{SHORTCUT_ITEMS.map(renderShortcut)}</>;
}
