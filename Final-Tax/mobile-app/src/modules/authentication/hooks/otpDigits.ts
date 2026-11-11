/**
 * Pure editing rules for the six-box OTP field. Each box holds "" or one digit; boxes never shift,
 * so replacing or clearing one digit leaves every other digit where it is.
 */
export const OTP_LENGTH = 6;

export type OtpDigits = string[];

export interface DigitEdit {
  digits: OtpDigits;
  /** Box that should receive focus next. */
  focusIndex: number;
}

const onlyDigits = (text: string): string => text.replace(/\D/g, "");

/** Six boxes from an OTP string; missing positions are empty. */
export function digitsFromOtp(otp: string): OtpDigits {
  const clean = onlyDigits(otp || "");
  return Array.from({ length: OTP_LENGTH }, (_, i) => clean[i] ?? "");
}

/** The OTP string for the boxes. Empty boxes are skipped, so an OTP with a gap is shorter than six. */
export function joinDigits(digits: OtpDigits): string {
  return digits.join("");
}

/**
 * The boxes to show: the user's edited boxes while the parent's OTP is exactly what they join to,
 * otherwise (the parent reset or replaced the OTP, e.g. after a resend) the parent's value.
 */
export function resolveDigits(edited: OtpDigits, parentOtp: string): OtpDigits {
  return joinDigits(edited) === parentOtp ? edited : digitsFromOtp(parentOtp);
}

export function firstEmptyIndex(digits: OtpDigits): number {
  const index = digits.findIndex((d) => d === "");
  return index === -1 ? OTP_LENGTH - 1 : index;
}

const withDigit = (digits: OtpDigits, index: number, value: string): OtpDigits =>
  digits.map((d, i) => (i === index ? value : d));

/**
 * Applies the text a box reports after the user typed, deleted or pasted into box `index`.
 * - nothing left          -> that box is cleared
 * - no digits in the text -> ignored
 * - one digit             -> that box is replaced
 * - old digit + new one   -> the new digit replaces it (the box did not select its old digit)
 * - 6 or more digits      -> a whole code (paste or SMS autofill) fills all boxes
 * - 2 to 5 digits         -> pasted into this box and the ones after it; nothing before changes
 */
export function editDigit(digits: OtpDigits, index: number, rawText: string): DigitEdit {
  const typed = onlyDigits(rawText);
  const last = OTP_LENGTH - 1;

  // Deleting empties the box; text with no digits in it (pasted letters) is ignored, not a delete.
  if (rawText === "") return { digits: withDigit(digits, index, ""), focusIndex: index };
  if (typed === "") return { digits, focusIndex: index };

  if (typed.length >= OTP_LENGTH) {
    return { digits: digitsFromOtp(typed.slice(0, OTP_LENGTH)), focusIndex: last };
  }

  const current = digits[index];
  if (typed.length === 1 || (current !== "" && typed.length === 2 && (typed[0] === current || typed[1] === current))) {
    const incoming = typed.length === 1 ? typed : typed[0] === current ? typed[1] : typed[0];
    return { digits: withDigit(digits, index, incoming), focusIndex: Math.min(index + 1, last) };
  }

  const next = digits.map((d, i) =>
    i >= index && i < index + typed.length ? typed[i - index] : d
  );
  return { digits: next, focusIndex: Math.min(index + typed.length, last) };
}

/**
 * Backspace pressed in box `index`. A box that holds a digit is cleared by `editDigit` (the box
 * reports empty text), so this only handles an already-empty box: step back and clear the previous one.
 * Returns null when there is nothing to do.
 */
export function backspaceInEmptyBox(digits: OtpDigits, index: number): DigitEdit | null {
  if (digits[index] !== "" || index === 0) return null;
  return { digits: withDigit(digits, index - 1, ""), focusIndex: index - 1 };
}
