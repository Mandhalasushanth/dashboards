import { parseWholeRupeeAmount } from "../../utils/moneyInput";
import {
  HOME_LOAN_PROPERTY_STATUS_OPTIONS,
  HOME_LOAN_PURPOSE_OPTIONS,
  type HomeLoanRequirementFormData,
  type HomeLoanRequirementErrors,
} from "../types/homeLoan.types";

/**
 * Validates Screen 2 of Home Loan: "Home Loan Requirement".
 * Pure functional validation without arbitrary product caps or eligibility calculations.
 */
/**
 * Most digits an amount may have. This is the capacity of the shared money input
 * (not a product limit); anything longer cannot have been typed or pasted into it.
 */
export const MAX_AMOUNT_DIGITS = 10;

/** Customer-facing problem with a rupee amount, or null when it is structurally valid. */
function describeRupees(raw: string, missingMessage: string): string | null {
  const amount = parseWholeRupeeAmount(raw);
  if (!raw.trim()) return missingMessage;
  if (raw.includes(".")) return "Enter whole rupees without paise.";
  if (amount === null) return "Enter the amount in numbers only";
  if (amount <= 0) return missingMessage;
  if (String(amount).length > MAX_AMOUNT_DIGITS) return "Enter a smaller amount";
  return null;
}

export function validateHomeLoanRequirementForm(
  data: HomeLoanRequirementFormData
): {
  isValid: boolean;
  errors: HomeLoanRequirementErrors;
} {
  const errors: HomeLoanRequirementErrors = {};

  // 1. Requested Loan Amount (required, whole rupees, digits only, above zero)
  const amountProblem = describeRupees(
    data.loanAmount || data.requestedAmount || "",
    "Enter the requested loan amount"
  );
  if (amountProblem) {
    errors.loanAmount = amountProblem;
    errors.requestedAmount = amountProblem;
  }

  // 2. Purpose of Home Loan (required, one of the offered options)
  if (!(HOME_LOAN_PURPOSE_OPTIONS as readonly string[]).includes(data.purpose)) {
    errors.purpose = "Select the purpose of the home loan";
  }

  // 3. Property Status (required, one of the offered options)
  if (
    !(HOME_LOAN_PROPERTY_STATUS_OPTIONS as readonly string[]).includes(
      data.propertyStatus
    )
  ) {
    errors.propertyStatus = "Select the property status";
  }

  // 4. Approximate Property Value (required, whole rupees, digits only, above zero)
  const valueProblem = describeRupees(
    data.approximatePropertyValue || data.propertyValue || "",
    "Enter the approximate property value"
  );
  if (valueProblem) {
    errors.approximatePropertyValue = valueProblem;
    errors.propertyValue = valueProblem;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function isHomeLoanRequirementFormFilled(
  data: HomeLoanRequirementFormData
): boolean {
  const amount = (data.loanAmount || data.requestedAmount || "").trim();
  const propVal = (
    data.approximatePropertyValue ||
    data.propertyValue ||
    ""
  ).trim();
  const amountNum = parseWholeRupeeAmount(amount);
  const propValNum = parseWholeRupeeAmount(propVal);

  return (
    Boolean(amount) &&
    amountNum !== null &&
    amountNum > 0 &&
    Boolean(data.purpose?.trim()) &&
    Boolean(data.propertyStatus?.trim()) &&
    Boolean(propVal) &&
    propValNum !== null &&
    propValNum > 0
  );
}
