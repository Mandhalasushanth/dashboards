/**
 * TDS Refund Validation Utilities
 * Strict Indian PAN, Aadhaar, IFSC, Bank, Date of Birth, Email, PIN, and Document checks.
 */

export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
export const AADHAAR_REGEX = /^[2-9]{1}[0-9]{11}$/;
export const MOBILE_REGEX = /^[6-9][0-9]{9}$/;
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const PINCODE_REGEX = /^[1-9][0-9]{5}$/;
export const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
export const ACCOUNT_NUMBER_REGEX = /^[0-9]{9,18}$/;

export {
  sanitizeNameInput,
  sanitizeNameOnBlur,
  isValidName,
  getNameValidationError,
} from "@/shared/validators/nameValidator";

export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB standard
export const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"];

export function isValidPan(pan: string): boolean {
  if (!pan) return false;
  return PAN_REGEX.test(pan.trim().toUpperCase());
}

export function cleanPan(text: string): string {
  return text.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 10);
}

export function isValidAadhaar(aadhaar: string): boolean {
  if (!aadhaar) return false;
  const clean = aadhaar.replace(/\s+/g, "");
  return AADHAAR_REGEX.test(clean);
}

export function cleanAadhaar(text: string): string {
  return text.replace(/[^0-9]/g, "").slice(0, 12);
}

export function isValidMobile(mobile: string): boolean {
  if (!mobile) return false;
  const clean = mobile.replace(/[^0-9]/g, "");
  return clean.length === 10 && MOBILE_REGEX.test(clean);
}

export function cleanMobile(text: string): string {
  return text.replace(/[^0-9]/g, "").slice(0, 10);
}

export function isValidEmail(email: string): boolean {
  if (!email) return false;
  return EMAIL_REGEX.test(email.trim().toLowerCase());
}

export function isValidPinCode(pin: string): boolean {
  if (!pin) return false;
  return PINCODE_REGEX.test(pin.trim());
}

export function cleanPinCode(text: string): string {
  return text.replace(/[^0-9]/g, "").slice(0, 6);
}

export function isValidIfsc(ifsc: string): boolean {
  if (!ifsc) return false;
  return IFSC_REGEX.test(ifsc.trim().toUpperCase());
}

export function cleanIfsc(text: string): string {
  return text.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 11);
}

export function isValidAccountNumber(acc: string): boolean {
  if (!acc) return false;
  const clean = acc.replace(/[^0-9]/g, "");
  return ACCOUNT_NUMBER_REGEX.test(clean);
}

export function cleanAccountNumber(text: string): string {
  return text.replace(/[^0-9]/g, "").slice(0, 18);
}

export function isValidDob(dob: string): { isValid: boolean; error?: string } {
  if (!dob || !dob.trim()) {
    return { isValid: false, error: "Date of Birth is required" };
  }

  // Expect DD/MM/YYYY or YYYY-MM-DD
  let day: number, month: number, year: number;

  if (dob.includes("/")) {
    const parts = dob.split("/");
    if (parts.length !== 3) return { isValid: false, error: "Enter DOB as DD/MM/YYYY" };
    day = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10) - 1;
    year = parseInt(parts[2], 10);
  } else if (dob.includes("-")) {
    const parts = dob.split("-");
    if (parts.length !== 3) return { isValid: false, error: "Enter DOB as DD/MM/YYYY" };
    if (parts[0].length === 4) {
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      day = parseInt(parts[2], 10);
    } else {
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      year = parseInt(parts[2], 10);
    }
  } else {
    return { isValid: false, error: "Enter DOB as DD/MM/YYYY" };
  }

  const dateObj = new Date(year, month, day);
  if (
    dateObj.getFullYear() !== year ||
    dateObj.getMonth() !== month ||
    dateObj.getDate() !== day
  ) {
    return { isValid: false, error: "Enter a valid calendar date" };
  }

  const now = new Date();
  if (dateObj > now) {
    return { isValid: false, error: "Date of Birth cannot be in the future" };
  }

  const age = now.getFullYear() - year - (now < new Date(now.getFullYear(), month, day) ? 1 : 0);
  if (age < 18) {
    return { isValid: false, error: "Taxpayer must be at least 18 years old" };
  }
  if (age > 120) {
    return { isValid: false, error: "Enter a valid Date of Birth" };
  }

  return { isValid: true };
}

export function parsePositiveNumber(val: string | number | undefined | null): number {
  if (val === undefined || val === null) return 0;
  if (typeof val === "number") return isNaN(val) || val < 0 ? 0 : val;
  const clean = val.replace(/[^0-9.]/g, "");
  const num = parseFloat(clean);
  return isNaN(num) || num < 0 ? 0 : num;
}

export function formatCurrency(amount: number): string {
  const rounded = Math.round(amount);
  return `₹${rounded.toLocaleString("en-IN")}`;
}

export function isFileSizeValid(bytes?: number, maxBytes: number = MAX_FILE_SIZE_BYTES): boolean {
  if (bytes === undefined || bytes === null) return true;
  return bytes <= maxBytes;
}

export function isFileTypeAllowed(filename: string, allowedExtensions: string[] = ALLOWED_EXTENSIONS): boolean {
  if (!filename) return false;
  const lower = filename.toLowerCase();
  return allowedExtensions.some((ext) => lower.endsWith(ext.toLowerCase()));
}

export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return "0 KB";
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${Math.round(kb)} KB`;
  }
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

export function generateApplicationId(): string {
  const year = new Date().getFullYear();
  const randomSeq = String(Math.floor(10000 + Math.random() * 90000));
  return `TDS-${year}-${randomSeq}`;
}
