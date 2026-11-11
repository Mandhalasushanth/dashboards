import { useCallback, useState, type FormEvent } from 'react';
import { defaultMessageFor, isApiError } from '@/core/api';
import { environment } from '@/core/config/environment';
import { logger } from '@/core/logging/logger';
import { authStore } from '@/store';
import { clearChatCredentials, saveChatCredentials } from '../api/chatCredentials';
import { sessionUserFromLogin } from '../shared/config/rolePermissions';
import { hasFieldErrors, validateLoginField, validateLoginForm } from '../validation/loginSchema';
import { signIn } from '../services/authenticationService';
import type { LoginCredentials, LoginField, LoginFieldErrors } from '../shared/types/authentication.types';
import { LOGIN_NETWORK_ERROR, loginErrorMessage } from '../shared/utils/loginErrorMessage';

export const LOGIN_FIELD_IDS: Readonly<Record<LoginField, string>> = Object.freeze({
  username: 'tx-login-username',
  password: 'tx-login-password'
});

const EMPTY_CREDENTIALS: LoginCredentials = Object.freeze({ username: '', password: '' });
const LOGIN_FIELDS: readonly LoginField[] = Object.freeze(['username', 'password']);

export interface LoginFormController {
  readonly values: LoginCredentials;
  readonly fieldErrors: LoginFieldErrors;
  readonly formError: string | null;
  readonly submitting: boolean;
  readonly changeField: (field: LoginField, value: string) => void;
  readonly blurField: (field: LoginField) => void;
  readonly submit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}

function toFormErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  logger.error('Unexpected sign-in failure.', error);
  return defaultMessageFor('UNKNOWN');
}

function focusFirstInvalidField(errors: LoginFieldErrors): void {
  const firstInvalid = LOGIN_FIELDS.find((field) => errors[field]);
  if (firstInvalid) {
    document.getElementById(LOGIN_FIELD_IDS[firstInvalid])?.focus();
  }
}

/** State, validation and fetch submission for the sign-in form. */
export function useLoginForm(): LoginFormController {
  const [values, setValues] = useState<LoginCredentials>(EMPTY_CREDENTIALS);
  const [touched, setTouched] = useState<Partial<Record<LoginField, boolean>>>({});
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const changeField = useCallback(
    (field: LoginField, value: string) => {
      setValues((current) => ({ ...current, [field]: value }));
      setFormError(null);
      if (touched[field]) {
        setFieldErrors((current) => ({ ...current, [field]: validateLoginField(field, value) ?? undefined }));
      }
    },
    [touched]
  );

  const blurField = useCallback(
    (field: LoginField) => {
      setTouched((current) => ({ ...current, [field]: true }));
      setFieldErrors((current) => ({ ...current, [field]: validateLoginField(field, values[field]) ?? undefined }));
    },
    [values]
  );

  const submit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (submitting) {
        return;
      }
      const errors = validateLoginForm(values);
      setTouched({ username: true, password: true });
      setFieldErrors(errors);
      if (hasFieldErrors(errors)) {
        focusFirstInvalidField(errors);
        return;
      }

      setSubmitting(true);
      setFormError(null);
      authStore.clearEndReason();

      try {
        const baseUrl = environment.apiBaseUrl || '/api/v1';
        const response = await fetch(`${baseUrl}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({
            // The backend looks emails up exactly as sent; the form already rejects capital letters.
            username: values.username.trim(),
            email: values.username.trim(),
            password: values.password
          })
        }).catch(() => {
          throw new Error(LOGIN_NETWORK_ERROR);
        });

        if (!response.ok) {
          throw new Error(await loginErrorMessage(response));
        }

        const data = await response.json();
        const user = sessionUserFromLogin(data, values.username);

        try {
          sessionStorage.setItem('taxedge.auth.session', JSON.stringify(user));
        } catch {
          // ignore
        }

        // The access token and account ids the chat and bucket endpoints need (Take application, messaging).
        saveChatCredentials(data);

        authStore.setAuthenticated(user);
      } catch (error) {
        if (
          import.meta.env.DEV &&
          environment.demoAuthEnabled &&
          error instanceof Error &&
          error.message === LOGIN_NETWORK_ERROR
        ) {
          try {
            clearChatCredentials(); // a demo account has no server token
            await signIn(values);
            return;
          } catch (demoError) {
            setFormError(toFormErrorMessage(demoError));
            setSubmitting(false);
            return;
          }
        }

        setFormError(toFormErrorMessage(error));
        setSubmitting(false);
      }
    },
    [submitting, values]
  );

  return { values, fieldErrors, formError, submitting, changeField, blurField, submit };
}