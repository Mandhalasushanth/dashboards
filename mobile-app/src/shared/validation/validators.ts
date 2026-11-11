import {
  validatePan,
  validateEmail,
  validatePhone,
  validateDateOfBirth,
  validateIfsc,
  validateBankAccountNumber,
} from "../validators/indianTaxValidators";
import { getNameValidationError } from "../validators/nameValidator";
import { validateGstinFull } from "@/modules/gst/utils/gstValidation";

export type ValidationRule<T = any> = (value: T) => string | null;

export const validators = {
  /** Required non-empty string validation */
  required: (fieldName = "Field"): ValidationRule<string | undefined> => (value) => {
    if (value === undefined || value === null || String(value).trim() === "") {
      return `${fieldName} is required`;
    }
    return null;
  },

  /** String field with length and whitespace validation */
  requiredText: (
    fieldName = "Field",
    options?: { minLength?: number; maxLength?: number }
  ): ValidationRule<string | undefined> => (value) => {
    if (value === undefined || value === null || String(value).trim() === "") {
      return `${fieldName} is required`;
    }
    const clean = String(value).trim();
    if (options?.minLength && clean.length < options.minLength) {
      return `${fieldName} must be at least ${options.minLength} characters`;
    }
    if (options?.maxLength && clean.length > options.maxLength) {
      return `${fieldName} must not exceed ${options.maxLength} characters`;
    }
    return null;
  },

  /** Name field validation (Strict English letters & single spaces) */
  name: (fieldName = "Name"): ValidationRule<string | undefined> => (value) => {
    return getNameValidationError(value, fieldName);
  },

  /** PAN validation */
  pan: (fieldName = "PAN"): ValidationRule<string | undefined> => (value) => {
    if (!value || String(value).trim() === "") return `${fieldName} is required`;
    if (!validatePan(String(value))) return "Enter valid 10-character Indian PAN (e.g. ABCDE1234F)";
    return null;
  },

  /** CIN validation (Corporate Identity Number) */
  cin: (fieldName = "CIN"): ValidationRule<string | undefined> => (value) => {
    if (!value || String(value).trim() === "") return null; // optional unless specified
    const clean = String(value).trim().toUpperCase();
    const cinRegex = /^[LU]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/;
    if (!cinRegex.test(clean)) return "Enter valid 21-character CIN (e.g. L12345MH2020PLC123456)";
    return null;
  },

  /** LLPIN validation (Limited Liability Partnership Identification Number) */
  llpin: (fieldName = "LLPIN"): ValidationRule<string | undefined> => (value) => {
    if (!value || String(value).trim() === "") return null;
    const clean = String(value).trim().toUpperCase();
    const llpinRegex = /^[A-Z]{3}-\d{4}$|^[A-Z0-9]{7}$/;
    if (!llpinRegex.test(clean)) return "Enter valid LLPIN format (e.g. AAA-1234)";
    return null;
  },

  /** Email validation */
  email: (fieldName = "Email"): ValidationRule<string | undefined> => (value) => {
    if (!value || String(value).trim() === "") return `${fieldName} is required`;
    if (!validateEmail(String(value))) return "Enter valid email address";
    return null;
  },

  /** Mobile phone validation (10 digits starting 6-9) */
  phone: (fieldName = "Phone Number"): ValidationRule<string | undefined> => (value) => {
    if (!value || String(value).trim() === "") return `${fieldName} is required`;
    if (!validatePhone(String(value))) return "Enter valid 10-digit Indian mobile number";
    return null;
  },

  /** Amount validation */
  amount: (
    fieldName = "Amount",
    options?: { min?: number; max?: number }
  ): ValidationRule<string | number | undefined> => (value) => {
    if (value === undefined || value === null || String(value).trim() === "") {
      return `${fieldName} is required`;
    }
    const num = Number(value);
    if (isNaN(num)) return `${fieldName} must be numeric`;
    if (num <= 0) return `${fieldName} must be greater than 0`;
    if (options?.min && num < options.min) return `${fieldName} minimum is ₹${options.min.toLocaleString("en-IN")}`;
    if (options?.max && num > options.max) return `${fieldName} maximum is ₹${options.max.toLocaleString("en-IN")}`;
    return null;
  },

  /** Loan amount validation */
  loanAmount: (
    options?: { min?: number; max?: number }
  ): ValidationRule<string | number | undefined> =>
    validators.amount("Loan Amount", { min: options?.min || 10000, max: options?.max || 100000000 }),

  /** Tenure validation */
  tenure: (
    options?: { allowed?: (number | string)[]; min?: number; max?: number }
  ): ValidationRule<string | number | undefined> => (value) => {
    if (value === undefined || value === null || String(value).trim() === "") {
      return "Repayment tenure is required";
    }
    const valStr = String(value).trim();
    if (options?.allowed && options.allowed.length > 0) {
      const isAllowed = options.allowed.some((a) => String(a) === valStr);
      if (!isAllowed) return "Select a valid tenure option";
      return null;
    }
    const num = Number(valStr);
    if (isNaN(num) || num <= 0) return "Select a valid tenure";
    if (options?.min && num < options.min) return `Minimum tenure is ${options.min} months`;
    if (options?.max && num > options.max) return `Maximum tenure is ${options.max} months`;
    return null;
  },

  /** Date validation */
  date: (
    fieldName = "Date",
    options?: { noFuture?: boolean }
  ): ValidationRule<string | undefined> => (value) => {
    if (!value || String(value).trim() === "") return `${fieldName} is required`;
    if (options?.noFuture && !validateDateOfBirth(String(value))) {
      return `${fieldName} cannot be in the future or invalid`;
    }
    return null;
  },

  /** Dropdown option selection validation */
  dropdown: (fieldName = "Selection"): ValidationRule<string | undefined> => (value) => {
    if (!value || String(value).trim() === "" || value === "Select" || value === "DEFAULT") {
      return `Please select ${fieldName.toLowerCase()}`;
    }
    return null;
  },

  /** Radio selection validation */
  radio: (fieldName = "Option"): ValidationRule<any> => (value) => {
    if (value === undefined || value === null || value === "") {
      return `Please select an option for ${fieldName}`;
    }
    return null;
  },

  /** Document uploaded presence validation */
  document: (docName = "Document"): ValidationRule<{ fileUri?: string } | undefined> => (doc) => {
    if (!doc || !doc.fileUri || doc.fileUri.trim() === "") {
      return `Please upload required document: ${docName}`;
    }
    return null;
  },

  /** Generic numeric validator */
  numeric: (
    fieldName = "Number",
    options?: { min?: number; max?: number; allowNegative?: boolean }
  ): ValidationRule<string | number | undefined> => (value) => {
    if (value === undefined || value === null || String(value).trim() === "") {
      return `${fieldName} is required`;
    }
    const num = Number(value);
    if (isNaN(num)) return `${fieldName} must be a valid number`;
    if (!options?.allowNegative && num < 0) return `${fieldName} cannot be negative`;
    if (options?.min !== undefined && num < options.min) return `${fieldName} cannot be less than ${options.min}`;
    if (options?.max !== undefined && num > options.max) return `${fieldName} cannot exceed ${options.max}`;
    return null;
  },

  /** IFSC validator */
  ifsc: (fieldName = "IFSC Code"): ValidationRule<string | undefined> => (value) => {
    if (!value || String(value).trim() === "") return `${fieldName} is required`;
    if (!validateIfsc(String(value))) return "Enter valid 11-character IFSC code (e.g. SBIN0001234)";
    return null;
  },

  /** Bank account number: 9–18 digits, digits only, not all zeros */
  bankAccountNumber: (fieldName = "Account Number"): ValidationRule<string | undefined> => (value) => {
    if (!value || String(value).trim() === "") return `${fieldName} is required`;
    const clean = String(value).trim();
    if (!/^[0-9]+$/.test(clean)) return `${fieldName} must contain digits only`;
    if (/^0+$/.test(clean)) return `${fieldName} cannot be all zeros`;
    if (!validateBankAccountNumber(clean)) return `${fieldName} must be between 9 and 18 digits`;
    return null;
  },

  /** GSTIN validator */
  gstin: (): ValidationRule<string | undefined> => (value) => {
    if (!value || String(value).trim() === "") return "Enter GSTIN";
    return validateGstinFull(String(value));
  },
};

export default validators;
