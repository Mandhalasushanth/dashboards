import { HeaderIconLink } from '@/shared';
import { ADMIN_HEADER_SHORTCUT_IDS, ADMIN_NAV_ITEMS, type AdminNavItem } from '../../shared/adminNavigation';
import { useAdminNavCounters } from '../../hooks/useAdminNavCounters';

const SHORTCUT_ITEMS: readonly AdminNavItem[] = ADMIN_HEADER_SHORTCUT_IDS.map((id) =>
  ADMIN_NAV_ITEMS.find((item) => item.id === id)
).filter((item): item is AdminNavItem => item !== undefined);

/** Notification and message shortcuts in the admin header, with the same live counts as the sidebar. */
export function AdminHeaderActions() {
  const counters = useAdminNavCounters();

  const renderShortcut = (item: AdminNavItem) => (
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
