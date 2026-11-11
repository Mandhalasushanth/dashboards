/** A validator returns an error message, or null when the value is valid. */
export type Validator = (value: string) => string | null;

export function required(label: string): Validator {
  return (value) => (value.trim().length === 0 ? `${label} is required.` : null);
}

export function minLength(label: string, length: number): Validator {
  return (value) => (value.length < length ? `${label} must be at least ${length} characters.` : null);
}

export function maxLength(label: string, length: number): Validator {
  return (value) => (value.length > length ? `${label} must be at most ${length} characters.` : null);
}

export function matchesPattern(pattern: RegExp, message: string): Validator {
  return (value) => (pattern.test(value) ? null : message);
}

/** Runs validators in order and returns the first failure. */
export function composeValidators(...validators: readonly Validator[]): Validator {
  return (value) => validators.reduce<string | null>((error, validate) => error ?? validate(value), null);
}
