import { parseDDMMYYYY } from "@/shared/formatters/dateFormatter";

/**
 * Field rules for customer profile data (Create Account and profile edit).
 *
 * Maximum lengths are the column sizes of the backend `customers` table (name 100, email 100,
 * father/spouse name 100, address lines 255, city 100, combined address 500): a longer value
 * would be refused or truncated by the server, so the form refuses it first. They are not
 * product-chosen limits.
 */
export const PROFILE_FIELD_LIMITS = {
  fullName: 100,
  fatherSpouseName: 100,
  email: 100,
  addressLine: 255,
  /** The server stores line 1, line 2, city, state and PIN joined into one 500-character `address`. */
  fullAddress: 500,
  city: 100,
} as const;

/**
 * Minimum age to create an account. 18 follows the rule the app already applies to taxpayers
 * (modules/itr/tds/utils/tdsValidation.ts, "Taxpayer must be at least 18 years old"). Registration
 * has no separately documented age; change this one constant if product decides otherwise.
 */
export const REGISTRATION_MIN_AGE_YEARS = 18;

const MAX_AGE_YEARS = 120;

// ---- whitespace --------------------------------------------------------------------------------

/** Trims and collapses every run of whitespace to one space. */
export function normalizeSpaces(text: string): string {
  return (text || "").replace(/\s+/g, " ").trim();
}

/** For live typing: no leading space and no double spaces, but a single trailing space is kept so the next word can be typed. */
export function collapseTypingSpaces(text: string): string {
  return (text || "").replace(/^\s+/, "").replace(/\s{2,}/g, " ");
}

const codePointLength = (text: string): number => Array.from(text).length;

// ---- names (person, father/spouse, city) ---------------------------------------------------------

/**
 * Words of letters, with the combining marks that Indic and other scripts need (vowel signs, virama,
 * ZWJ/ZWNJ), joined by a space, hyphen, apostrophe or full stop ("K. Ramesh", "A.P.J. Abdul Kalam",
 * "D'Souza", "Mary-Ann"). A name may end with a full stop ("Ramesh K."). Digits, emoji and other
 * symbols never match.
 */
const WORD = "\\p{L}[\\p{L}\\p{M}\\u200C\\u200D]*";
const NAME_PATTERN = new RegExp(`^${WORD}(?:(?:\\. ?|[ '’-])${WORD})*\\.?$`, "u");

export interface NameRules {
  /** Shown in messages, e.g. "Full name". */
  label: string;
  maxLength: number;
  minLength?: number;
}

/** "" when valid (or empty: requiredness is checked separately), else a specific message. */
export function validateNameField(raw: string, rules: NameRules): string {
  const value = normalizeSpaces(raw);
  if (!value) return "";
  if (/\d/.test(value)) return `${rules.label} cannot contain numbers`;
  if (codePointLength(value) > rules.maxLength) return `${rules.label} cannot be longer than ${rules.maxLength} characters`;
  if (!NAME_PATTERN.test(value)) {
    return `${rules.label} can contain only letters, spaces and . ' -`;
  }
  if (codePointLength(value) < (rules.minLength ?? 2)) return `${rules.label} is too short`;
  return "";
}

/**
 * Feedback while the user is still typing: only definite mistakes (digits, symbols that can never be
 * part of a name, too long). Whether the finished value is well formed is `validateNameField`.
 */
export function validateNameTyping(raw: string, rules: NameRules): string {
  if (!raw) return "";
  if (/\d/.test(raw)) return `${rules.label} cannot contain numbers`;
  if (/[^\p{L}\p{M}‌‍ .'’-]/u.test(raw)) return `${rules.label} can contain only letters, spaces and . ' -`;
  if (codePointLength(normalizeSpaces(raw)) > rules.maxLength) {
    return `${rules.label} cannot be longer than ${rules.maxLength} characters`;
  }
  return "";
}

export const FULL_NAME_RULES: NameRules = { label: "Name", maxLength: PROFILE_FIELD_LIMITS.fullName };
export const FATHER_SPOUSE_NAME_RULES: NameRules = {
  label: "Father's / Spouse name",
  maxLength: PROFILE_FIELD_LIMITS.fatherSpouseName,
};
export const CITY_RULES: NameRules = { label: "City", maxLength: PROFILE_FIELD_LIMITS.city };

/** True when the text is a usable person name (normalised, at least two characters, within the limit). */
export function isValidPersonName(raw: string, rules: NameRules = FULL_NAME_RULES): boolean {
  return Boolean(normalizeSpaces(raw)) && validateNameField(raw, rules) === "";
}

// ---- email ---------------------------------------------------------------------------------------

export const EMAIL_LOCAL_REGEX = /^[a-zA-Z0-9]+(?:[._+-][a-zA-Z0-9]+)*$/;
export const VALID_TLD_REGEX = /^(com|in|org|net|co|gov|edu|mil|biz|info|io|ai|me|dev|app|tech|online|store|agency|global|world|[a-z]{2,4})$/i;
export const EMAIL_REGEX = /^[a-zA-Z0-9]+(?:[._+-][a-zA-Z0-9]+)*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
const DOMAIN_LABEL = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/;

/**
 * Validates email according to RFC 5322 format, no consecutive dots, and valid domain label structure.
 */
export function validateEmailAddress(raw: string): string {
  const email = (raw || "").trim();
  if (!email) return "";
  if (/\s/.test(email)) return "Email cannot contain spaces";
  if (codePointLength(email) > PROFILE_FIELD_LIMITS.email) {
    return `Email cannot be longer than ${PROFILE_FIELD_LIMITS.email} characters`;
  }
  if (email.includes("..")) return "Email cannot contain consecutive dots";
  const at = email.indexOf("@");
  if (at === -1) return "Email must contain @";
  if (at !== email.lastIndexOf("@")) return "Email can contain only one @";

  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  if (!local) return "Enter the part of the email before @";
  if (!domain) return "Enter the email domain after @";

  if (!EMAIL_LOCAL_REGEX.test(local)) {
    return "Email before @ can only contain letters, numbers, and single . _ - +";
  }

  const labels = domain.split(".");
  if (labels.length < 2) return "Email domain must include a dot, for example gmail.com";
  if (domain.length > 253 || labels.some((label) => !DOMAIN_LABEL.test(label))) {
    return "Email domain is not valid";
  }

  const tld = labels[labels.length - 1].toLowerCase();
  if (!VALID_TLD_REGEX.test(tld)) {
    return "Enter a valid domain extension (e.g. .com, .in)";
  }

  if (!EMAIL_REGEX.test(email)) return "Enter a valid email address";
  return "";
}

export function isValidEmailAddress(raw: string): boolean {
  return Boolean((raw || "").trim()) && validateEmailAddress(raw) === "";
}

// ---- address -------------------------------------------------------------------------------------

/** Letters (with marks), digits, spaces and the punctuation real addresses use: , . - / # ( ) & ' : ; */
const ADDRESS_CHARACTERS = /^[\p{L}\p{M}\p{N} ,.\-/#()&'’:;‌‍]+$/u;
const REPEATED_PUNCTUATION = /([,.;:\-/#&'’])\s?\1/u;

/** "" when valid (or empty), else a message. `label` names the field, e.g. "Address Line 1". */
export function validateAddressLine(raw: string, label: string): string {
  const value = normalizeSpaces(raw);
  if (!value) return "";
  if (codePointLength(value) > PROFILE_FIELD_LIMITS.addressLine) {
    return `${label} cannot be longer than ${PROFILE_FIELD_LIMITS.addressLine} characters`;
  }
  if (!ADDRESS_CHARACTERS.test(value)) {
    return `${label} can contain only letters, numbers, spaces and , . - / # ( ) & ' :`;
  }
  if (!/[\p{L}\p{N}]/u.test(value)) return `${label} must contain letters or numbers`;
  if (/^[,.;:]/.test(value) || REPEATED_PUNCTUATION.test(value)) {
    return `${label} has misplaced or repeated punctuation`;
  }
  return "";
}

/** Server-side joined address length check; "" when the pieces fit the 500-character column. */
export function validateFullAddressLength(fullAddress: string): string {
  return codePointLength(fullAddress) > PROFILE_FIELD_LIMITS.fullAddress
    ? "Address is too long. Please shorten it."
    : "";
}

// ---- date of birth -------------------------------------------------------------------------------

/**
 * "" when `value` (DD-MM-YYYY, or YYYY-MM-DD from the API) is a real past date for someone at least
 * `minAge` years old and not implausibly old, else a specific message. Turning exactly `minAge` today
 * counts as old enough.
 */
export function validateDobForRegistration(value: string, minAge: number = REGISTRATION_MIN_AGE_YEARS, now: Date = new Date()): string {
  const clean = (value || "").trim();
  if (!clean) return "";
  const api = /^(\d{4})-(\d{2})-(\d{2})$/.exec(clean);
  const date = parseDDMMYYYY(api ? `${api[3]}-${api[2]}-${api[1]}` : clean);
  if (!date) return "Enter a valid date of birth (DD-MM-YYYY)";

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (date.getTime() > today.getTime()) return "Date of birth cannot be in the future";

  let age = today.getFullYear() - date.getFullYear();
  const birthdayPassed =
    today.getMonth() > date.getMonth() || (today.getMonth() === date.getMonth() && today.getDate() >= date.getDate());
  if (!birthdayPassed) age -= 1;

  if (age > MAX_AGE_YEARS) return "Enter a valid date of birth";
  if (age < minAge) return `You must be at least ${minAge} years old to create an account`;
  return "";
}
