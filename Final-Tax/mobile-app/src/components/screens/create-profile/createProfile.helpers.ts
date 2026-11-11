import { normalizeSpaces } from "@/shared/validators/profileValidators";
import type { SignupForm } from "./types";

/** "Line 1, Line 2, City, State - PIN" from the sign-up address fields, skipping empty parts. */
export const formatSignupAddress = (form: SignupForm): string =>
  [
    normalizeSpaces(form.addressLine1),
    normalizeSpaces(form.addressLine2),
    normalizeSpaces(form.city),
    form.state.trim()
      ? `${form.state.trim()} - ${form.pincode.trim()}`
      : form.pincode.trim(),
  ]
    .filter(Boolean)
    .join(", ");

/** Profile passed to `register`, with fields trimmed and normalised. */
export const buildRegistrationProfile = (
  form: SignupForm,
  fullAddress: string,
  storeMobileNumber: string
) => ({
  name: normalizeSpaces(form.name),
  email: form.email.trim(),
  customerType: form.customerType,
  dob: form.dob.trim(),
  gender: form.gender,
  fatherSpouseName: normalizeSpaces(form.fatherSpouseName),
  pan: form.pan.trim().toUpperCase(),
  aadhaar: form.aadhaar.replace(/\D/g, ""),
  address: fullAddress,
  addressLine1: normalizeSpaces(form.addressLine1),
  addressLine2: normalizeSpaces(form.addressLine2),
  city: normalizeSpaces(form.city),
  pincode: form.pincode.trim(),
  state: form.state.trim(),
  mobileNumber: form.mobileNumber || storeMobileNumber,
});
