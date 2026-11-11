import type { Customer } from "@/shared/types/domain";
import {
  validateDateOfBirth,
  validateEmail,
  validateFullName,
} from "@/shared/validators/indianTaxValidators";
import { toBackendDob } from "@/modules/authentication/services/customerRegistrationPayload";

export interface PersonalFormState {
  name: string;
  email: string;
  dob: string;
  address: string;
}

/** Customer-details record from the backend; other fields are passed back unchanged. */
interface StoredPersonalDetails {
  customerId?: string;
  custId?: string;
  mobileNumber?: string;
  [field: string]: unknown;
}

/** Field errors for the personal-details form; empty when valid. */
export const validatePersonalForm = (personalForm: PersonalFormState): Record<string, string> => {
  const validationCheckers = [
    {
      key: "name",
      valid: validateFullName(personalForm.name),
      msg: "Enter a valid full name",
    },
    {
      key: "email",
      valid: validateEmail(personalForm.email),
      msg: "Enter a valid email address",
    },
    {
      key: "dob",
      valid: validateDateOfBirth(personalForm.dob),
      msg: "Please enter a valid date of birth.",
    },
  ];

  return validationCheckers.reduce<Record<string, string>>(
    (acc, { key, valid, msg }) => (valid ? acc : { ...acc, [key]: msg }),
    {}
  );
};

/** Body for `authApi.updateCustomerProfile`: the stored record with the edited fields applied. */
export const buildPersonalUpdatePayload = (
  personalDetails: StoredPersonalDetails | null,
  customer: Customer | null,
  personalForm: PersonalFormState
) => ({
  ...(personalDetails || {}),
  customerId: personalDetails?.customerId || customer?.customerId,
  custId: personalDetails?.custId || customer?.customerId,
  mobileNumber: personalDetails?.mobileNumber || customer?.mobile,
  name: personalForm.name.trim().replace(/\s+/g, " "),
  email: personalForm.email.trim(),
  // BUG_B25_003: form stores DD-MM-YYYY but backend (Spring Boot LocalDate) requires YYYY-MM-DD
  dob: toBackendDob(personalForm.dob.trim()),
  address: personalForm.address.trim(),
});
