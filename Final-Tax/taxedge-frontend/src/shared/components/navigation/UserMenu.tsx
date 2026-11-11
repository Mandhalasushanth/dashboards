import { useEffect, useRef, useState } from 'react';
import { toInitials } from '@/core/utils/stringUtils';
import { Button } from '../buttons/Button';
import { SignOutModal } from '../feedback/SignOutModal';
import './UserMenu.css';

export interface UserMenuProps {
  readonly userName: string;
  readonly roleLabel: string;
  readonly onSignOut: () => void;
  readonly signingOut: boolean;
  readonly onOpenProfile?: () => void;
}

const MENU_ID = 'tx-user-menu';

/** Avatar button with profile modal trigger and fallback dropdown menu. */
export function UserMenu({ userName, roleLabel, onSignOut, signingOut, onOpenProfile }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const toggle = () => setOpen((current) => !current);

  const handleAvatarClick = () => {
    if (onOpenProfile) {
      onOpenProfile();
    } else {
      toggle();
    }
  };

  const handleSignOutClick = () => {
    setOpen(false);
    setConfirmOpen(true);
  };

  return (
    <>
      <div className="tx-user-menu" ref={containerRef}>
        <button
          type="button"
          className="tx-user-menu__avatar"
          onClick={handleAvatarClick}
          aria-label={`User profile for ${userName}`}
          title={`Profile: ${userName}`}
          aria-haspopup={onOpenProfile ? undefined : 'menu'}
          aria-expanded={onOpenProfile ? undefined : open}
          aria-controls={onOpenProfile ? undefined : MENU_ID}
        >
          {toInitials(userName).charAt(0)}
        </button>

        {!onOpenProfile && open ? (
          <div id={MENU_ID} className="tx-user-menu__panel" role="menu">
            <div className="tx-user-menu__identity">
              <span className="tx-user-menu__name">{userName}</span>
              <span className="tx-user-menu__role">{roleLabel}</span>
            </div>
            <Button
              variant="ghost"
              iconName="log-out"
              onClick={handleSignOutClick}
              loading={signingOut}
              loadingLabel="Signing out…"
              fullWidth
              className="tx-user-menu__signout"
              role="menuitem"
            >
              Sign out
            </Button>
          </div>
        ) : null}
      </div>

      <SignOutModal
        open={confirmOpen}
        userName={userName}
        signingOut={signingOut}
        onConfirm={onSignOut}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
