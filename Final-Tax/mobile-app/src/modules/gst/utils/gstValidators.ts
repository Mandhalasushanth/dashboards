import { isFutureDate } from "@/shared/formatters/dateFormatter";
import {
  validateFullName,
} from "@/shared/validators/indianTaxValidators";
import { isNotEmpty, PaymentValidators } from "@/shared/validators/paymentValidators";
import { isIanaDelegatedTld } from "./ianaTldData";
import { hsnSacPolicy } from "./hsnSacPolicy";
import { validateGstinFull } from "./gstValidation";

/**
 * GST & Tax Validation Utilities
 * Follows standard Indian Government format rules for PAN, Aadhaar, GSTIN, IFSC, etc.
 */

/**
 * Exception-safe date parser supporting both DD-MM-YYYY and ISO YYYY-MM-DD formats.
 */
export const parseAnyDate = (value?: string | null): Date | null => {
  if (!value) return null;
  const clean = value.trim();
  const m1 = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/.exec(clean);
  const m2 = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:T.*)?$/.exec(clean);
  const [y, m, d] = m1 ? [Number(m1[3]), Number(m1[2]) - 1, Number(m1[1])] : m2 ? [Number(m2[1]), Number(m2[2]) - 1, Number(m2[3])] : [];
  if (y === undefined || m === undefined || d === undefined) return null;
  const dt = new Date(y, m, d);
  return dt.getFullYear() === y && dt.getMonth() === m && dt.getDate() === d ? dt : null;
};

/**
 * RFC 5322-compliant local part pattern (no spaces, no consecutive dots, max 64 chars).
 */
const EMAIL_LOCAL_REGEX = /^[a-zA-Z0-9]+(?:[._+-][a-zA-Z0-9]+)*$/;

/**
 * Domain label pattern: 1-63 alphanumeric chars or internal hyphens.
 */
const DOMAIN_LABEL_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;

/**
 * Strict email validation for GST Registration & Compliance modules.
 * Ensures:
 * 1. Single '@' separating local part and domain.
 * 2. Local part: <= 64 chars, no spaces, no consecutive/leading/trailing dots (RFC 5322).
 * 3. Domain: <= 253 chars, at least one dot, valid DNS labels (1-63 chars, alphanumeric with internal hyphens).
 * 4. TLD: Must be an active delegated Top-Level Domain in the official IANA Root Zone Database.
 *    Strictly verifies 2-letter ccTLDs, generic TLDs, and IDN Punycode TLDs against delegated data.
 *    Strictly rejects appended suffixes such as .comabc, .com123, or .orgxyz.
 *
 * Note: Validating IANA delegation verifies syntax and root-level delegation; it does not query live
 * DNS records, verify full-domain registration, or confirm mailbox existence.
 */
export function isValidGstEmail(raw?: string | null): boolean {
  if (!raw) return false;
  const email = raw.trim();
  if (!email || email.length > 150 || /\s/.test(email)) return false;
  const atIndex = email.indexOf("@");
  if (atIndex === -1 || atIndex !== email.lastIndexOf("@")) return false;
  const local = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);
  if (!local || local.length > 64 || local.startsWith(".") || local.endsWith(".") || !EMAIL_LOCAL_REGEX.test(local)) return false;
  if (!domain || domain.length > 253 || domain.startsWith(".") || domain.endsWith(".")) return false;
  const labels = domain.split(".");
  if (labels.length < 2) return false;
  const allLabelsValid = labels.every((l) => l.length >= 1 && l.length <= 63 && DOMAIN_LABEL_REGEX.test(l));
  if (!allLabelsValid) return false;
  return isIanaDelegatedTld(labels[labels.length - 1].toLowerCase());
}

const PAN_NAME_WORD = "[\\p{L}][\\p{L}\\p{M}\\u200C\\u200D]*";
const PAN_LEGAL_NAME_REGEX = new RegExp(`^${PAN_NAME_WORD}(?:(?:\\. ?|[ '’-])${PAN_NAME_WORD})*\\.?$`, "u");
const ALPHABETIC_LOCATION_REGEX = /^[\p{L}\p{M}\u200C\u200D]+(?: [\p{L}\p{M}\u200C\u200D]+)*$/u;
const BUSINESS_ADDRESS_CHARS_REGEX = /^[\p{L}\p{M}\u200C\u200D0-9\p{N} .,\/\-'’()#:–—&]+$/u;

const validateLocationField = (label: "City" | "District", value: string): string => {
  const clean = (value || "").trim();
  if (!clean) return `${label} is required`;
  if (clean.length < 2) return `${label} must be at least 2 characters`;
  if (clean.length > 50) return `${label} cannot exceed 50 characters`;
  if (/[0-9\p{N}]/u.test(clean)) return `${label} cannot contain numbers`;
  if (clean !== value || /\s{2,}/.test(clean) || !ALPHABETIC_LOCATION_REGEX.test(clean)) {
    return `Enter a valid ${label.toLowerCase()} name`;
  }
  return "";
};

const validateBankAccountCore = (value?: string | null, requiredMsg = "Bank account number is required"): string => {
  const raw = value !== null && value !== undefined ? String(value) : "";
  if (!raw.trim()) return requiredMsg;
  if (/[^0-9]/.test(raw)) return "Account number must contain digits only.";
  if (/^0+$/.test(raw)) return "Enter a valid bank account number. An account number cannot contain only zeros.";
  if (raw.length < 9 || raw.length > 18) return "Enter a valid bank account number (9 to 18 digits)";
  return "";
};

const SIGNATORY_WORD = "[\\p{L}][\\p{L}\\p{M}\\u200C\\u200D]*";
const SIGNATORY_NAME_REGEX = new RegExp(`^${SIGNATORY_WORD}(?:(?:\\. ?|[ '’-])${SIGNATORY_WORD})*\\.?$`, "u");
const INDIVIDUAL_PAN_REGEX = /^[A-Z]{3}P[A-Z][0-9]{4}[A-Z]$/;
const SIGNATORY_DESIGNATION_REGEX = /^[\p{L}\p{M}\u200C\u200D]+(?:[ /&'’.,-]+[\p{L}\p{M}\u200C\u200D]+)*\.?$/u;

const validateSignatoryName = (value?: string | null): string => {
  const raw = value !== null && value !== undefined ? String(value) : "";
  if (!raw.trim()) return "Signatory name is required.";
  if (raw.startsWith(" ") || raw.endsWith(" ") || /\s{2,}/.test(raw) || /[\r\n\t\f\v]/.test(raw)) {
    return "Use a single space between name parts.";
  }
  if (raw.length < 2) return "Signatory name must be at least 2 characters";
  if (raw.length > 100) return "Signatory name cannot exceed 100 characters";
  if (!SIGNATORY_NAME_REGEX.test(raw)) return "Signatory name contains unsupported characters.";
  return "";
};

export const getEighteenYearsAgo = (): Date => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d;
};

const PAN_CATEGORY_CODES = "ABCFGHJLPT";

const validateSignatoryPan = (value?: string | null): string => {
  const raw = value !== null && value !== undefined ? String(value) : "";
  const clean = raw.trim().toUpperCase();
  if (!clean) return "Enter a valid 10-character PAN.";
  if (clean.length >= 4 && !PAN_CATEGORY_CODES.includes(clean[3])) {
    return "4th character of PAN must be one of A, B, C, F, G, H, J, L, P, T";
  }
  if (clean.length !== 10 || !/^[A-Z]{3}[ABCFGHJLPT][A-Z][0-9]{4}[A-Z]$/.test(clean)) {
    return "Enter a valid 10-character PAN.";
  }
  return "";
};

const validateSignatoryDob = (value?: string | null): string => {
  const raw = value !== null && value !== undefined ? String(value) : "";
  if (!raw.trim()) return "Date of birth is required";
  const dob = parseAnyDate(raw);
  if (!dob) return "Enter a valid date in DD-MM-YYYY format";
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const selected = new Date(dob.getFullYear(), dob.getMonth(), dob.getDate());
  if (selected.getTime() > today.getTime()) return "Date of birth cannot be in the future.";
  if (selected.getTime() === today.getTime()) return "Date of birth must be earlier than today.";
  if (dob.getFullYear() < today.getFullYear() - 120) return "Enter a valid date of birth";
  return "";
};

const validateSignatoryDesignation = (value?: string | null): string => {
  const raw = value !== null && value !== undefined ? String(value) : "";
  if (!raw.trim()) return "Designation is required.";
  if (raw.startsWith(" ") || raw.endsWith(" ") || /\s{2,}/.test(raw) || /[\r\n\t\f\v]/.test(raw)) {
    return "Use a single space between words.";
  }
  if (/[0-9\p{N}]/u.test(raw)) {
    return "Designation contains unsupported characters.";
  }
  if (raw.length > 50) return "Designation cannot exceed 50 characters";
  if (!SIGNATORY_DESIGNATION_REGEX.test(raw)) return "Designation contains unsupported characters.";
  return "";
};

const validateSignatoryMobile = (value?: string | null): string => {
  const raw = value !== null && value !== undefined ? String(value) : "";
  if (!raw.trim()) return "Enter a valid 10-digit mobile number";
  if (/[^0-9]/.test(raw)) return "Enter a valid mobile number.";
  if (raw.length !== 10) return "Enter a valid 10-digit mobile number";
  if (!/^[6-9]/.test(raw)) return "Enter a valid mobile number.";
  if (/^(\d)\1{9}$/.test(raw)) {
    return "This mobile number is not allowed. Enter a different number.";
  }
  return "";
};

export const GstValidators = {
  /**
   * Functional validator for Legal Name of Business (as per PAN).
   * - Enforces 2 to 100 characters.
   * - Requires at least one alphabetic character.
   * - Strictly rejects all numeric digits (0–9 / \p{N}) anywhere in the name.
   * - Supports Unicode letters (\p{L}), Indic combining marks (\p{M}), ZWJ, and ZWNJ.
   * - Supports approved name punctuation (. ' ’ -) and normal single spaces.
   * - Rejects emojis, unsupported symbols, consecutive spaces, and invalid whitespace.
   */
  isValidPanLegalName: (value: string): boolean => {
    const clean = value.trim();
    if (!clean || clean !== value || /\s{2,}/.test(clean)) return false;
    if (clean.length < 2 || clean.length > 100) return false;
    if (!/[\p{L}]/u.test(clean)) return false;
    if (/[0-9\p{N}]/u.test(clean)) return false;
    return PAN_LEGAL_NAME_REGEX.test(clean);
  },

  isValidBusinessName: (value: string): boolean => {
    const clean = value.trim();
    if (!clean || clean !== value || /\s{2,}/.test(clean)) return false;
    if (clean.length < 2 || clean.length > 100) return false;
    if (!/[\p{L}]/u.test(clean)) return false;
    return /^[\p{L}\p{M}\p{N}]+(?:[ .,&'()\/-]+[\p{L}\p{M}\p{N}]+)*\.?$/u.test(clean);
  },

  isValidBranchName: (value: string): boolean => {
    const clean = value.trim();
    if (!clean || clean !== value || /\s{2,}/.test(clean)) return false;
    return /^[\p{L}\p{N}]+(?:[ .,&'()\/-][\p{L}\p{N}]+)*$/u.test(clean);
  },

  /**
   * Strict alphabetic validator for Indian City and District names.
   * - Enforces 2 to 50 characters.
   * - Accepts Unicode letters, Indic vowel signs/combining marks, ZWJ/ZWNJ.
   * - Allows single normal space between words.
   * - Strictly rejects all numeric digits (0–9 / \p{N}) anywhere in the input.
   * - Rejects emojis, punctuation, special symbols, tabs, line breaks, repeated spaces, and leading/trailing whitespace.
   */
  isValidCity: (value: string): boolean => {
    const clean = value.trim();
    if (!clean || clean !== value || /\s{2,}/.test(clean)) return false;
    if (clean.length < 2 || clean.length > 50) return false;
    if (/[0-9\p{N}]/u.test(clean)) return false;
    return ALPHABETIC_LOCATION_REGEX.test(clean);
  },

  isValidDistrict: (value: string): boolean => GstValidators.isValidCity(value),
  isValidLocationName: (value: string): boolean => GstValidators.isValidCity(value),
  validateCity: (value: string): string => validateLocationField("City", value),
  validateDistrict: (value: string): string => validateLocationField("District", value),
  isValidBusinessAddress: (value: string): boolean => GstValidators.validateBusinessAddress(value) === "",
  validateBusinessAddress: (value: string): string => {
    const raw = value !== null && value !== undefined ? String(value) : "";
    const clean = raw.trim();
    if (!clean) return "Business address is required";
    if (clean.length < 5) return "Business address must be at least 5 characters";
    if (clean.length > 250) return "Business address cannot exceed 250 characters";
    if (raw !== clean || /\s{2,}/.test(clean) || /[\r\n\t]/.test(raw)) return "Enter a valid business address";
    if (!BUSINESS_ADDRESS_CHARS_REGEX.test(clean)) return "Business address contains unsupported characters";
    if (!/[\p{L}]/u.test(clean)) return "Enter a valid business address";
    return "";
  },

  /**
   * Validates Indian PAN Number: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F)
   */
  isValidPan: (pan: string): boolean => {
    const cleanPan = pan.trim().toUpperCase();
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(cleanPan);
  },

  /**
   * Validates 12-digit Indian Aadhaar Number (allows spaces/dashes)
   */
  isValidAadhaar: (aadhaar: string): boolean => {
    const cleanAadhaar = aadhaar.replace(/[\s-]/g, "");
    return /^\d{12}$/.test(cleanAadhaar);
  },

  /**
   * Validates 10-digit Indian Mobile Number starting with 6, 7, 8, or 9 (rejects dummy / identical numbers)
   */
  isValidMobile: (mobile: string): boolean => validateSignatoryMobile(mobile) === "",
  validateSignatoryName: (value?: string | null): string => validateSignatoryName(value),
  isValidSignatoryName: (value?: string | null): boolean => validateSignatoryName(value) === "",
  validateSignatoryPan: (value?: string | null): string => validateSignatoryPan(value),
  isValidSignatoryPan: (value?: string | null): boolean => validateSignatoryPan(value) === "",
  validateSignatoryDob: (value?: string | null): string => validateSignatoryDob(value),
  isValidSignatoryDob: (value?: string | null): boolean => validateSignatoryDob(value) === "",
  validateSignatoryDesignation: (value?: string | null): string => validateSignatoryDesignation(value),
  isValidSignatoryDesignation: (value?: string | null): boolean => validateSignatoryDesignation(value) === "",
  validateSignatoryMobile: (value?: string | null): string => validateSignatoryMobile(value),
  isValidSignatoryMobile: (value?: string | null): boolean => validateSignatoryMobile(value) === "",

  /**
   * Validates Email Address format using strict RFC syntax and recognized TLD rules.
   */
  isValidEmail: (email: string): boolean => {
    return isValidGstEmail(email);
  },

  isBankAccountMatch: (account?: string | null, confirmation?: string | null): boolean =>
    Boolean(account && confirmation && account.trim() === confirmation.trim()),

  /**
   * Validates Indian 15-character GSTIN (e.g. 29PAVAN1234K1Z5)
   */
  isValidGstin: (gstin: string): boolean => {
    return validateGstinFull(gstin) === null;
  },

  /**
   * Validates 11-character Indian IFSC Code (e.g. HDFC0001234, SBIN0001234)
   */
  isValidIfsc: (ifsc: string): boolean => {
    const cleanIfsc = ifsc.trim().toUpperCase();
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return ifscRegex.test(cleanIfsc);
  },

  /**
   * Validates Bank Account Number (between 9 and 18 digits, digits only, not all zeros)
   */
  isValidBankAccount: (account?: string | null): boolean =>
    account ? validateBankAccountCore(account) === "" : false,

  validateBankAccountNumber: (value?: string | null): string =>
    validateBankAccountCore(value, "Bank account number is required"),

  validateConfirmBankAccountNumber: (value?: string | null, original?: string | null): string => {
    const raw = value !== null && value !== undefined ? String(value) : "";
    if (!raw.trim()) return "Confirm account number is required";
    if (/[^0-9]/.test(raw)) return "Account number must contain digits only.";
    if (/^0+$/.test(raw)) return "Enter a valid bank account number. An account number cannot contain only zeros.";
    if (raw.length > 18) return "Enter a valid bank account number (9 to 18 digits)";
    const orig = original !== null && original !== undefined ? String(original) : "";
    if (orig.trim().length > 0) {
      if (raw !== orig) return "Account numbers do not match.";
      if (raw.length < 9) return "Enter a valid bank account number (9 to 18 digits)";
      return "";
    }
    if (raw.length < 9) return "Enter a valid bank account number (9 to 18 digits)";
    return "";
  },

  /**
   * Functional validator for Indian PIN Code.
   * - Must contain exactly 6 numeric digits.
   * - First digit must be between 1 and 9 (cannot start with 0).
   * - Strictly rejects letters, spaces, special characters, and non-digit input.
   */
  isValidPinCode: (pin?: string | null): boolean => (!pin ? false : /^[1-9]\d{5}$/.test(pin)),
  validatePinCode: (value?: string | null): string => {
    const raw = value !== null && value !== undefined ? String(value) : "";
    if (!raw.trim()) return "PIN code is required";
    if (/[^0-9]/.test(raw)) return "PIN code must contain digits only";
    if (raw.startsWith("0")) return "PIN code cannot start with 0";
    if (raw.length > 6) return "PIN code cannot exceed 6 digits";
    if (raw.length < 6) return "PIN code must contain exactly 6 digits";
    return "";
  },

  isValidHsnCode: (code?: string | null): boolean => hsnSacPolicy.isValidCode(code),
  validateHsnCode: (code?: string | null): string => hsnSacPolicy.validateCode(code),

  // Payment instrument and generic length checks live in the shared layer.
  isValidUpi: PaymentValidators.isValidUpi,
  isNotEmpty,
  isValidCardNumber: PaymentValidators.isValidCardNumber,
  isValidExpiry: PaymentValidators.isValidExpiry,
  isValidCvv: PaymentValidators.isValidCvv,
  validateCard: PaymentValidators.validateCard,
  validateNetBanking: PaymentValidators.validateNetBanking,

  /**
   * Functional field-level validator for GST Business Step
   */
  validateBusinessField: (field: string, value: string, context?: Record<string, string>): string => {
    switch (field) {
      case "legalName": {
        const clean = value.trim();
        if (!clean) return "Legal Name is required";
        if (clean.length < 2) return "Legal Name must be at least 2 characters";
        if (clean.length > 100) return "Legal Name cannot exceed 100 characters";
        if (/[0-9\p{N}]/u.test(clean)) return "Legal Name cannot contain numbers";
        if (!GstValidators.isValidPanLegalName(value)) return "Enter a valid legal business name";
        return "";
      }
      case "businessName":
      case "registeredBusinessName": {
        const clean = value.trim();
        if (!clean) return "Business / Trade Name is required";
        if (clean.length < 2) return "Trade Name must be at least 2 characters";
        if (clean.length > 100) return "Trade Name cannot exceed 100 characters";
        if (!/[\p{L}]/u.test(clean)) return "Trade Name cannot be purely numeric";
        if (!GstValidators.isValidBusinessName(value)) return "Enter a valid business or trade name";
        return "";
      }
      case "businessType": return GstValidators.isNotEmpty(value, 2) ? "" : "Please select a business type";
      case "natureOfBusiness": return GstValidators.isNotEmpty(value, 2) ? "" : "Please select nature of business";
      case "businessStartDate": {
        if (!GstValidators.isNotEmpty(value, 1)) return "Business start date is required";
        const startDate = parseAnyDate(value);
        if (!startDate) return "Enter a valid date in DD-MM-YYYY format";
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const selected = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        if (selected.getTime() > today.getTime()) return "Commencement date cannot be in the future";
        return "";
      }
      case "reasonForRegistration": return GstValidators.isNotEmpty(value, 2) ? "" : "Please select a reason";
      case "compositionScheme": return GstValidators.isNotEmpty(value, 2) ? "" : "Please select an option";
      case "aadhaarConsent": return (value === "true" || value === "1") ? "" : "Please provide Aadhaar consent to continue.";
      case "businessAddress": return GstValidators.validateBusinessAddress(value);
      case "placeOfBusiness": return GstValidators.isNotEmpty(value, 2) ? "" : "Please select a place type";
      case "city": return GstValidators.validateCity(value);
      case "district": return GstValidators.validateDistrict(value);
      case "state": return GstValidators.isNotEmpty(value, 2) ? "" : "State is required";
      case "pinCode": return GstValidators.validatePinCode(value);
      case "hsnCode": return GstValidators.validateHsnCode(value);
      case "accountHolderName":
        if (!value.trim()) return "Account holder name is required";
        return validateFullName(value) ? "" : "Enter a valid account holder name";
      case "bankAccountNumber": return GstValidators.validateBankAccountNumber(value);
      case "confirmBankAccountNumber": return GstValidators.validateConfirmBankAccountNumber(value, context?.bankAccountNumber);
      case "ifscCode":
        if (!value.trim()) return "IFSC code is required";
        return GstValidators.isValidIfsc(value) ? "" : "Enter a valid 11-digit IFSC code (e.g. HDFC0001234)";
      case "bankName": return GstValidators.isNotEmpty(value, 2) ? "" : "Bank name is required";
      case "branchName":
        if (!value.trim()) return "Branch name is required";
        return GstValidators.isValidBranchName(value) ? "" : "Enter a valid branch name";
      case "accountType": return GstValidators.isNotEmpty(value, 2) ? "" : "Account type is required";
      case "signatoryName": return GstValidators.validateSignatoryName(value);
      case "businessPan": return GstValidators.validateSignatoryPan(value);
      case "signatoryPan": return GstValidators.validateSignatoryPan(value);
      case "signatoryDob": return GstValidators.validateSignatoryDob(value);
      case "signatoryDesignation": return GstValidators.validateSignatoryDesignation(value);
      case "signatoryMobile": return GstValidators.validateSignatoryMobile(value);
      case "signatoryEmail": return isValidGstEmail(value) ? "" : "Enter a valid email address";
      default:
        return "";
    }
  },

  /**
   * Functional whole-form validator for Business Details using reduce (no loops)
   */
  validateBusinessForm: (data: Record<string, string>): Record<string, string> => {
    const fields = [
      "legalName", "businessName", "businessType", "natureOfBusiness", "placeOfBusiness",
      "businessStartDate", "reasonForRegistration", "compositionScheme", "businessAddress",
      "city", "district", "state", "pinCode", "hsnCode", "accountHolderName",
      "bankAccountNumber", "confirmBankAccountNumber", "ifscCode", "bankName",
      "branchName", "accountType", "businessPan", "signatoryName", "signatoryPan", "signatoryDob",
      "signatoryDesignation", "signatoryMobile", "signatoryEmail", "aadhaarConsent",
    ];
    const errors = fields.reduce<Record<string, string>>((acc, key) => {
      const rawValue = data[key] || (key === "businessName" ? data["registeredBusinessName"] : "");
      const value = typeof rawValue === "boolean" ? String(rawValue) : String(rawValue || "");
      const error = GstValidators.validateBusinessField(key, value, data);
      return error ? { ...acc, [key]: error } : acc;
    }, {});

    if (
      !errors.bankAccountNumber &&
      !errors.confirmBankAccountNumber &&
      !GstValidators.isBankAccountMatch(data.bankAccountNumber, data.confirmBankAccountNumber)
    ) {
      errors.confirmBankAccountNumber = "Account numbers do not match.";
    }

    return errors;
  },
};
