import { INDIAN_STATES_AND_UTS } from "@/components/screens/create-profile/types";
import { validatePincode } from "@/shared/validators/indianTaxValidators";
import {
  CITY_RULES,
  normalizeSpaces,
  validateNameField,
} from "@/shared/validators/profileValidators";
import {
  PROPERTY_PURPOSE_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  type PropertyLoanErrors,
  type PropertyLoanFormData,
} from "../types/property.types";
import { getOwnershipOptions, getStageQuestion } from "../utils/propertyFlow";
import { parseWholeRupeeAmount } from "../../utils/moneyInput";

/** Lowest and highest property loan the application accepts, in whole rupees. */
export const MIN_PROPERTY_LOAN_AMOUNT = 100000;
export const MAX_PROPERTY_LOAN_AMOUNT = 1000000000;
/** Length of the free-text "Please specify" fields. */
export const PROPERTY_OTHER_MAX_LENGTH = 60;
export const PROPERTY_CITY_MAX_LENGTH = 50;

function describeAmountProblem(raw: string): string | null {
  const amount = parseWholeRupeeAmount(raw);
  if (!raw.trim()) return "Enter the requested loan amount";
  if (raw.includes(".")) return "Enter whole rupees without paise";
  if (amount === null) return "Enter the loan amount in numbers only";
  if (amount <= 0) return "Enter the requested loan amount";
  if (amount < MIN_PROPERTY_LOAN_AMOUNT) {
    return `Minimum loan amount is ₹${MIN_PROPERTY_LOAN_AMOUNT.toLocaleString("en-IN")}`;
  }
  if (amount > MAX_PROPERTY_LOAN_AMOUNT) {
    return `Maximum loan amount is ₹${MAX_PROPERTY_LOAN_AMOUNT.toLocaleString("en-IN")}`;
  }
  return null;
}

function describeSpecifyProblem(raw: string, subject: string): string | null {
  const text = normalizeSpaces(raw);
  if (!text) return `Please specify the ${subject}`;
  if (!/[\p{L}\p{N}]/u.test(text)) return `Enter a valid ${subject}`;
  if (Array.from(text).length > PROPERTY_OTHER_MAX_LENGTH) {
    return `Keep the ${subject} within ${PROPERTY_OTHER_MAX_LENGTH} characters`;
  }
  return null;
}

/** Validates Screen 2 (Property & Loan Details). Pure, no loops. */
export function validatePropertyLoanForm(data: PropertyLoanFormData): {
  isValid: boolean;
  errors: PropertyLoanErrors;
} {
  const errors: PropertyLoanErrors = {};

  const amountProblem = describeAmountProblem(data.requestedAmount ?? "");
  if (amountProblem) errors.requestedAmount = amountProblem;

  if (!(PROPERTY_PURPOSE_OPTIONS as readonly string[]).includes(data.purpose)) {
    errors.purpose = "Please select the purpose of the loan";
  } else if (data.purpose === "Other") {
    const problem = describeSpecifyProblem(data.purposeOther ?? "", "loan purpose");
    if (problem) errors.purposeOther = problem;
  }

  if (!(PROPERTY_TYPE_OPTIONS as readonly string[]).includes(data.propertyType)) {
    errors.propertyType = "Please select the property type";
  } else if (data.propertyType === "Other") {
    const problem = describeSpecifyProblem(data.propertyTypeOther ?? "", "property type");
    if (problem) errors.propertyTypeOther = problem;
  }

  const cityText = normalizeSpaces(data.city ?? "");
  if (!cityText) {
    errors.city = "Enter the property city";
  } else if (Array.from(cityText).length > PROPERTY_CITY_MAX_LENGTH) {
    errors.city = `City can be up to ${PROPERTY_CITY_MAX_LENGTH} characters`;
  } else if (validateNameField(cityText, { ...CITY_RULES, maxLength: PROPERTY_CITY_MAX_LENGTH })) {
    errors.city = "Enter a valid city name";
  }

  if (!(INDIAN_STATES_AND_UTS as readonly string[]).includes(data.state)) {
    errors.state = "Please select the state";
  }

  if (!/^\d{6}$/.test(data.pinCode ?? "") || !validatePincode(data.pinCode)) {
    errors.pinCode = "Enter a valid 6-digit PIN code";
  }

  const question = getStageQuestion(data.purpose);
  if (question) {
    const value = data[question.field];
    if (!question.options.includes(value)) {
      errors[question.field] = question.missingMessage;
    }
  }

  if (!(getOwnershipOptions(data.purpose) as readonly string[]).includes(data.ownership)) {
    errors.ownership = "Please select who owns the property";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}
