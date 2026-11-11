import type { FormEvent } from 'react';
import { Button, InlineAlert, TextField } from '@/shared';
import { CREDENTIAL_RULES } from '../shared/constants/authentication.constants';
import { LOGIN_FIELD_IDS, type LoginFormController } from '../hooks/useLoginForm';
import { tierForLoginEmail } from '../shared/config/loginAccountTypes';
import './LoginForm.css';
import './ForgotPasswordFlow.css';

export interface LoginFormProps {
  readonly controller: LoginFormController;
  /** Opens the reset steps; the link shows only once an admin email is typed. */
  readonly onForgotPassword?: () => void;
}

/** Username and password sign-in form; useLoginForm validates and calls LoginController (/api/v1/auth/login). */
export function LoginForm({ controller, onForgotPassword }: LoginFormProps) {
  const {
    values,
    fieldErrors,
    formError: controllerError,
    submitting: controllerSubmitting,
    changeField,
    blurField,
    submit
  } = controller;

  const isSubmitting = controllerSubmitting;
  const activeError = controllerError;
  const showForgotPassword = Boolean(onForgotPassword) && tierForLoginEmail(values.username) === 'ADMINISTRATOR';

  // Every sign-in goes through the controller, so the email, its account ending and the lengths are
  // validated before anything is sent.
  const handleSignIn = (event: FormEvent<HTMLFormElement>) => {
    if (isSubmitting) {
      event.preventDefault();
      return;
    }
    void submit(event);
  };

  return (
    <form className="tx-login-form" onSubmit={handleSignIn} noValidate aria-describedby={activeError ? 'tx-login-error' : undefined}>
      {activeError ? (
        <div id="tx-login-error">
          <InlineAlert tone="error" surface="dark">{activeError}</InlineAlert>
        </div>
      ) : null}

      <TextField
        id={LOGIN_FIELD_IDS.username}
        name="username"
        label="Username"
        placeholder="Enter your username"
        iconName="user"
        value={values.username}
        onValueChange={(value) => changeField('username', value)}
        onBlur={() => blurField('username')}
        error={fieldErrors.username}
        autoComplete="username"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        maxLength={CREDENTIAL_RULES.username.maxLength}
        disabled={isSubmitting}
        required
      />

      <TextField
        id={LOGIN_FIELD_IDS.password}
        name="password"
        type="password"
        label="Password"
        placeholder="Enter your password"
        iconName="lock"
        value={values.password}
        onValueChange={(value) => changeField('password', value)}
        onBlur={() => blurField('password')}
        error={fieldErrors.password}
        autoComplete="current-password"
        maxLength={CREDENTIAL_RULES.password.maxLength}
        disabled={isSubmitting}
        revealable
        required
      />

      {showForgotPassword ? (
        <button type="button" className="tx-forgot-link" onClick={onForgotPassword} disabled={isSubmitting}>
          Forgot password?
        </button>
      ) : null}

      <Button type="submit" size="lg" fullWidth loading={isSubmitting} loadingLabel="Signing in…">
        Sign In
      </Button>
    </form>
  );
}