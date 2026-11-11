import { validatePasscode } from "@/modules/authentication/validation/authSchema";
import { describePanCategoryError, describePanError } from "@/shared/validators/indianTaxValidators";
import {
  CITY_RULES,
  FATHER_SPOUSE_NAME_RULES,
  FULL_NAME_RULES,
  PROFILE_FIELD_LIMITS,
  collapseTypingSpaces,
  normalizeSpaces,
  validateAddressLine,
  validateDobForRegistration,
  validateEmailAddress,
  validateFullAddressLength,
  validateNameField,
  validateNameTyping,
  EMAIL_LOCAL_REGEX,
  VALID_TLD_REGEX,
} from "@/shared/validators/profileValidators";
import { formatSignupAddress } from "./createProfile.helpers";
import type { SignupForm } from "./types";

export const sanitizePanInput = (text: string, _currentPan?: string): string => {
  return text.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
};

export const formatDobInput = (text: string): string => {
  const digits = text.replace(/[^0-9]/g, "");
  return digits.length > 4
    ? `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 8)}`
    : digits.length > 2
      ? `${digits.slice(0, 2)}-${digits.slice(2)}`
      : digits;
};

// ─── Required fields ──────────────────────────────────────────────────────────

/**
 * The fields a user must fill on the Create Account form (the account type is chosen on the
 * previous step). Everything else is optional. The form marks exactly these with "*", and
 * `validateField` / `checkFormValidity` enforce exactly these.
 */
export const REQUIRED_FIELDS: readonly (keyof SignupForm)[] = [
  "name",
  "email",
  "gender",
  "dob",
  "fatherSpouseName",
  "pan",
  "aadhaar",
  "addressLine1",
  "city",
  "pincode",
  "state",
  "password",
  "confirmPassword",
];

export const isRequiredField = (key: keyof SignupForm): boolean => REQUIRED_FIELDS.includes(key);

// ─── Input cleanup ────────────────────────────────────────────────────────────

/** Fields whose repeated, leading and trailing spaces are cleaned up. */
const SPACE_NORMALISED_FIELDS: readonly (keyof SignupForm)[] = [
  "name",
  "fatherSpouseName",
  "addressLine1",
  "addressLine2",
  "city",
];

/** Live typing: no leading or double spaces (a single trailing space stays so the next word can be typed). */
export const cleanFieldWhileTyping = (key: keyof SignupForm, text: string): string => {
  if (key === "email") return text.replace(/\s/g, "");
  return SPACE_NORMALISED_FIELDS.includes(key) ? collapseTypingSpaces(text) : text;
};

/** On leaving a field and on submit: spaces fully normalised, email trimmed. */
export const cleanFieldOnCommit = (key: keyof SignupForm, text: string): string => {
  if (key === "email") return text.trim();
  return SPACE_NORMALISED_FIELDS.includes(key) ? normalizeSpaces(text) : text;
};

// ─── Validation ───────────────────────────────────────────────────────────────

const REQUIRED = "Required";

export const validateField = (
  key: keyof SignupForm,
  val: string,
  mobileNumber?: string,
  passwordForConfirm?: string
): string => {
  const validators: Record<keyof SignupForm, () => string> = {
    name: () => (!val.trim() ? REQUIRED : validateNameField(val, FULL_NAME_RULES)),
    email: () => (!val.trim() ? REQUIRED : validateEmailAddress(val)),
    gender: () => (val ? "" : REQUIRED),
    dob: () => (!val.trim() ? REQUIRED : validateDobForRegistration(val)),
    fatherSpouseName: () => (!val.trim() ? REQUIRED : validateNameField(val, FATHER_SPOUSE_NAME_RULES)),
    pan: () => (!val.trim() ? REQUIRED : describePanError(val)),
    aadhaar: () => {
      const c = val.replace(/\D/g, "");
      return !c ? REQUIRED : c.length !== 12 || !/^[2-9]{1}[0-9]{11}$/.test(c) ? "Invalid Aadhaar" : "";
    },
    addressLine1: () => (!val.trim() ? REQUIRED : validateAddressLine(val, "Address Line 1")),
    addressLine2: () => validateAddressLine(val, "Address Line 2"),
    city: () => (!val.trim() ? REQUIRED : validateNameField(val, CITY_RULES)),
    pincode: () => {
      const c = val.replace(/\D/g, "");
      return !c ? REQUIRED : c.length !== 6 ? "PIN Code must be 6 digits" : "";
    },
    state: () => (val ? "" : REQUIRED),
    mobileNumber: () => "",
    password: () =>
      !val
        ? REQUIRED
        : val.length < 6
          ? "Passcode must be 6 digits"
          : !validatePasscode(val, mobileNumber).valid
            ? validatePasscode(val, mobileNumber).error || "Invalid passcode"
            : "",
    confirmPassword: () =>
      !val ? REQUIRED : val !== passwordForConfirm ? "Passcodes do not match" : "",
    customerType: () => (val ? "" : REQUIRED),
  };
  return validators[key]?.() ?? "";
};

/** The server joins the address parts into one 500-character column; "" when they fit. */
export const validateFormAddressLength = (form: SignupForm): string =>
  validateFullAddressLength(formatSignupAddress(form));

/**
 * Feedback while typing: only definite mistakes (digits or symbols in a name, a bad PAN category,
 * an over-long value), never "not finished yet". The complete check runs on blur and on submit.
 */
export const validateRealTimeField = (
  key: keyof SignupForm,
  val: string,
  form: SignupForm,
  mobileNumber?: string
): string => {
  switch (key) {
    case "name":
      return validateNameTyping(val, FULL_NAME_RULES);
    case "fatherSpouseName":
      return validateNameTyping(val, FATHER_SPOUSE_NAME_RULES);
    case "city":
      return validateNameTyping(val, CITY_RULES);
    case "addressLine1":
    case "addressLine2": {
      if (!val) return "";
      // Punctuation and spacing are judged when the field is left; here only forbidden symbols.
      const complete = validateAddressLine(val, key === "addressLine1" ? "Address Line 1" : "Address Line 2");
      return complete.includes("can contain only") || complete.includes("longer than") ? complete : "";
    }
    case "email": {
      if (!val) return "";
      if (val.includes("..")) return "Email cannot contain consecutive dots";
      const atIndex = val.indexOf("@");
      if (atIndex === -1) {
        if (/[^a-zA-Z0-9._+-]/.test(val)) {
          return "Email can only contain letters, numbers, and . _ - +";
        }
      } else {
        const local = val.slice(0, atIndex);
        const domain = val.slice(atIndex + 1);
        if (/[^a-zA-Z0-9._+-]/.test(local)) {
          return "Email can only contain letters, numbers, and . _ - +";
        }
        if (domain && /[^a-zA-Z0-9.-]/.test(domain)) {
          return "Email domain contains invalid characters";
        }
        if (domain.includes(".")) {
          const parts = domain.split(".");
          const tld = parts[parts.length - 1].toLowerCase();
          if (tld.length >= 3 && !VALID_TLD_REGEX.test(tld)) {
            return "Enter a valid domain extension (e.g. .com, .in)";
          }
        }
      }
      return "";
    }
    case "dob": {
      if (!val) return "";
      if (val.length === 10) return validateDobForRegistration(val);
      return "";
    }
    case "pan": {
      const clean = val.trim().toUpperCase();
      if (!clean) return "";
      if (clean.length >= 4 && describePanCategoryError(clean)) {
        return describePanCategoryError(clean);
      }
      if (clean.length === 10) {
        return describePanError(clean);
      }
      return "";
    }
    case "aadhaar": {
      const clean = val.replace(/\D/g, "");
      if (!clean) return "";
      if (clean.length === 12) {
        return /^[2-9]{1}[0-9]{11}$/.test(clean) ? "" : "Invalid Aadhaar (must start with 2-9)";
      }
      return "";
    }
    case "pincode": {
      const clean = val.replace(/\D/g, "");
      if (!clean) return "";
      if (clean.length === 6) {
        return /^[1-9]{1}[0-9]{5}$/.test(clean) ? "" : "PIN Code cannot start with 0";
      }
      return "";
    }
    case "password": {
      if (!val) return "";
      if (val.length === 6) {
        const res = validatePasscode(val, mobileNumber || form.mobileNumber);
        return res.valid ? "" : (res.error || "Invalid passcode");
      }
      return "";
    }
    case "confirmPassword": {
      if (!val) return "";
      if (val.length === 6) {
        return val === form.password ? "" : "Passcodes do not match";
      }
      return "";
    }
    default:
      return "";
  }
};

/** True when every required field passes `validateField`, the optional address line 2 is acceptable and the terms are accepted. */
export const checkFormValidity = (
  form: SignupForm,
  agreedToTerms: boolean,
  mobileNumber?: string
): boolean =>
  agreedToTerms &&
  REQUIRED_FIELDS.every((key) => validateField(key, form[key], mobileNumber, form.password) === "") &&
  validateField("addressLine2", form.addressLine2) === "" &&
  validateFormAddressLength(form) === "";

export { PROFILE_FIELD_LIMITS };
