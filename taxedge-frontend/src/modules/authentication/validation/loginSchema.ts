import { composeValidators, matchesPattern, maxLength, minLength, required, type Validator } from '@/shared/validation/commonSchemas';
import { CREDENTIAL_RULES } from '../shared/constants/authentication.constants';
import { LOGIN_EMAIL_ENDING_MESSAGE, tierForLoginEmail } from '../shared/config/loginAccountTypes';
import type { LoginCredentials, LoginField, LoginFieldErrors } from '../shared/types/authentication.types';

const { username: usernameRules, password: passwordRules } = CREDENTIAL_RULES;

const validateUsername = composeValidators(
  required('Username'),
  minLength('Username', usernameRules.minLength),
  maxLength('Username', usernameRules.maxLength),
  // Accounts are stored in small letters, so a capital letter can never match one: say so instead of guessing.
  (value) => (/[A-Z]/.test(value) ? 'Username must be in small letters only. Remove the capital letters.' : null),
  matchesPattern(usernameRules.pattern, usernameRules.patternMessage),
  // The email ending decides the account type, so an email without one of the three cannot sign in.
  (value) => (tierForLoginEmail(value) ? null : LOGIN_EMAIL_ENDING_MESSAGE)
);

const validatePassword = composeValidators(
  required('Password'),
  minLength('Password', passwordRules.minLength),
  maxLength('Password', passwordRules.maxLength)
);

/** Usernames are trimmed and must be in small letters (never silently changed); passwords are sent exactly as typed. */
const FIELD_VALIDATORS: Readonly<Record<LoginField, Validator>> = Object.freeze({
  username: (value: string) => validateUsername(value.trim()),
  password: validatePassword
});

export function validateLoginField(field: LoginField, value: string): string | null {
  return FIELD_VALIDATORS[field](value);
}

export function validateLoginForm(values: LoginCredentials): LoginFieldErrors {
  const fields = Object.keys(FIELD_VALIDATORS) as LoginField[];
  return fields.reduce<LoginFieldErrors>((errors, field) => {
    const message = validateLoginField(field, values[field]);
    return message ? { ...errors, [field]: message } : errors;
  }, {});
}

export function hasFieldErrors(errors: LoginFieldErrors): boolean {
  return Object.values(errors).some(Boolean);
}

export function normalizeCredentials(values: LoginCredentials): LoginCredentials {
  return { username: values.username.trim(), password: values.password };
}
