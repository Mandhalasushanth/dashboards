import { HeaderIconLink } from '@/shared';
import { useCaManagerNavCounters } from '../../hooks/useCaManagerNavCounters';
import { CA_MANAGER_HEADER_SHORTCUT_IDS, getCaManagerNavItem } from '../../shared/caManagerNavigation';
import type { CaManagerNavItem } from '../../shared/caManager.types';

const SHORTCUT_ITEMS: readonly CaManagerNavItem[] = CA_MANAGER_HEADER_SHORTCUT_IDS.map(getCaManagerNavItem);

/** Header shortcuts with the same live counts as the sidebar. */
export function CaManagerHeaderActions() {
  const counters = useCaManagerNavCounters();

  const renderShortcut = (item: CaManagerNavItem) => (
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
