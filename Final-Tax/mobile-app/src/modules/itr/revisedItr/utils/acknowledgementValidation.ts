export interface AcknowledgementValidationResult {
  isValid: boolean;
  error: string | null;
}

/**
 * Sanitizes input in real-time to accept only digits 0–9 up to 15 characters.
 * Immediately rejects non-numeric characters (letters, emojis, spaces, commas, special characters).
 * Applies the same filtering to typed, pasted, or pre-filled input.
 */
export function filterNumericAcknowledgementNumber(value: string): string {
  if (!value) return "";
  return value.replace(/[^0-9]/g, "").slice(0, 15);
}

/**
 * Validates the Revised ITR Original Acknowledgement Number field.
 *
 * Rules:
 * - Accept exactly 15 digits (`0–9`).
 * - Reject letters, spaces, commas, decimal points, and all special characters.
 * - Show an inline error if the value contains non-digits or is not exactly 15 digits.
 * - Return `error: null` and `isValid: true` only when exactly 15 digits are entered.
 */
export function validateOriginalItrAckNumber(value: string): AcknowledgementValidationResult {
  if (!value || value.length === 0) {
    return {
      isValid: false,
      error: "Please enter the 15-digit Acknowledgement Number.",
    };
  }

  // Reject letters, spaces, commas, decimal points, and all special characters
  if (/[^\d]/.test(value)) {
    return {
      isValid: false,
      error: "Acknowledgement number must contain only digits (0–9). Letters, spaces, commas, and special characters are not allowed.",
    };
  }

  // Check exact length: must be exactly 15 digits
  if (value.length !== 15) {
    return {
      isValid: false,
      error: "Acknowledgement number must be exactly 15 digits.",
    };
  }

  return {
    isValid: true,
    error: null,
  };
}

/**
 * Determines whether the Continue button should be enabled.
 * Only true when exactly 15 numeric digits (0–9) are entered.
 */
export function isOriginalItrAckNumberValid(value: string): boolean {
  return /^\d{15}$/.test(value);
}
