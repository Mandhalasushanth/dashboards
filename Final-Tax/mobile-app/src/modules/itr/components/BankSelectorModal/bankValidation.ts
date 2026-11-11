/**
 * Bank Name validation and sanitization helpers for ITR Filing Bank Account modal.
 * Delegated to the canonical Finsolz nameValidator utility.
 */

import {
  sanitizeNameInput,
  sanitizeNameOnBlur,
  isValidName,
  getNameValidationError,
  STRICT_NAME_REGEX,
} from "@/shared/validators/nameValidator";

export {
  sanitizeNameInput,
  sanitizeNameOnBlur,
  isValidName,
  getNameValidationError,
  STRICT_NAME_REGEX,
};

/**
 * Sanitizes bank name input in real time for controlled TextInput (both typing and pasting).
 */
export function sanitizeBankName(value: string): string {
  return sanitizeNameInput(value);
}

/**
 * Validates a sanitized/submitted bank name.
 * Requires 2 to 100 characters, containing only English alphabetic words separated by a single space.
 */
export function isValidBankName(name: string): boolean {
  return isValidName(name, 2, 100);
}
