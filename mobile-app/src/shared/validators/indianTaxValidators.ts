import { parseDDMMYYYY } from "@/shared/formatters/dateFormatter";
import { isValidEmailAddress, isValidPersonName } from "./profileValidators";
import { validateGstinFull } from "@/modules/gst/utils/gstValidation";

/**
 * Valid 4th characters of a PAN, the taxpayer category: A association of persons, B body of
 * individuals, C company, F firm / LLP, G government, H HUF, J artificial juridical person,
 * L local authority, P individual, T trust.
 */
export const PAN_CATEGORY_CODES = "ABCFGHJLPT";
export const PAN_REGEX = new RegExp(`^[A-Z]{3}[${PAN_CATEGORY_CODES}][A-Z][0-9]{4}[A-Z]$`);
const PAN_SHAPE_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{3}[ABCFGHJLPT][A-Z][0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
export const AADHAAR_REGEX = /^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/;
export const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
export const BANK_ACCOUNT_REGEX = /^[0-9]{9,18}$/;
export const PINCODE_REGEX = /^[1-9]{1}[0-9]{2}[0-9]{3}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^[6-9]\d{9}$/;

export function validatePan(pan: string): boolean {
  if (!pan) return false;
  return PAN_REGEX.test(pan.trim().toUpperCase());
}

export function validateGstin(gstin: string): boolean {
  if (!gstin) return false;
  return validateGstinFull(gstin) === null;
}

export function validateAadhaar(aadhaar: string): boolean {
  if (!aadhaar) return false;
  const clean = aadhaar.replace(/\s+/g, "");
  return AADHAAR_REGEX.test(clean);
}

export function validateIfsc(ifsc: string): boolean {
  if (!ifsc) return false;
  return IFSC_REGEX.test(ifsc.trim().toUpperCase());
}

export function validateBankAccountNumber(accountNumber: string): boolean {
  if (!accountNumber) return false;
  const clean = accountNumber.trim();
  return BANK_ACCOUNT_REGEX.test(clean) && !/^0+$/.test(clean);
}

export function validatePincode(pincode: string): boolean {
  if (!pincode) return false;
  return PINCODE_REGEX.test(pincode.trim());
}

/** "" unless the PAN has a 4th character and it is not a taxpayer category. */
export function describePanCategoryError(pan: string): string {
  const clean = (pan || "").trim().toUpperCase();
  if (clean.length < 4 || PAN_CATEGORY_CODES.includes(clean[3])) return "";
  return `4th character of PAN must be one of ${PAN_CATEGORY_CODES.split("").join(", ")}`;
}

/** "" when the PAN is valid, else why not (length, overall shape, or the 4th-character category). */
export function describePanError(pan: string): string {
  const clean = (pan || "").trim().toUpperCase();
  if (!clean) return "";
  if (clean.length !== 10) return "PAN must be 10 characters, for example ABCPE1234F";
  if (!PAN_SHAPE_REGEX.test(clean)) return "PAN must be 5 letters, 4 digits, then 1 letter";
  return describePanCategoryError(clean);
}

/** Structured check (see profileValidators.validateEmailAddress for the rules and messages). */
export function validateEmail(email: string): boolean {
  return isValidEmailAddress(email);
}

/** Person-name check: letters with marks, spaces and . ' - ; 2 to 100 characters; no digits or emoji. */
export function validateFullName(name: string): boolean {
  return isValidPersonName(name);
}

/**
 * Date of birth in DD-MM-YYYY (form) or YYYY-MM-DD (API) format: a real
 * calendar date, not in the future and at most 120 years ago.
 * Calendar parsing is delegated to the shared parseDDMMYYYY so every DD-MM-YYYY
 * field in the app validates dates the same way.
 */
export function validateDateOfBirth(value: string): boolean {
  const clean = (value || "").trim();
  const apiFormat = /^(\d{4})-(\d{2})-(\d{2})$/.exec(clean);
  const date = parseDDMMYYYY(
    apiFormat ? `${apiFormat[3]}-${apiFormat[2]}-${apiFormat[1]}` : clean,
  );
  if (!date) return false;

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return date.getFullYear() >= today.getFullYear() - 120 && date <= today;
}

export function validatePhone(phone: string): boolean {
  if (!phone) return false;
  const clean = phone.replace(/\D/g, "");
  return PHONE_REGEX.test(clean);
}
