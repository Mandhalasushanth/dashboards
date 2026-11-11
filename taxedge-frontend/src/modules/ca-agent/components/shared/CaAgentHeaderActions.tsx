import { HeaderIconLink } from '@/shared';
import { useCaAgentNavCounters } from '../../hooks/useCaAgentNavCounters';
import { CA_AGENT_HEADER_SHORTCUT_IDS, getCaAgentNavItem } from '../../shared/caAgentNavigation';
import type { CaAgentNavItem } from '../../shared/caAgent.types';

const SHORTCUT_ITEMS: readonly CaAgentNavItem[] = CA_AGENT_HEADER_SHORTCUT_IDS.map(getCaAgentNavItem);

/** Header shortcuts with the same live counts as the sidebar. */
export function CaAgentHeaderActions() {
  const counters = useCaAgentNavCounters();

  const renderShortcut = (item: CaAgentNavItem) => (
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
