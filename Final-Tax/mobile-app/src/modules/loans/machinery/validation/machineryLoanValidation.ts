import { toSingleLine } from "../../utils/textInput";
import {
  MACHINERY_CONDITION_OPTIONS,
  MACHINERY_PURCHASE_TYPE_OPTIONS,
  MACHINERY_TYPE_OPTIONS,
  type MachineryLoanErrors,
  type MachineryLoanFormData,
  type MachineryMoneyField,
} from "../types/machinery.types";

export const MACHINERY_NAME_MAX_LENGTH = 100;
export const MACHINERY_OTHER_TYPE_MAX_LENGTH = 80;
export const MACHINERY_OTHER_SUPPLIER_MAX_LENGTH = 80;
export const MACHINERY_DEALER_MAX_LENGTH = 100;

function amountError(
  value: string,
  field: MachineryMoneyField,
  malformedFields: Partial<Record<MachineryMoneyField, boolean>> = {}
): string | undefined {
  if (malformedFields[field]) {
    return "Enter a whole-rupee amount using numbers only";
  }
  const raw = (value ?? "").trim();
  if (!raw) return "Enter an amount";

  // Decimals are strictly rejected
  if (raw.includes(".")) {
    return "Enter a whole-rupee amount using numbers only";
  }

  // Negative values are rejected
  if (raw.includes("-")) {
    return "Enter a valid whole-rupee amount";
  }

  // Scientific notation (e.g. 1e9) is rejected
  if (/[eE]/.test(raw)) {
    return "Enter a valid whole-rupee amount";
  }

  // Reject embedded spaces or newlines (e.g. "50 000")
  if (/\s/.test(raw)) {
    return "Enter a valid whole-rupee amount";
  }

  // Allow optional leading ₹ and commas only if correctly positioned
  const withoutSymbol = raw.replace(/^₹/, "").trim();
  if (/[^0-9,]/.test(withoutSymbol)) {
    return "Enter a whole-rupee amount using numbers only";
  }

  // If it contains commas, verify it is valid Indian comma grouping
  if (withoutSymbol.includes(",")) {
    const isIndianGrouped = /^\d{1,2}(?:,\d{2})*,\d{3}$/.test(withoutSymbol);
    if (!isIndianGrouped) {
      return "Enter a valid whole-rupee amount";
    }
  }

  const cleanedDigits = withoutSymbol.replace(/,/g, "");
  if (!/^\d+$/.test(cleanedDigits)) {
    return "Enter a valid whole-rupee amount";
  }

  const amount = Number(cleanedDigits);
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    return "Enter a valid whole-rupee amount";
  }

  return undefined;
}

function textError(
  value: string,
  label: string,
  maxLength: number
): string | undefined {
  const text = toSingleLine(value).trim();
  if (!text) return `Enter ${label}`;
  if (Array.from(text).length > maxLength) {
    return `${label} can be up to ${maxLength} characters`;
  }
  if (!/[\p{L}\p{N}]/u.test(text)) return `Enter a valid ${label}`;
  return undefined;
}

export function validateMachineryLoanForm(
  data: MachineryLoanFormData,
  malformedMoneyFields: Partial<Record<MachineryMoneyField, boolean>> = {}
): { isValid: boolean; errors: MachineryLoanErrors } {
  const errors: MachineryLoanErrors = {};

  const loanAmountErr = amountError(
    data.requestedLoanAmount,
    "requestedLoanAmount",
    malformedMoneyFields
  );
  if (loanAmountErr) {
    errors.requestedLoanAmount = loanAmountErr;
  }

  if (
    !(MACHINERY_TYPE_OPTIONS as readonly string[]).includes(data.machineryType)
  ) {
    errors.machineryType = "Please select the machinery type";
  } else if (data.machineryType === "Other") {
    const otherTypeErr = textError(
      data.machineryTypeOther,
      "the machinery type specification",
      MACHINERY_OTHER_TYPE_MAX_LENGTH
    );
    if (otherTypeErr) errors.machineryTypeOther = otherTypeErr;
  }

  const nameErr = textError(
    data.machineryName,
    "the machinery name / description",
    MACHINERY_NAME_MAX_LENGTH
  );
  if (nameErr) errors.machineryName = nameErr;

  if (
    !(MACHINERY_CONDITION_OPTIONS as readonly string[]).includes(
      data.machineryCondition
    )
  ) {
    errors.machineryCondition = "Please select the machinery condition";
  }

  if (
    !(MACHINERY_PURCHASE_TYPE_OPTIONS as readonly string[]).includes(
      data.purchaseType
    )
  ) {
    errors.purchaseType = "Please select the machinery purchase type";
  } else if (data.purchaseType === "Other Supplier") {
    const otherSupplierErr = textError(
      data.purchaseTypeOther,
      "the supplier type specification",
      MACHINERY_OTHER_SUPPLIER_MAX_LENGTH
    );
    if (otherSupplierErr) errors.purchaseTypeOther = otherSupplierErr;
  }

  const costErr = amountError(
    data.approximateMachineryCost,
    "approximateMachineryCost",
    malformedMoneyFields
  );
  if (costErr) {
    errors.approximateMachineryCost = costErr;
  }

  if (data.dealerName) {
    const dealer = toSingleLine(data.dealerName).trim();
    if (Array.from(dealer).length > MACHINERY_DEALER_MAX_LENGTH) {
      errors.dealerName = `Dealer name can be up to ${MACHINERY_DEALER_MAX_LENGTH} characters`;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
