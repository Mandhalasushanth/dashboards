import type { FormEvent } from 'react';
import { Button, InlineAlert, TextField } from '@/shared';
import { CREDENTIAL_RULES } from '../shared/constants/authentication.constants';
import { RESET_CODE_LENGTH, usePasswordReset } from '../hooks/usePasswordReset';
import { VerificationCodeInput } from './VerificationCodeInput';
import './ForgotPasswordFlow.css';

export interface ForgotPasswordFlowProps {
  /** The username typed on the login form, so the admin does not type it twice. */
  readonly initialEmail: string;
  readonly onBack: () => void;
  /** Called with the email once the new password is saved. */
  readonly onComplete: (email: string) => void;
}

const STEP_TEXT = Object.freeze({
  email: { title: 'Forgot password', hint: 'Enter your admin email and we will send you a 6-digit verification code.' },
  code: { title: 'Verify your email', hint: 'Enter the 6-digit code we sent to' },
  password: { title: 'Set a new password', hint: 'Choose a new password. You will sign in with it next.' }
});

/** Admin-only reset: email → verification code → new password, styled like the login form. */
export function ForgotPasswordFlow({ initialEmail, onBack, onComplete }: ForgotPasswordFlowProps) {
  const reset = usePasswordReset(initialEmail, onComplete);
  const text = STEP_TEXT[reset.step];

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (reset.busy) return;
    const actions = { email: reset.sendCode, code: reset.verifyCode, password: reset.resetPassword };
    void actions[reset.step]();
  };

  return (
    <form className="tx-reset-flow" onSubmit={handleSubmit} noValidate>
      <div className="tx-reset-flow__heading">
        <h2 className="tx-reset-flow__title">{text.title}</h2>
        <p className="tx-reset-flow__hint">
          {text.hint}
          {reset.step === 'code' ? <strong className="tx-reset-flow__email"> {reset.email}</strong> : null}
        </p>
      </div>

      {reset.errors.form ? <InlineAlert tone="error" surface="dark">{reset.errors.form}</InlineAlert> : null}
      {reset.step === 'code' && reset.resent && !reset.errors.form ? (
        <InlineAlert tone="info" surface="dark">A new code has been sent.</InlineAlert>
      ) : null}

      {reset.step === 'email' ? (
        <TextField
          id="tx-reset-email"
          name="email"
          label="Username or email"
          placeholder="Enter your admin email"
          iconName="mail"
          value={reset.email}
          onValueChange={(value) => {
            reset.clearError('email');
            reset.setEmail(value);
          }}
          error={reset.errors.email}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={CREDENTIAL_RULES.username.maxLength}
          disabled={reset.busy}
          required
        />
      ) : null}

      {reset.step === 'code' ? (
        <VerificationCodeInput
          id="tx-reset-code"
          length={RESET_CODE_LENGTH}
          label="Verification code"
          value={reset.code}
          onChange={(value) => {
            reset.clearError('code');
            reset.setCode(value);
          }}
          error={reset.errors.code}
          disabled={reset.busy}
        />
      ) : null}

      {reset.step === 'password' ? (
        <>
          <TextField
            id="tx-reset-new-password"
            name="newPassword"
            type="password"
            label="New password"
            placeholder="Enter new password"
            iconName="lock"
            value={reset.newPassword}
            onValueChange={(value) => {
              reset.clearError('newPassword');
              reset.setNewPassword(value);
            }}
            error={reset.errors.newPassword}
            autoComplete="new-password"
            maxLength={CREDENTIAL_RULES.password.maxLength}
            disabled={reset.busy}
            revealable
            required
          />
          <TextField
            id="tx-reset-confirm-password"
            name="confirmPassword"
            type="password"
            label="Confirm password"
            placeholder="Re-enter new password"
            iconName="lock"
            value={reset.confirmPassword}
            onValueChange={(value) => {
              reset.clearError('confirmPassword');
              reset.setConfirmPassword(value);
            }}
            error={reset.errors.confirmPassword}
            autoComplete="new-password"
            maxLength={CREDENTIAL_RULES.password.maxLength}
            disabled={reset.busy}
            revealable
            required
          />
        </>
      ) : null}

      <Button type="submit" size="lg" fullWidth loading={reset.busy} loadingLabel="Please wait…">
        {reset.step === 'email' ? 'Send Code' : reset.step === 'code' ? 'Verify Code' : 'Reset Password'}
      </Button>

      <div className="tx-reset-flow__links">
        {reset.step === 'code' ? (
          <>
            <button type="button" className="tx-reset-flow__link" onClick={() => void reset.resendCode()} disabled={reset.busy}>
              Resend code
            </button>
            <button type="button" className="tx-reset-flow__link" onClick={reset.changeEmail} disabled={reset.busy}>
              Change email
            </button>
          </>
        ) : null}
        <button type="button" className="tx-reset-flow__link" onClick={onBack} disabled={reset.busy}>
          Back to sign in
        </button>
      </div>
    </form>
  );
}
