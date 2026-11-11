import { HeaderIconLink } from '@/shared';
import { useLoanAgentNavCounters } from '../../hooks/useLoanAgentNavCounters';
import { LOAN_AGENT_HEADER_SHORTCUT_IDS, getLoanAgentNavItem } from '../../shared/loanAgentNavigation';
import type { LoanAgentNavItem } from '../../shared/loanAgent.types';

const SHORTCUT_ITEMS: readonly LoanAgentNavItem[] = LOAN_AGENT_HEADER_SHORTCUT_IDS.map(getLoanAgentNavItem);

/** Header shortcuts with the same live counts as the sidebar. */
export function LoanAgentHeaderActions() {
  const counters = useLoanAgentNavCounters();

  const renderShortcut = (item: LoanAgentNavItem) => (
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
