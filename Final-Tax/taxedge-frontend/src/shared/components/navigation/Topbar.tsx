import type { ReactNode } from 'react';
import { Icon } from '../icons/Icon';
import { BrandLockup } from './BrandLockup';
import { UserMenu } from './UserMenu';
import './Topbar.css';

export interface TopbarMenuControl {
  readonly open: boolean;
  readonly controlsId: string;
  readonly onToggle: () => void;
}

export interface TopbarProps {
  readonly appName: string;
  readonly tagline: string;
  readonly logoSrc: string;
  readonly title: string;
  readonly userName: string;
  readonly roleLabel: string;
  readonly onSignOut: () => void;
  readonly signingOut: boolean;
  /** Quick-access buttons shown before the avatar (e.g. notifications, messages). */
  readonly actions?: ReactNode;
  /** Present when a sidebar exists: the sidebar then carries the brand and this button toggles it. */
  readonly menu?: TopbarMenuControl;
  readonly onOpenProfile?: () => void;
}

export function Topbar({
  appName,
  tagline,
  logoSrc,
  title,
  userName,
  roleLabel,
  onSignOut,
  signingOut,
  actions,
  menu,
  onOpenProfile
}: TopbarProps) {
  return (
    <header className="tx-topbar">
      {menu ? null : (
        <div className="tx-topbar__brand-block">
          <BrandLockup appName={appName} tagline={tagline} logoSrc={logoSrc} />
        </div>
      )}
      <div className="tx-topbar__bar">
        <div className="tx-topbar__start">
          {menu ? (
            <button
              type="button"
              className="tx-topbar__menu"
              onClick={menu.onToggle}
              aria-label="Toggle navigation"
              aria-expanded={menu.open}
              aria-controls={menu.controlsId}
            >
              <Icon name="menu" />
            </button>
          ) : null}
          <p className="tx-topbar__title">{title}</p>
        </div>
        <div className="tx-topbar__actions">
          {actions}
          <UserMenu
            userName={userName}
            roleLabel={roleLabel}
            onSignOut={onSignOut}
            signingOut={signingOut}
            onOpenProfile={onOpenProfile}
          />
        </div>
      </div>
    </header>
  );
}
