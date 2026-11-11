import {
  validateFullName,
  validatePhone,
  validateEmail,
  validatePan,
  describePanError,
  validateAadhaar,
  validateDateOfBirth,
  validatePincode,
} from "@/shared/validators/indianTaxValidators";
import { parseDDMMYYYY } from "@/shared/formatters/dateFormatter";
import { INDIAN_STATES_AND_UTS } from "@/components/screens/create-profile/types";
import type {
  LoanKycData,
  LoanKycAddress,
  LoanKycErrors,
  KycRequirementConfig,
} from "../types/loanKyc.types";

/** Longest address line the KYC form accepts. */
export const ADDRESS_LINE_MAX_LENGTH = 100;

/**
 * Validates that an applicant is at least 18 years old on current date.
 */
export function isApplicantAdult(dobStr: string): boolean {
  if (!dobStr || !validateDateOfBirth(dobStr)) return false;
  const clean = dobStr.trim();
  const apiFormat = /^(\d{4})-(\d{2})-(\d{2})$/.exec(clean);
  const normalized = apiFormat
    ? `${apiFormat[3]}-${apiFormat[2]}-${apiFormat[1]}`
    : clean;
  const birthDate = parseDDMMYYYY(normalized);
  if (!birthDate) return false;

  const today = new Date();
  const adultDate = new Date(
    birthDate.getFullYear() + 18,
    birthDate.getMonth(),
    birthDate.getDate()
  );
  return adultDate <= today;
}

/**
 * Validates a single address structure without loops.
 */
function validateAddressBlock(
  address: LoanKycAddress,
  prefix: "currentAddress" | "permanentAddress"
): Partial<LoanKycErrors> {
  const errors: Partial<LoanKycErrors> = {};

  if (!address.houseNumber?.trim()) {
    errors[`${prefix}.houseNumber` as keyof LoanKycErrors] =
      "House / Flat number is required";
  } else if (address.houseNumber.trim().length > ADDRESS_LINE_MAX_LENGTH) {
    errors[`${prefix}.houseNumber` as keyof LoanKycErrors] =
      `House / Flat number can be up to ${ADDRESS_LINE_MAX_LENGTH} characters`;
  }

  if (!address.street?.trim() || address.street.trim().length < 2) {
    errors[`${prefix}.street` as keyof LoanKycErrors] =
      "Street / Locality must be at least 2 characters";
  } else if (address.street.trim().length > ADDRESS_LINE_MAX_LENGTH) {
    errors[`${prefix}.street` as keyof LoanKycErrors] =
      `Street / Locality can be up to ${ADDRESS_LINE_MAX_LENGTH} characters`;
  }

  if (!address.city?.trim() || address.city.trim().length < 2) {
    errors[`${prefix}.city` as keyof LoanKycErrors] =
      "City / District must be at least 2 characters";
  } else if (address.city.trim().length > ADDRESS_LINE_MAX_LENGTH) {
    errors[`${prefix}.city` as keyof LoanKycErrors] =
      `City / District can be up to ${ADDRESS_LINE_MAX_LENGTH} characters`;
  }

  if (!(INDIAN_STATES_AND_UTS as readonly string[]).includes(address.state)) {
    errors[`${prefix}.state` as keyof LoanKycErrors] =
      "Please select a valid state";
  }

  if (!address.pincode?.trim()) {
    errors[`${prefix}.pincode` as keyof LoanKycErrors] =
      "PIN code is required";
  } else if (!validatePincode(address.pincode)) {
    errors[`${prefix}.pincode` as keyof LoanKycErrors] =
      "Enter a valid 6-digit Indian PIN code";
  }

  return errors;
}

/**
 * Validates the complete Loan KYC dataset using functional checks.
 * Fields like PAN, Aadhaar, DOB, and Email are conditional on KYC provider
 * and lender requirements. When provided, their format is strictly validated.
 */
export function validateLoanKyc(
  data: LoanKycData,
  requirements?: KycRequirementConfig
): {
  isValid: boolean;
  errors: LoanKycErrors;
} {
  const errors: LoanKycErrors = {};
  const reqs = requirements || {};

  // 1. Full Legal Name (Always mandatory)
  if (!data.fullName?.trim()) {
    errors.fullName = "Full Legal Name is required";
  } else if (!validateFullName(data.fullName.trim())) {
    errors.fullName = "Enter a valid full name (letters and spaces only)";
  }

  // 2. Mobile Number (Always mandatory)
  if (!data.mobile?.trim()) {
    errors.mobile = "Mobile number is required";
  } else if (/\D/.test(data.mobile.trim()) || !validatePhone(data.mobile.trim())) {
    errors.mobile = "Enter a valid 10-digit Indian mobile number";
  }

  // 3. Email Address (Mandatory only if required by lender)
  if (reqs.requireEmail) {
    if (!data.email?.trim()) {
      errors.email = "Email address is required";
    } else if (!validateEmail(data.email.trim())) {
      errors.email = "Enter a valid email address";
    }
  } else if (data.email?.trim()) {
    if (!validateEmail(data.email.trim())) {
      errors.email = "Enter a valid email address";
    }
  }

  // 4. PAN Number (Mandatory only if required by KYC provider)
  if (reqs.requirePan) {
    if (!data.pan?.trim()) {
      errors.pan = "PAN number is required";
    } else if (!validatePan(data.pan.trim())) {
      errors.pan =
        describePanError(data.pan.trim()) ||
        "Enter a valid 10-digit PAN (e.g. ABCDE1234F)";
    }
  } else if (data.pan?.trim() && !data.isProfilePrefilled) {
    if (!validatePan(data.pan.trim())) {
      errors.pan =
        describePanError(data.pan.trim()) ||
        "Enter a valid 10-digit PAN (e.g. ABCDE1234F)";
    }
  }

  // 5. Aadhaar (skipped entirely when the field is not shown to the customer)
  if (reqs.showAadhaar === false) {
    // The provider supplies it; a stale value must not block an application.
  } else if (reqs.requireAadhaar) {
    if (!data.aadhaar?.trim()) {
      errors.aadhaar = "Aadhaar number is required";
    } else {
      const rawAadhaar = data.aadhaar.replace(/\s+/g, "");
      if (!validateAadhaar(rawAadhaar)) {
        errors.aadhaar = "Enter a valid 12-digit Aadhaar number";
      }
    }
  } else if (data.aadhaar?.trim() && !data.isProfilePrefilled) {
    const rawAadhaar = data.aadhaar.replace(/\s+/g, "");
    if (!validateAadhaar(rawAadhaar)) {
      errors.aadhaar = "Enter a valid 12-digit Aadhaar number";
    }
  }

  // 6. Date of Birth (Mandatory only if required by provider, 18+ if present or required)
  if (reqs.requireDob) {
    if (!data.dob?.trim()) {
      errors.dob = "Date of Birth is required";
    } else if (!validateDateOfBirth(data.dob.trim())) {
      errors.dob = "Enter a valid date in DD-MM-YYYY format";
    } else if (!isApplicantAdult(data.dob.trim())) {
      errors.dob = "Applicant must be at least 18 years old to apply";
    }
  } else if (data.dob?.trim() && !data.isProfilePrefilled) {
    if (!validateDateOfBirth(data.dob.trim())) {
      errors.dob = "Enter a valid date in DD-MM-YYYY format";
    } else if (!isApplicantAdult(data.dob.trim())) {
      errors.dob = "Applicant must be at least 18 years old to apply";
    }
  }

  // 7. Current Address (Always mandatory)
  const currentAddressErrors = validateAddressBlock(
    data.currentAddress,
    "currentAddress"
  );
  Object.assign(errors, currentAddressErrors);

  // 8. Permanent Address (Mandatory only if not same as current)
  if (!data.isPermanentSameAsCurrent) {
    const permanentAddressErrors = validateAddressBlock(
      data.permanentAddress,
      "permanentAddress"
    );
    Object.assign(errors, permanentAddressErrors);
  }

  // 9. DPDP & KYC Consent (Always mandatory)
  if (!data.consentGiven) {
    errors.consentGiven =
      "Please authorize KYC verification and credit records consent to proceed";
  }

  const isValid = Object.keys(errors).length === 0;

  return { isValid, errors };
}
