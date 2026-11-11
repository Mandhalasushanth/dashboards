import { useCallback, useState } from 'react';
import { passwordResetApi } from '../api/passwordResetApi';
import { CREDENTIAL_RULES } from '../shared/constants/authentication.constants';
import { tierForLoginEmail } from '../shared/config/loginAccountTypes';

export type PasswordResetStep = 'email' | 'code' | 'password';

export const RESET_CODE_LENGTH = 6;

export interface PasswordResetErrors {
  readonly email?: string;
  readonly code?: string;
  readonly newPassword?: string;
  readonly confirmPassword?: string;
  readonly form?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function emailError(email: string): string | undefined {
  if (!email) return 'Email is required.';
  if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email address.';
  return tierForLoginEmail(email) === 'ADMINISTRATOR' ? undefined : 'Password reset is available for admin accounts only.';
}

function passwordErrors(newPassword: string, confirmPassword: string): PasswordResetErrors {
  const { minLength, maxLength } = CREDENTIAL_RULES.password;
  const tooShort = newPassword.length < minLength ? `New password must be at least ${minLength} characters.` : undefined;
  const tooLong = newPassword.length > maxLength ? `New password must be at most ${maxLength} characters.` : undefined;
  const newError = !newPassword ? 'New password is required.' : tooShort ?? tooLong;
  const confirmError = !confirmPassword
    ? 'Confirm your new password.'
    : confirmPassword !== newPassword
      ? 'Passwords do not match.'
      : undefined;
  return { newPassword: newError, confirmPassword: confirmError };
}

const failureMessage = (error: unknown) => (error instanceof Error && error.message ? error.message : 'Something went wrong. Please try again.');

/** Walks the admin through email → six-digit code → new password, then calls onComplete with the email. */
export function usePasswordReset(initialEmail: string, onComplete: (email: string) => void) {
  const [step, setStep] = useState<PasswordResetStep>('email');
  const [email, setEmail] = useState(initialEmail.trim().toLowerCase());
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<PasswordResetErrors>({});
  const [busy, setBusy] = useState(false);
  const [resent, setResent] = useState(false);

  const run = useCallback(async (action: () => Promise<void>) => {
    setBusy(true);
    setErrors({});
    try {
      await action();
    } catch (error) {
      setErrors({ form: failureMessage(error) });
    } finally {
      setBusy(false);
    }
  }, []);

  const sendCode = useCallback(async () => {
    const normalized = email.trim().toLowerCase();
    const error = emailError(normalized);
    if (error) {
      setErrors({ email: error });
      return;
    }
    await run(async () => {
      await passwordResetApi.sendCode(normalized);
      setEmail(normalized);
      setCode('');
      setResent(false);
      setStep('code');
    });
  }, [email, run]);

  const resendCode = useCallback(async () => {
    await run(async () => {
      await passwordResetApi.sendCode(email);
      setCode('');
      setResent(true);
    });
  }, [email, run]);

  const verifyCode = useCallback(async () => {
    if (code.length !== RESET_CODE_LENGTH) {
      setErrors({ code: `Enter the ${RESET_CODE_LENGTH}-digit code sent to your email.` });
      return;
    }
    await run(async () => {
      await passwordResetApi.verifyCode(email, code);
      setStep('password');
    });
  }, [code, email, run]);

  const resetPassword = useCallback(async () => {
    const found = passwordErrors(newPassword, confirmPassword);
    if (found.newPassword || found.confirmPassword) {
      setErrors(found);
      return;
    }
    await run(async () => {
      await passwordResetApi.resetPassword(email, code, newPassword);
      onComplete(email);
    });
  }, [code, confirmPassword, email, newPassword, onComplete, run]);

  const changeEmail = useCallback(() => {
    setStep('email');
    setCode('');
    setErrors({});
  }, []);

  const clearError = useCallback((field: keyof PasswordResetErrors) => {
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  }, []);

  return {
    step,
    email,
    code,
    newPassword,
    confirmPassword,
    errors,
    busy,
    resent,
    setEmail,
    setCode,
    setNewPassword,
    setConfirmPassword,
    clearError,
    sendCode,
    resendCode,
    verifyCode,
    resetPassword,
    changeEmail
  };
}

export type PasswordResetController = ReturnType<typeof usePasswordReset>;
