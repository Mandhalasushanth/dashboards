import { useState } from 'react';
import { environment } from '@/core/config/environment';
import { formatDateTime } from '@/core/utils/dateUtils';
import { humanizeConstant, toInitials } from '@/core/utils/stringUtils';
import {
  DOMAIN_LABELS,
  getRoleProfile,
  LOGIN_EMAIL_ENDINGS,
  TIER_LABELS,
  tierForLoginEmail,
  updateCredentials,
  useAuthentication,
  verifyCurrentPassword
} from '@/modules/authentication';
import { Button, Icon, SignOutModal, useDocumentTitle } from '@/shared';
import { emailFormat } from '../../validation/indianFormats';
import { passwordPolicyError } from '../../validation/staffSchema';
import { RevealablePasswordInput } from './RevealablePasswordInput';
import './ProfileSection.css';

/**
 * Full-page User Profile section.
 * Fills the workspace content area exactly like Notifications and Communication,
 * dynamically reflecting the authenticated credentials of whichever user is logged in.
 */
export default function ProfileSection() {
  const { user, signOut, signingOut } = useAuthentication();
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [credentialsModalOpen, setCredentialsModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [submittingCredentials, setSubmittingCredentials] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const profile = user ? getRoleProfile(user.role) : null;
  const pageTitle = profile ? `${profile.label} Profile` : 'User Profile';
  useDocumentTitle(pageTitle);

  const openCredentialsModal = () => {
    setCurrentPassword('');
    setEditUsername(user?.username ?? '');
    setNewPassword('');
    setConfirmNewPassword('');
    setFeedback(null);
    setCredentialsModalOpen(true);
  };

  const handleCredentialsSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentPassword) {
      setFeedback({ message: 'Old password is required to verify your identity.', type: 'error' });
      return;
    }

    setSubmittingCredentials(true);
    setFeedback(null);

    try {
      // 1. Verify current login password matches real password
      const isCurrentPasswordValid = await verifyCurrentPassword(currentPassword);
      if (!isCurrentPasswordValid) {
        setFeedback({
          message: 'Old password is incorrect. It must match your login password.',
          type: 'error'
        });
        setSubmittingCredentials(false);
        return;
      }

      const trimmedUsername = editUsername.trim().toLowerCase();
      const isUsernameChanged = Boolean(trimmedUsername && user && trimmedUsername !== user.username.toLowerCase());
      const isPasswordChanged = Boolean(newPassword);

      if (!isUsernameChanged && !isPasswordChanged) {
        setFeedback({
          message: 'No changes entered. Please change your email or enter a new password.',
          type: 'error'
        });
        setSubmittingCredentials(false);
        return;
      }

      if (isPasswordChanged) {
        const policyError = passwordPolicyError(newPassword);
        if (policyError) {
          setFeedback({ message: `New password: ${policyError}`, type: 'error' });
          setSubmittingCredentials(false);
          return;
        }
        if (!confirmNewPassword) {
          setFeedback({ message: 'Please confirm your new password.', type: 'error' });
          setSubmittingCredentials(false);
          return;
        }
        if (newPassword !== confirmNewPassword) {
          setFeedback({ message: 'New password and confirm password do not match.', type: 'error' });
          setSubmittingCredentials(false);
          return;
        }
      }

      // The login page signs in as admin only for emails ending in admin@gmail.com.
      const usernameError = isUsernameChanged
        ? emailFormat(trimmedUsername) ??
          (tierForLoginEmail(trimmedUsername) === 'ADMINISTRATOR' ? null : `Must end with ${LOGIN_EMAIL_ENDINGS.ADMINISTRATOR}.`)
        : null;
      if (usernameError) {
        setFeedback({ message: `Email: ${usernameError}`, type: 'error' });
        setSubmittingCredentials(false);
        return;
      }

      await updateCredentials({
        newUsername: isUsernameChanged ? trimmedUsername : undefined,
        newPassword: isPasswordChanged ? newPassword : undefined
      });

      setFeedback({
        message: 'Credentials updated successfully! Display name and login credentials have been saved.',
        type: 'success'
      });

      setTimeout(() => {
        setCredentialsModalOpen(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setFeedback(null);
      }, 1300);
    } catch (error) {
      const message = error instanceof Error && error.message ? error.message : 'Please try again.';
      setFeedback({ message: `Failed to update credentials. ${message}`, type: 'error' });
    } finally {
      setSubmittingCredentials(false);
    }
  };

  if (!user || !profile) {
    return null;
  }

  const initials = toInitials(user.displayName);
  // Sign-in credentials are created and changed only by the administrator; other roles never see them.
  const isAdmin = user.role === 'ADMIN';
  const domainLabel = DOMAIN_LABELS[profile.domain];
  const tierLabel = TIER_LABELS[profile.tier];

  return (
    <div className="tx-profile-page">
      {/* Hero Banner Card */}
      <section className="tx-profile-hero" aria-label="User Profile Card">
        <div className="tx-profile-hero__bg" aria-hidden="true" />
        <div className="tx-profile-hero__content">
          <div className="tx-profile-hero__avatar-wrap">
            <span className="tx-profile-hero__avatar" aria-hidden="true">
              {initials}
            </span>
            <span className="tx-profile-hero__online-badge" title="Active" aria-label="Active" />
          </div>

          <div className="tx-profile-hero__info">
            <h2 className="tx-profile-hero__name">{user.displayName}</h2>
            <div className="tx-profile-hero__tags">
              <span className="tx-profile-tag tx-profile-tag--tier">
                <Icon name="shield-check" size="sm" />
                <span>{profile.label}</span>
              </span>
              <span className="tx-profile-tag tx-profile-tag--info">{domainLabel}</span>
              <span className="tx-profile-tag tx-profile-tag--live">Active</span>
            </div>
            {isAdmin ? (
              <p className="tx-profile-hero__email">
                <Icon name="mail" size="sm" />
                <span>{user.username}</span>
              </p>
            ) : null}
          </div>

          <div className="tx-profile-hero__actions">
            <Button
              variant="secondary"
              iconName="log-out"
              onClick={() => setConfirmSignOut(true)}
              className="tx-profile-btn--signout"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </section>

      {/* Grid of Profile Detail Cards */}
      <div className="tx-profile-grid-container">
        {/* Card 1: Account & Credentials */}
        <div className="tx-profile-card">
          <div className="tx-profile-card__header">
            <div className="tx-profile-card__icon">
              <Icon name="user" />
            </div>
            <div>
              <h3 className="tx-profile-card__title">Account & Credentials</h3>
              <p className="tx-profile-card__sub">Primary identity attributes for this workspace.</p>
            </div>
          </div>
          <dl className="tx-profile-data-list">
            <div className="tx-profile-data-item">
              <dt>User Identifier</dt>
              <dd>
                <code className="tx-profile-code">{user.id}</code>
              </dd>
            </div>
            {isAdmin ? (
              <div className="tx-profile-data-item">
                <dt>Login Username / Email</dt>
                <dd className="tx-profile-verified-email">
                  <span>{user.username}</span>
                  <span className="tx-profile-verified-pill">
                    <Icon name="check" size="sm" />
                    <span>Verified</span>
                  </span>
                  <Button variant="secondary" iconName="user" onClick={openCredentialsModal}>
                    Edit
                  </Button>
                </dd>
              </div>
            ) : null}
            <div className="tx-profile-data-item">
              <dt>Full Name</dt>
              <dd>{user.displayName}</dd>
            </div>
            <div className="tx-profile-data-item">
              <dt>Account Tier</dt>
              <dd>{tierLabel}</dd>
            </div>
            <div className="tx-profile-data-item">
              <dt>Service Domain</dt>
              <dd>{domainLabel}</dd>
            </div>
            <div className="tx-profile-data-item">
              <dt>Account Status</dt>
              <dd className="tx-profile-status-active">
                <span className="tx-profile-status-dot" />
                <span>Active • In Good Standing</span>
              </dd>
            </div>
          </dl>
        </div>

        {/* Card 2: Security & Session Protection */}
        <div className="tx-profile-card">
          <div className="tx-profile-card__header">
            <div className="tx-profile-card__icon">
              <Icon name="lock" />
            </div>
            <div>
              <h3 className="tx-profile-card__title">Security & Session</h3>
              <p className="tx-profile-card__sub">Encryption standards and active connection guards.</p>
            </div>
          </div>
          <dl className="tx-profile-data-list">
            <div className="tx-profile-data-item">
              <dt>Last Signed In</dt>
              <dd>{formatDateTime(user.lastLoginAt)}</dd>
            </div>
            <div className="tx-profile-data-item">
              <dt>Session Protection</dt>
              <dd className="tx-profile-badge-secure">HttpOnly Cookie • CSRF Guard</dd>
            </div>
            <div className="tx-profile-data-item">
              <dt>Inactivity Timeout</dt>
              <dd>{Math.round(environment.sessionIdleTimeoutMs / 60_000)} minutes idle auto-signout</dd>
            </div>
            <div className="tx-profile-data-item">
              <dt>Multi-Tab Sync</dt>
              <dd className="tx-profile-badge-secure">BroadcastChannel Real-Time</dd>
            </div>
            <div className="tx-profile-data-item">
              <dt>Assigned Workspace Area</dt>
              <dd>{profile.area === 'admin' ? 'Admin Console' : 'Staff Workspace'}</dd>
            </div>
          </dl>
        </div>

        {/* Card 3: Granted Permissions */}
        <div className="tx-profile-card tx-profile-card--full">
          <div className="tx-profile-card__header">
            <div className="tx-profile-card__icon">
              <Icon name="shield-check" />
            </div>
            <div>
              <h3 className="tx-profile-card__title">
                Granted Permissions ({user.permissions.length})
              </h3>
              <p className="tx-profile-card__sub">
                Server-validated security entitlements authorized for this authenticated account.
              </p>
            </div>
          </div>
          {user.permissions.length > 0 ? (
            <div className="tx-profile-permissions-grid">
              {user.permissions.map((perm) => (
                <div key={perm} className="tx-profile-perm-box">
                  <span className="tx-profile-perm-check" aria-hidden="true">
                    <Icon name="check" size="sm" />
                  </span>
                  <div className="tx-profile-perm-details">
                    <span className="tx-profile-perm-label">{humanizeConstant(perm)}</span>
                    <code className="tx-profile-perm-code">{perm}</code>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="tx-profile-empty">Standard privileges active for this user account.</p>
          )}
        </div>
      </div>

      {/* Change Credentials Dialog */}
      {isAdmin && credentialsModalOpen ? (
        <div className="tx-password-modal" role="dialog" aria-modal="true" aria-labelledby="tx-credentials-title">
          <div className="tx-password-modal__backdrop" onClick={() => setCredentialsModalOpen(false)} aria-hidden="true" />
          <div className="tx-password-dialog">
            <div className="tx-password-dialog__header">
              <h3 id="tx-credentials-title">Update Credentials</h3>
              <button
                type="button"
                className="tx-password-dialog__close"
                onClick={() => setCredentialsModalOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCredentialsSubmit} className="tx-password-form">
              {feedback ? (
                <div className={`tx-password-alert tx-password-alert--${feedback.type}`}>
                  {feedback.message}
                </div>
              ) : null}
              <div className="tx-password-field">
                <label htmlFor="tx-edit-username">Email</label>
                <input
                  id="tx-edit-username"
                  type="email"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  placeholder="Enter your email, e.g. admin@gmail.com"
                  autoComplete="username"
                  required
                />
              </div>
              <div className="tx-password-field">
                <label htmlFor="tx-current-pwd">Old Password</label>
                <RevealablePasswordInput
                  id="tx-current-pwd"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your old password"
                  autoComplete="current-password"
                  required
                />
              </div>
              <div className="tx-password-field">
                <label htmlFor="tx-new-pwd">New Password</label>
                <RevealablePasswordInput
                  id="tx-new-pwd"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (!e.target.value) setConfirmNewPassword('');
                  }}
                  placeholder="Enter new password (leave empty to keep the old one)"
                  autoComplete="new-password"
                />
              </div>
              <div className="tx-password-field">
                <label htmlFor="tx-confirm-pwd">Confirm Password</label>
                <RevealablePasswordInput
                  id="tx-confirm-pwd"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                  disabled={!newPassword}
                />
              </div>
              <div className="tx-password-dialog__actions">
                <Button variant="secondary" onClick={() => setCredentialsModalOpen(false)} type="button">
                  Cancel
                </Button>
                <Button variant="primary" type="submit" loading={submittingCredentials} loadingLabel="Saving…">
                  Update Credentials
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <SignOutModal
        open={confirmSignOut}
        userName={user.displayName}
        signingOut={signingOut}
        onConfirm={() => void signOut()}
        onCancel={() => setConfirmSignOut(false)}
      />
    </div>
  );
}
