/**
 * Centralized GSTIN & Tax Validator
 * Standard statutory pattern for 15-character Indian Goods and Services Tax Identification Number (GSTIN).
 * Format: 2-digit state code + 10-char PAN + 1-char entity number + 'Z' + 1-char check digit.
 */

import { validateGstinFull } from "@/modules/gst/utils/gstValidation";

export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{3}[ABCFGHJLPT][A-Z][0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

/**
 * Valid Indian State and Union Territory codes:
 * 01 to 38 (Domestic states and UTs) plus 97 (Other Territory) and 99 (Centre Jurisdiction).
 */
export const VALID_GSTIN_STATE_CODES: ReadonlySet<string> = new Set([
  ...Array.from({ length: 38 }, (_, i) => String(i + 1).padStart(2, "0")),
  "97",
  "99",
]);

/**
 * Valid PAN 4th character categories (taxpayer constitution).
 * P - Individual, C - Company, H - HUF, F - Firm/LLP, A - AOP,
 * B - BOI, T - Trust, L - Local Authority, J - Artificial Juridical Person, G - Government.
 */
export const ALLOWED_PAN_CATEGORIES: ReadonlySet<string> = new Set([
  "P", "C", "H", "F", "A", "B", "T", "L", "J", "G",
]);

/**
 * Checks if a 2-digit code is a recognized GST state/UT code.
 */
export function isValidGstinStateCode(code: string): boolean {
  if (!code) return false;
  return VALID_GSTIN_STATE_CODES.has(code.trim());
}

/**
 * Extracts the 10-character PAN segment from a 15-character GSTIN.
 * Positions 3 to 12 (0-indexed indices 2..12).
 */
export function extractPanFromGstin(gstin: string): string | null {
  const clean = (gstin || "").trim().toUpperCase();
  if (clean.length < 12) return null;
  return clean.slice(2, 12);
}

/**
 * Verifies consistency between a GSTIN and an independently provided PAN.
 */
export function verifyGstinPanConsistency(gstin: string, pan: string): boolean {
  const extracted = extractPanFromGstin(gstin);
  if (!extracted || !pan) return false;
  return extracted === pan.trim().toUpperCase();
}

/**
 * Comprehensive GSTIN validation with real-time feedback.
 * Delegates full-format check to the canonical validateGstinFull.
 */
export function validateGstin(gstin: string, isTouched = true): string | null {
  const clean = (gstin || "").trim().toUpperCase();
  if (!clean) return isTouched ? "Enter GSTIN" : null;
  if (!isTouched && clean.length < 15) return null;
  return validateGstinFull(clean);
}

/**
 * Boolean validator for GSTIN format.
 */
export function isValidGstin(gstin: string): boolean {
  return validateGstinFull(gstin) === null;
}
