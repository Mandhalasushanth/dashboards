import { useState, type FormEvent } from 'react';
import { LOGIN_EMAIL_ENDINGS, ROLE_PROFILES, type StaffRole } from '@/modules/authentication';
import { Button, InlineAlert, InputField, SelectField } from '@/shared';
import { ROLE_DOMAIN, TIER_LABELS, TIER_ROLES, type NewStaffInput, type StaffMember, type StaffTier } from '../../shared/staff.types';
import { validateNewStaff, type StaffFormErrors } from '../../validation/staffSchema';
import './StaffForm.css';

export interface StaffFormProps {
  readonly tier: StaffTier;
  /** When set, the form edits this account instead of creating a new one. */
  readonly member?: StaffMember;
  readonly managers: readonly StaffMember[];
  readonly existingUsernames: readonly string[];
  /** Resolves to an error message, or null on success. */
  readonly onSubmit: (input: NewStaffInput) => Promise<string | null>;
  readonly onCancel: () => void;
  readonly onSaved: (name: string, passwordReset: boolean) => void;
}

/** Admin-only form to provision a manager/agent or edit their sign-in details. There is no self sign-up. */
export function StaffForm({ tier, member, managers, existingUsernames, onSubmit, onCancel, onSaved }: StaffFormProps) {
  const editing = Boolean(member);
  const roles = TIER_ROLES[tier];
  const [input, setInput] = useState<NewStaffInput>(() => ({
    fullName: member?.fullName ?? '',
    username: member?.username ?? '',
    role: member?.role ?? roles[0],
    managerId: member?.managerId ?? null,
    // Editing keeps the current password unless the admin types a new one.
    password: ''
  }));
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<StaffFormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const domainManagers = managers.filter((manager) => ROLE_DOMAIN[manager.role] === ROLE_DOMAIN[input.role] && manager.id !== member?.id);
  const otherUsernames = existingUsernames.filter((username) => username !== member?.username);
  const set = <K extends keyof NewStaffInput>(key: K) => (value: NewStaffInput[K]) =>
    setInput((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const found = validateNewStaff(input, tier === 'AGENT', otherUsernames, editing);
    if (!found.password && input.password !== confirmPassword) {
      found.password = 'The two passwords do not match.';
    }
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setSaving(true);
    setServerError(null);
    const failure = await onSubmit({ ...input, username: input.username.trim().toLowerCase(), fullName: input.fullName.trim() });
    setSaving(false);
    if (failure) setServerError(failure);
    else onSaved(input.fullName.trim(), input.password !== '');
  };

  return (
    <form className="tx-staff-form" onSubmit={(event) => void handleSubmit(event)} noValidate>
      <h2 className="tx-staff-form__title">
        {editing ? `Edit ${member?.fullName}` : `New ${TIER_LABELS[tier].singular}`}
      </h2>
      {serverError ? <InlineAlert tone="error">{serverError}</InlineAlert> : null}

      <div className="tx-staff-form__grid">
        <InputField id="staff-name" label="Full name" placeholder="e.g. Priya Sharma" required value={input.fullName} onChange={set('fullName')} error={errors.fullName} />
        <SelectField<StaffRole>
          id="staff-role"
          label="Role"
          value={input.role}
          onChange={(role) =>
            setInput((current) => ({
              ...current,
              role,
              // A reporting manager must be in the same domain as the agent.
              managerId: ROLE_DOMAIN[role] === ROLE_DOMAIN[current.role] ? current.managerId : null
            }))
          }
          options={roles.map((role) => ({ value: role, label: ROLE_PROFILES[role].label }))}
        />
        <InputField id="staff-email" label="Work email (sign-in id)" type="email" placeholder={`name${tier === 'AGENT' ? LOGIN_EMAIL_ENDINGS.AGENT : LOGIN_EMAIL_ENDINGS.MANAGER} (lowercase)`} required value={input.username} onChange={set('username')} error={errors.username} />
        {tier === 'AGENT' ? (
          <SelectField
            id="staff-manager"
            label="Reports to"
            value={input.managerId ?? ''}
            placeholder={domainManagers.length ? 'Select a manager' : 'No active manager in this domain'}
            onChange={(id) => set('managerId')(id)}
            options={domainManagers.map((manager) => ({ value: manager.id, label: manager.fullName }))}
            error={errors.managerId}
          />
        ) : null}
        <InputField
          id="staff-password"
          label={editing ? 'New password' : 'Password'}
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder={editing ? 'Leave blank to keep the current password' : 'Min 10 characters'}
          required={!editing}
          value={input.password}
          onChange={set('password')}
          error={errors.password}
        />
        <InputField
          id="staff-password-confirm"
          label="Confirm password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Re-enter the password"
          required={!editing}
          value={confirmPassword}
          onChange={setConfirmPassword}
        />
        <label className="tx-staff-form__show">
          <input type="checkbox" checked={showPassword} onChange={(event) => setShowPassword(event.target.checked)} />
          Show password
        </label>
      </div>

      <p className="tx-staff-form__hint">
        {editing
          ? 'Leave the password fields blank to keep the current password. A new password takes effect at their next sign-in. Changing the email changes their sign-in id.'
          : `The ${TIER_LABELS[tier].singular} signs in with this email and password. Use at least 10 characters with upper and lower case letters, a number and a symbol, and share it with them privately.`}
      </p>

      <div className="tx-staff-form__actions">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" iconName={editing ? 'save' : 'user-check'} loading={saving}>
          {editing ? 'Save changes' : 'Create account'}
        </Button>
      </div>
    </form>
  );
}
