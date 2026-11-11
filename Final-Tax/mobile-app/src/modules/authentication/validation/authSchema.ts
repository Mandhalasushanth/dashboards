import { validatePan, validateAadhaar, validateEmail } from "../../../shared/validators/indianTaxValidators";
import { normalizeIndianMobile } from "./mobileNumber";
import type { RegistrationData } from "../types/auth.types";

/** Validates a mobile number for login; `value` is the normalised 10-digit number when valid. */
export function validateLoginPhone(phone: string): { valid: boolean; error?: string; value?: string } {
  const result = normalizeIndianMobile(phone);
  return result.ok ? { valid: true, value: result.value } : { valid: false, error: result.error };
}

export function validateOtp(otp: string): { valid: boolean; error?: string } {
  const clean = otp.replace(/\D/g, "");
  if (!clean) return { valid: false, error: "Please enter the 6-digit OTP" };
  if (clean.length !== 6) return { valid: false, error: "OTP must be exactly 6 digits" };
  return { valid: true };
}

export function validatePasscode(
  passcode: string,
  mobileNumber?: string
): { valid: boolean; error?: string } {
  const clean = (passcode || "").replace(/\D/g, "");
  if (!clean) return { valid: false, error: "Passcode is required" };
  if (clean.length !== 6) return { valid: false, error: "Passcode must be exactly 6 digits" };

  // 1. Mobile Number Validation
  // Reject any passcode that matches the user's mobile number or any consecutive 6-digit portion of the registered mobile number.
  if (mobileNumber) {
    const cleanMobile = mobileNumber.replace(/\D/g, "");
    const phone10 = cleanMobile.length > 10 ? cleanMobile.slice(-10) : cleanMobile;
    if (
      (phone10.length >= 6 && phone10.includes(clean)) ||
      (cleanMobile.length >= 6 && cleanMobile.includes(clean))
    ) {
      return {
        valid: false,
        error: "Passcode cannot be part of your mobile number.",
      };
    }
  }

  // 2. Repeated Digits Validation
  // Reject passcodes where all six digits are identical (e.g. 111111, 222222, 000000, 999999).
  if (/^(\d)\1{5}$/.test(clean)) {
    return {
      valid: false,
      error: "Passcode cannot contain the same digit repeatedly.",
    };
  }

  // 3. Sequential Numbers Validation
  // Reject simple ascending or descending sequences (e.g. 123456, 234567, 345678, 654321, 987654).
  const isAscending = "0123456789".includes(clean);
  const isDescending = "9876543210".includes(clean);
  if (isAscending || isDescending) {
    return {
      valid: false,
      error: "Passcode cannot be a sequential number.",
    };
  }

  // 4. Repeating Pattern Validation
  // Reject predictable repeating patterns (e.g. 121212, 123123, 454545, 101010, 565656).
  const isRepeating2 = /^(\d{2})\1{2}$/.test(clean);
  const isRepeating3 = /^(\d{3})\1$/.test(clean);
  if (isRepeating2 || isRepeating3) {
    return {
      valid: false,
      error: "Choose a less predictable passcode.",
    };
  }

  return { valid: true };
}

export function validatePasscodeMatch(
  passcode: string,
  confirm: string,
  mobileNumber?: string
): { valid: boolean; error?: string } {
  const v = validatePasscode(passcode, mobileNumber);
  if (!v.valid) return v;
  if (passcode !== confirm) {
    return { valid: false, error: "Passcodes do not match" };
  }
  return { valid: true };
}

export function validateRegisterForm(values: Partial<RegistrationData>): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!values.name?.trim()) {
    errors.name = "Full name is required";
  }

  if (!values.email?.trim()) {
    errors.email = "Email address is required";
  } else if (!validateEmail(values.email.trim())) {
    errors.email = "Please enter a valid email address";
  }

  if (values.pan && !validatePan(values.pan.trim())) {
    errors.pan = "Please enter a valid 10-character PAN (e.g. ABCPE1234F)";
  }

  if (values.aadhaar && !validateAadhaar(values.aadhaar.trim())) {
    errors.aadhaar = "Please enter a valid 12-digit Aadhaar number";
  }

  return errors;
}

export default {
  validateLoginPhone,
  validateOtp,
  validatePasscode,
  validatePasscodeMatch,
  validateRegisterForm,
};
