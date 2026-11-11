import { PHONE_REGEX } from "../../../shared/validators/indianTaxValidators";

/**
 * The approved dummy numbers rejected before an OTP is requested (BUG-LOGIN-002). The backend
 * enforces the same list (MobileNumberPolicy.java); keep the two in step.
 */
export const BLOCKED_DUMMY_MOBILE_NUMBERS: ReadonlySet<string> = new Set([
  "9999999999",
  "8888888888",
  "7777777777",
  "6666666666",
]);

export const MOBILE_NOT_ALLOWED_MESSAGE = "This mobile number is not allowed. Please enter a valid mobile number.";

export type MobileNumberResult = { ok: true; value: string } | { ok: false; error: string };

const SEPARATORS = /[\s\-().]/g;

/**
 * Normalises an entered or pasted Indian mobile number to its 10 digits.
 * Accepted: 9876543210, +91 98765 43210, 91-9876543210, 0091 9876543210, 09876543210.
 * Anything else is rejected with a message; nothing is cut down to fit.
 */
export function normalizeIndianMobile(raw: string): MobileNumberResult {
  const compact = (raw || "").trim().replace(SEPARATORS, "");
  if (!compact) return { ok: false, error: "Mobile number is required" };
  if (!/^\+?\d+$/.test(compact)) {
    return { ok: false, error: "Mobile number can contain only digits (an optional +91 prefix is allowed)" };
  }

  let digits = compact;
  if (compact.startsWith("+")) {
    if (!compact.startsWith("+91")) {
      return { ok: false, error: "Only Indian (+91) mobile numbers are supported" };
    }
    digits = compact.slice(3);
  } else if (/^0091\d{10}$/.test(compact)) {
    digits = compact.slice(4);
  } else if (/^91\d{10}$/.test(compact)) {
    digits = compact.slice(2);
  } else if (/^0\d{10}$/.test(compact)) {
    digits = compact.slice(1);
  }

  if (digits.length !== 10) return { ok: false, error: "Please enter a valid 10-digit mobile number" };
  if (!PHONE_REGEX.test(digits)) return { ok: false, error: "Invalid mobile number format" };
  if (BLOCKED_DUMMY_MOBILE_NUMBERS.has(digits)) return { ok: false, error: MOBILE_NOT_ALLOWED_MESSAGE };
  return { ok: true, value: digits };
}

/** Longest value kept from a paste that cannot be normalised, so the error can show what was entered. */
const MAX_REJECTED_PASTE_DIGITS = 15;

/**
 * Text-field handler logic. Typing only ever adds digits (a key press past 10 digits is ignored).
 * A paste, recognised by a jump of more than one character or a "+", is normalised, so
 * "+91 98765 43210" becomes 9876543210. A paste that is not a valid number is kept as its digits
 * (not cut to 10) so the validation message can reject it.
 */
export function applyMobileInput(previous: string, next?: string): string {
  const target = next !== undefined ? next : previous;
  const clean = target.startsWith("+91") ? target.slice(3) : target;
  // Strip everything except digits and strictly limit to 10 characters
  const digits = clean.replace(/\D/g, "").slice(0, 10);
  return digits;
}
