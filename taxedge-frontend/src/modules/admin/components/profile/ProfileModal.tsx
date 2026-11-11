import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/core/config/routePaths';
import { formatDateTime } from '@/core/utils/dateUtils';
import { humanizeConstant, toInitials } from '@/core/utils/stringUtils';
import { DOMAIN_LABELS, getRoleProfile, TIER_LABELS, useAuthentication } from '@/modules/authentication';
import { Button, Icon, SignOutModal } from '@/shared';
import './ProfileModal.css';

export interface ProfileModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
}

/**
 * Rich profile modal for the administrator.
 * Displays user identity, role, permissions, session security, and quick navigation.
 */
export function ProfileModal({ open, onClose }: ProfileModalProps) {
  const { user, signOut, signingOut } = useAuthentication();
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (confirmSignOut) {
          setConfirmSignOut(false);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, confirmSignOut, onClose]);

  if (!open || !user) {
    return null;
  }

  const profile = getRoleProfile(user.role);
  const initials = toInitials(user.displayName);

  const handleGoToSettings = () => {
    onClose();
    navigate(ROUTE_PATHS.adminSettings);
  };

  const handleConfirmLogout = () => {
    void signOut();
  };

  return (
    <>
      <div className="tx-profile-modal" role="dialog" aria-modal="true" aria-labelledby="tx-profile-name">
        <div className="tx-profile-modal__backdrop" onClick={onClose} aria-hidden="true" />
        <div className="tx-profile-dialog">
          {/* Header Banner */}
          <div className="tx-profile-dialog__banner">
            <button
              type="button"
              className="tx-profile-dialog__close"
              onClick={onClose}
              aria-label="Close profile"
              title="Close (Esc)"
            >
              ×
            </button>
          </div>

          {/* User Hero Section */}
          <div className="tx-profile-dialog__hero">
            <div className="tx-profile-dialog__avatar-wrap">
              <span className="tx-profile-dialog__avatar" aria-hidden="true">
                {initials}
              </span>
              <span className="tx-profile-dialog__status-dot" title="Active session" aria-label="Active" />
            </div>

            <div className="tx-profile-dialog__identity">
              <h2 id="tx-profile-name" className="tx-profile-dialog__name">
                {user.displayName}
              </h2>
              <div className="tx-profile-dialog__badges">
                <span className="tx-profile-badge tx-profile-badge--role">
                  <Icon name="shield" size="sm" />
                  <span>{profile.label}</span>
                </span>
                <span className="tx-profile-badge tx-profile-badge--domain">
                  <Icon name="globe" size="sm" />
                  <span>{DOMAIN_LABELS[profile.domain]}</span>
                </span>
              </div>
              <p className="tx-profile-dialog__email">
                <Icon name="mail" size="sm" />
                <span>{user.username}</span>
              </p>
            </div>
          </div>

          {/* Detailed Account Grid */}
          <div className="tx-profile-dialog__body">
            <section className="tx-profile-section" aria-label="Account Details">
              <h3 className="tx-profile-section__title">Account Information</h3>
              <dl className="tx-profile-grid">
                <div className="tx-profile-field">
                  <dt>User ID</dt>
                  <dd>
                    <code>{user.id}</code>
                  </dd>
                </div>
                <div className="tx-profile-field">
                  <dt>Account Level</dt>
                  <dd>{TIER_LABELS[profile.tier]}</dd>
                </div>
                <div className="tx-profile-field">
                  <dt>Last Signed In</dt>
                  <dd>{formatDateTime(user.lastLoginAt)}</dd>
                </div>
                <div className="tx-profile-field">
                  <dt>Session Protection</dt>
                  <dd className="tx-profile-status--secure">HttpOnly • CSRF Active</dd>
                </div>
              </dl>
            </section>

            {/* Permissions Section */}
            <section className="tx-profile-section" aria-label="Granted Permissions">
              <h3 className="tx-profile-section__title">
                <Icon name="shield-check" size="sm" />
                <span>Granted Permissions ({user.permissions.length})</span>
              </h3>
              {user.permissions.length > 0 ? (
                <ul className="tx-profile-permissions">
                  {user.permissions.map((permission) => (
                    <li key={permission} className="tx-profile-permission-chip">
                      <Icon name="check" size="sm" />
                      <span>{humanizeConstant(permission)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="tx-profile-empty">Standard administrator access granted.</p>
              )}
            </section>
          </div>

          {/* Dialog Action Footer */}
          <div className="tx-profile-dialog__footer">
            <Button
              variant="secondary"
              iconName="log-out"
              onClick={() => setConfirmSignOut(true)}
              className="tx-profile-btn--signout"
            >
              Sign out
            </Button>
            <div className="tx-profile-dialog__actions-right">
              <Button variant="secondary" iconName="settings" onClick={handleGoToSettings}>
                Settings
              </Button>
              <Button variant="primary" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        </div>
      </div>

      <SignOutModal
        open={confirmSignOut}
        userName={user.displayName}
        signingOut={signingOut}
        onConfirm={handleConfirmLogout}
        onCancel={() => setConfirmSignOut(false)}
      />
    </>
  );
}
