import { validatePan, validateAadhaar, validateEmail, validatePhone } from "../../../shared/validators/indianTaxValidators";
import type { ProfileFormValues, ProfileFormErrors } from "../types/customer.types";

export function validateProfile(values: Partial<ProfileFormValues>): ProfileFormErrors {
  const errors: ProfileFormErrors = {};

  if (!values.name?.trim()) {
    errors.name = "Full name is required";
  }

  if (values.email && !validateEmail(values.email)) {
    errors.email = "Valid email is required";
  }

  if (values.pan && !validatePan(values.pan)) {
    errors.pan = "Valid 10-digit PAN is required";
  }

  if (values.aadhaar && !validateAadhaar(values.aadhaar)) {
    errors.aadhaar = "Valid 12-digit Aadhaar number is required";
  }

  return errors;
}

export default validateProfile;
