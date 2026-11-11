import { useEffect, useRef } from 'react';
import { Button } from '../buttons/Button';
import { Icon } from '../icons/Icon';
import './SignOutModal.css';

export interface SignOutModalProps {
  readonly open: boolean;
  readonly userName?: string;
  readonly signingOut: boolean;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

/**
 * Confirmation modal displayed when a user clicks the sign-out action.
 * Prevents accidental logouts and clearly states the action consequence.
 */
export function SignOutModal({ open, userName, signingOut, onConfirm, onCancel }: SignOutModalProps) {
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    cancelBtnRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !signingOut) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, signingOut, onCancel]);

  if (!open) {
    return null;
  }

  return (
    <div className="tx-signout-modal" role="dialog" aria-modal="true" aria-labelledby="tx-signout-title" aria-describedby="tx-signout-desc">
      <div className="tx-signout-modal__backdrop" onClick={signingOut ? undefined : onCancel} aria-hidden="true" />
      <div className="tx-signout-modal__dialog">
        <div className="tx-signout-modal__icon-wrap">
          <Icon name="log-out" size="lg" />
        </div>
        <div className="tx-signout-modal__content">
          <h2 id="tx-signout-title" className="tx-signout-modal__title">
            Confirm Sign Out
          </h2>
          <p id="tx-signout-desc" className="tx-signout-modal__desc">
            Are you sure you want to sign out{userName ? `, ${userName}` : ''}? Any unsaved work or form entries may be lost.
          </p>
        </div>
        <div className="tx-signout-modal__actions">
          <Button
            ref={cancelBtnRef}
            variant="secondary"
            onClick={onCancel}
            disabled={signingOut}
            className="tx-signout-modal__btn"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            iconName="log-out"
            onClick={onConfirm}
            loading={signingOut}
            loadingLabel="Signing out…"
            className="tx-signout-modal__btn"
          >
            Yes, Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
