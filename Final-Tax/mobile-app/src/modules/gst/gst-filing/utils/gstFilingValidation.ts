import { FilingDocItem } from "../config/gstFilingDocumentsConfig";
import { getFilingPeriodsForFrequency } from "../components/GstFilingPeriodStep/gstPeriodUtils";
import {
  GSTIN_REGEX,
  VALID_GSTIN_STATE_CODES,
  ALLOWED_PAN_CATEGORIES,
  extractPanFromGstin,
} from "@/shared/validators/gstValidators";
import { validateGstinFull } from "@/modules/gst/utils/gstValidation";

export {
  GSTIN_REGEX,
  VALID_GSTIN_STATE_CODES,
  ALLOWED_PAN_CATEGORIES,
  extractPanFromGstin,
};

/** Permitted upper monetary ceiling for estimated figures: ₹999 Crore (9,99,99,99,999) */
export const MAX_ESTIMATED_AMOUNT = 9999999999;

/**
 * Validates a GSTIN string with real-time feedback.
 * Delegates full-format check to the canonical validateGstinFull.
 *
 * @param gstin Raw or cleaned GSTIN string
 * @param isTouched Whether the field has been touched or a form submit was attempted
 */
export function validateGstin(gstin: string, isTouched = true): string | null {
  const clean = (gstin || "").trim().toUpperCase();
  if (!clean) return isTouched ? "Enter GSTIN" : null;
  if (!isTouched && clean.length < 15) return null;
  return validateGstinFull(clean);
}

/**
 * Validates monetary amounts for estimated sales, purchases, and ITC.
 * Prevents overflow, JSON parsing failures, negative numbers, and malformed decimals.
 */
export function validateEstimatedAmount(
  value: string | number | undefined | null,
  fieldName = "amount",
  isRequired = false
): string | null {
  if (value === undefined || value === null) {
    return isRequired ? `Enter ${fieldName}` : null;
  }

  const rawStr = String(value).replace(/[₹,\s]/g, "").trim();

  if (!rawStr) {
    return isRequired ? `Enter ${fieldName}` : null;
  }

  if (rawStr.startsWith("-")) {
    return "Amount cannot be negative";
  }

  // Decimal check: allow up to 2 decimal places: /^\d+(\.\d{0,2})?$/
  if (!/^\d+(\.\d{0,2})?$/.test(rawStr)) {
    return "Enter a valid amount";
  }

  const num = parseFloat(rawStr);

  if (!Number.isFinite(num) || isNaN(num)) {
    return "Enter a valid amount";
  }

  if (num < 0) {
    return "Amount cannot be negative";
  }

  if (num > MAX_ESTIMATED_AMOUNT) {
    return "Amount exceeds the permitted limit (Max: ₹999 Cr)";
  }

  return null;
}

/**
 * Validates Filing Frequency and Return Period combination.
 */
export function validatePeriodSelection(
  periodType?: string,
  financialYear?: string,
  filingPeriod?: string
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!periodType || !periodType.trim()) {
    errors.periodType = "Please select a filing frequency";
  }

  if (!financialYear || !financialYear.trim()) {
    errors.financialYear = "Please select a financial year";
  }

  const periodVal = (filingPeriod || "").trim();
  if (!periodVal) {
    errors.filingPeriod = "Please select a filing return period";
  } else if (periodType && financialYear) {
    const validPeriods = getFilingPeriodsForFrequency(periodType, financialYear);
    if (!validPeriods.includes(periodVal)) {
      errors.filingPeriod = "Selected period is invalid for the chosen frequency";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates document completeness according to filing nature.
 * For Regular Return, all 12 checklist documents are strictly mandatory.
 * For Nil Return, documents are not required.
 */
export function validateFilingDocuments(
  documents: readonly FilingDocItem[],
  filingNature: string
): { isValid: boolean; missingCount: number; missingNames: string[] } {
  if (filingNature === "Nil Return") {
    return { isValid: true, missingCount: 0, missingNames: [] };
  }

  const missing = documents.filter((d) => !d.fileUri || d.fileUri.trim() === "");
  return {
    isValid: missing.length === 0,
    missingCount: missing.length,
    missingNames: missing.map((d) => d.name),
  };
}
