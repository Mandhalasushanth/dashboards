import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { toInitials } from '@/core/utils/stringUtils';
import { SignOutModal } from '../feedback/SignOutModal';
import { LoadingSpinner } from '../feedback/LoadingSpinner';
import { Icon, type IconName } from '../icons/Icon';
import { BrandLockup } from './BrandLockup';
import './WorkspaceSidebar.css';

export interface WorkspaceNavEntry {
  readonly id: string;
  readonly label: string;
  readonly path: string;
  readonly iconName: IconName;
  /** Pending count from the server; hidden when zero or absent. */
  readonly badge?: number | null;
}

export interface WorkspaceNavGroup {
  readonly label: string;
  readonly items: readonly WorkspaceNavEntry[];
}

export interface WorkspaceSidebarProps {
  readonly id: string;
  readonly ariaLabel: string;
  readonly brand: { readonly appName: string; readonly tagline: string; readonly logoSrc: string; readonly homePath: string };
  readonly groups: readonly WorkspaceNavGroup[];
  readonly user: { readonly displayName: string; readonly roleLabel: string } | null;
  readonly signingOut: boolean;
  readonly onSignOut: () => void;
  readonly collapsed: boolean;
  readonly mobileOpen: boolean;
  readonly onNavigate: () => void;
  readonly onOpenProfile?: () => void;
}

function navLinkClass({ isActive }: { isActive: boolean }): string {
  return isActive ? 'tx-ws-nav__link tx-ws-nav__link--active' : 'tx-ws-nav__link';
}

/** Workspace navigation drawer: fixed column on desktop (collapsible), off-canvas on tablet and mobile. */
export function WorkspaceSidebar({
  id,
  ariaLabel,
  brand,
  groups,
  user,
  signingOut,
  onSignOut,
  collapsed,
  mobileOpen,
  onNavigate,
  onOpenProfile
}: WorkspaceSidebarProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const classes = ['tx-ws-sidebar', collapsed ? 'tx-ws-sidebar--collapsed' : '', mobileOpen ? 'tx-ws-sidebar--open' : ''].filter(Boolean).join(' ');

  const renderItem = (item: WorkspaceNavEntry) => (
    <li key={item.id}>
      <NavLink to={item.path} className={navLinkClass} onClick={onNavigate} title={collapsed ? item.label : undefined} end>
        <Icon name={item.iconName} />
        <span className="tx-ws-nav__label">{item.label}</span>
        {item.badge ? (
          <span className="tx-ws-nav__badge" aria-label={`${item.badge} pending`}>
            {item.badge > 99 ? '99+' : item.badge}
          </span>
        ) : null}
      </NavLink>
    </li>
  );

  const renderGroup = (group: WorkspaceNavGroup) => (
    <div key={group.label} className="tx-ws-nav__group">
      <p className="tx-ws-nav__section">{group.label}</p>
      <ul className="tx-ws-nav__list">{group.items.map(renderItem)}</ul>
    </div>
  );

  const userBlock = user ? (
    <>
      <span className="tx-ws-sidebar__avatar" aria-hidden="true">
        {toInitials(user.displayName)}
      </span>
      <span className="tx-ws-sidebar__user">
        <span className="tx-ws-sidebar__user-name">{user.displayName}</span>
        <span className="tx-ws-sidebar__user-role">{user.roleLabel}</span>
      </span>
    </>
  ) : null;

  return (
    <>
      <aside id={id} className={classes} aria-label={ariaLabel}>
        <NavLink to={brand.homePath} className="tx-ws-sidebar__brand" onClick={onNavigate}>
          <BrandLockup appName={brand.appName} tagline={brand.tagline} logoSrc={brand.logoSrc} />
        </NavLink>

        <nav className="tx-ws-nav">{groups.map(renderGroup)}</nav>

        {user ? (
          <div className="tx-ws-sidebar__footer">
            {onOpenProfile ? (
              <button
                type="button"
                className="tx-ws-sidebar__profile-btn"
                onClick={() => {
                  onNavigate();
                  onOpenProfile();
                }}
                title={`Profile: ${user.displayName}`}
              >
                {userBlock}
              </button>
            ) : (
              userBlock
            )}
            <button
              type="button"
              className="tx-ws-sidebar__signout"
              onClick={() => setConfirmOpen(true)}
              disabled={signingOut}
              aria-label="Sign out"
              title="Sign out"
            >
              {signingOut ? <LoadingSpinner /> : <Icon name="log-out" />}
            </button>
          </div>
        ) : null}
      </aside>

      <SignOutModal open={confirmOpen} userName={user?.displayName} signingOut={signingOut} onConfirm={onSignOut} onCancel={() => setConfirmOpen(false)} />
    </>
  );
}
