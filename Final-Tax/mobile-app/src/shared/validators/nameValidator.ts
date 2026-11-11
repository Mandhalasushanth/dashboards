/**
 * Strict Name Validator and Sanitizer for Finsolz.
 *
 * Rules:
 * - Accept English letters A–Z and a–z only.
 * - Allow exactly one space between words.
 * - Reject leading spaces immediately.
 * - Reject consecutive spaces immediately.
 * - Reject trailing spaces on blur and submission.
 * - Reject dots, commas, numbers, emojis and all special characters.
 * - No punctuation exceptions.
 */

export const STRICT_NAME_REGEX = /^[A-Za-z]+( [A-Za-z]+)*$/;

/**
 * Sanitizes name input in real time for controlled TextInput fields (typing and pasting).
 * - Strips all non-English letters and non-whitespace characters.
 * - Normalizes all whitespace (including newlines and tabs) and collapses consecutive whitespace into a single space.
 * - Prevents leading spaces immediately.
 * - Retains a single trailing space after a word while typing so the user can type the next word.
 */
export function sanitizeNameInput(value: string | undefined | null): string {
  if (!value) return "";
  return String(value)
    .replace(/[^a-zA-Z\s]/g, "") // reject numbers, emojis, dots, commas, symbols
    .replace(/\s+/g, " ")        // collapse any whitespace sequence (including tabs, newlines, multi-space) to a single space
    .replace(/^\s+/, "");        // reject leading spaces immediately
}

/**
 * Sanitizes name value on blur or prior to submission.
 * Calls sanitizeNameInput and strips any trailing spaces.
 */
export function sanitizeNameOnBlur(value: string | undefined | null): string {
  return sanitizeNameInput(value).trim();
}

export interface NameValidationOptions {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
}

/**
 * Validates a name string against strict name rules.
 * Accepts English letters only, single spaces between words, no punctuation or numbers.
 * Safely trims before evaluation.
 */
export function isValidName(
  name: string | undefined | null,
  minLength = 2,
  maxLength = 100
): boolean {
  if (!name) return false;
  const clean = String(name).trim();
  if (clean.length < minLength || clean.length > maxLength) return false;
  return STRICT_NAME_REGEX.test(clean);
}

/**
 * Returns a field-specific validation error message if invalid, or null if valid.
 */
export function getNameValidationError(
  name: string | undefined | null,
  fieldLabel = "Name",
  options?: NameValidationOptions
): string | null {
  const isRequired = options?.required ?? true;
  const minLength = options?.minLength ?? 2;
  const maxLength = options?.maxLength ?? 100;

  if (name === undefined || name === null || String(name).trim() === "") {
    if (isRequired) {
      return `${fieldLabel} is required`;
    }
    return null;
  }

  const clean = String(name).trim();

  if (clean.length < minLength) {
    return `${fieldLabel} must be at least ${minLength} characters`;
  }

  if (clean.length > maxLength) {
    return `${fieldLabel} must not exceed ${maxLength} characters`;
  }

  if (!STRICT_NAME_REGEX.test(clean)) {
    return `${fieldLabel} must contain English letters and single spaces only`;
  }

  return null;
}
