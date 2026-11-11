import { validatePan, validatePincode, validateEmail, validatePhone } from "../../../shared/validators/indianTaxValidators";
import { validateGstinFull } from "../utils/gstValidation";

export function validateGstRegistration(values: {
  businessName?: string;
  pan?: string;
  email?: string;
  phone?: string;
  pincode?: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!values.businessName?.trim()) {
    errors.businessName = "Business name is required";
  }

  if (values.pan && !validatePan(values.pan)) {
    errors.pan = "Valid 10-digit PAN is required";
  }

  if (values.email && !validateEmail(values.email)) {
    errors.email = "Valid email address is required";
  }

  if (values.phone && !validatePhone(values.phone)) {
    errors.phone = "Valid 10-digit mobile number is required";
  }

  if (values.pincode && !validatePincode(values.pincode)) {
    errors.pincode = "Valid 6-digit pincode is required";
  }

  return errors;
}

export function validateGstFiling(values: {
  gstin?: string;
  filingPeriod?: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};

  if (values.gstin) {
    const gstinErr = validateGstinFull(values.gstin);
    if (gstinErr) errors.gstin = gstinErr;
  }

  if (!values.filingPeriod?.trim()) {
    errors.filingPeriod = "Filing period is required";
  }

  return errors;
}

export default {
  validateGstRegistration,
  validateGstFiling,
};
