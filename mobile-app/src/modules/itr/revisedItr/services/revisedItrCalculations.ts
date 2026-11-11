import { RevisedFormFields, ComputationComparisonRow } from "../types/revisedItr.types";
import { getTaxRulesForAY, TaxSlab } from "../../taxRules";

/** Strips currency symbols and separators, returns 0 for empty/NaN inputs. */
export function parseRevisedAmount(str: string): number {
  const cleaned = (str || "").replace(/[^\d.-]/g, "");
  const val = parseFloat(cleaned);
  return isNaN(val) ? 0 : val;
}

/** Formats a positive integer as Indian-locale rupee string; returns "—" for zero. */
export function formatInr(amount: number): string {
  if (amount === 0) return "—";
  return `₹${amount.toLocaleString("en-IN")}`;
}

/**
 * Returns "+₹X" / "−₹X" / "—" for the difference between original and revised amounts.
 * Returns "—" when the original value is unknown (undefined).
 */
export function computeChangeLabel(
  originalAmount: number | undefined,
  revisedAmount: number,
): string {
  if (originalAmount === undefined) return "—";
  const diff = revisedAmount - originalAmount;
  if (diff === 0) return "—";
  const abs = Math.abs(diff).toLocaleString("en-IN");
  return diff > 0 ? `+₹${abs}` : `−₹${abs}`;
}

export interface RevisionSummary {
  revisedGrossIncome: number;
  revisedDeductions: number;
  revisedTaxableIncome: number;
  hasSalaryOrOtherIncome: boolean;
  hasDeductions: boolean;
}

/** Derives computed totals from the user-entered RevisedFormFields. */
export function computeRevisionSummary(formData: RevisedFormFields): RevisionSummary {
  const salary = parseRevisedAmount(formData.salaryBusinessIncome);
  const other = parseRevisedAmount(formData.otherIncome);
  const c80 = parseRevisedAmount(formData.sec80c);
  const d80 = parseRevisedAmount(formData.sec80d);
  const hli = parseRevisedAmount(formData.homeLoanInterest);
  const taxable = parseRevisedAmount(formData.taxableIncome);
  return {
    revisedGrossIncome: salary + other,
    revisedDeductions: c80 + d80 + hli,
    revisedTaxableIncome: taxable,
    hasSalaryOrOtherIncome: salary > 0 || other > 0,
    hasDeductions: c80 > 0 || d80 > 0 || hli > 0,
  };
}

// Derived from itrTaxCalculator.ts — standard progressive-slab reduction.
function computeTaxFromSlabs(taxableIncome: number, slabs: TaxSlab[]): number {
  if (taxableIncome <= 0) return 0;
  return slabs.reduce((acc, slab) => {
    if (taxableIncome <= slab.min) return acc;
    const upper = slab.max !== null ? Math.min(taxableIncome, slab.max) : taxableIncome;
    return acc + Math.max(0, upper - slab.min) * slab.rate;
  }, 0);
}

export interface RevisedRefundSummary {
  /** Revised refund amount (formatted ₹X or "Nil") or "—" when unavailable. */
  revisedRefund: string;
  /** Original refund from the filed return (formatted ₹X) or "—" when unavailable. */
  originalRefund: string;
  /** Delta label ("+₹X" / "−₹X" / "—"). */
  changeRefund: string;
  /**
   * Set when the revised liability exceeds taxes already paid (additional tax due).
   * When defined the card renders in "Additional Tax Payable" mode.
   * Undefined when outcome is refund or NIL.
   */
  additionalTaxPayable: string | undefined;
}

/** Sentinel returned whenever input data is insufficient to compute the refund. */
const UNAVAILABLE_REFUND: RevisedRefundSummary = {
  revisedRefund: "—",
  originalRefund: "—",
  changeRefund: "—",
  additionalTaxPayable: undefined,
};

/**
 * Computes revised refund / additional payable using the regime slabs already on file for the
 * original return.
 *
 * Requires:
 *   - taxableIncomeStr  — the user-entered revised taxable income from RevisedFormFields
 *   - regime            — "new" | "old" stored on the original application's formData
 *   - totalTaxesPaid    — TDS + advance tax stored on the original application's formData
 *   - originalFinalAmount / originalFinalType — stored outcome of the original return
 *   - assessmentYear    — display label, e.g. "AY 2025–26" (getTaxRulesForAY normalises it)
 *
 * Returns UNAVAILABLE_REFUND when any required input is missing or taxableIncome is 0.
 */
export function computeRevisedRefund(
  taxableIncomeStr: string,
  regime: string | undefined,
  totalTaxesPaid: number | undefined,
  originalFinalAmount: number | undefined,
  originalFinalType: string | undefined,
  assessmentYear: string,
): RevisedRefundSummary {
  const taxable = parseRevisedAmount(taxableIncomeStr);
  if (taxable === 0 || totalTaxesPaid === undefined || totalTaxesPaid === null) {
    return UNAVAILABLE_REFUND;
  }

  const rules = getTaxRulesForAY(assessmentYear);
  const regimeRules = regime === "old" ? rules.oldRegime : rules.newRegime;

  const grossTax = computeTaxFromSlabs(taxable, regimeRules.slabs);
  const rebate = taxable <= regimeRules.rebate87AThreshold
    ? Math.min(grossTax, regimeRules.rebate87AMax)
    : 0;
  const taxAfterRebate = Math.max(0, grossTax - rebate);
  const revisedTaxLiability = taxAfterRebate + Math.round(taxAfterRebate * 0.04);

  const netDiff = revisedTaxLiability - totalTaxesPaid;

  if (netDiff > 0) {
    return {
      ...UNAVAILABLE_REFUND,
      additionalTaxPayable: formatInr(netDiff),
    };
  }

  const revisedRefundAmount = Math.abs(netDiff);
  const revisedRefundStr = revisedRefundAmount === 0 ? "Nil" : formatInr(revisedRefundAmount);

  const originalRefundStr =
    originalFinalAmount !== undefined && originalFinalType === "REFUND"
      ? formatInr(originalFinalAmount)
      : "—";

  const originalForChange =
    originalFinalType === "REFUND" ? originalFinalAmount : undefined;

  return {
    revisedRefund: revisedRefundStr,
    originalRefund: originalRefundStr,
    changeRefund: computeChangeLabel(originalForChange, revisedRefundAmount),
    additionalTaxPayable: undefined,
  };
}

/**
 * Builds ComputationComparisonRow[] from the user-entered RevisedFormFields.
 *
 * - Gross Total Income: original from the lookup result; revised = salary + other income.
 * - Other Income: revised only (we do not have the original breakdown) — fixes BUG-ITR-057.
 * - Total Deductions: revised only.
 * - Taxable Income: user-entered revised value.
 * - Tax and refund rows are omitted (cannot be computed without tax-slab rates; CA calculates these).
 *
 * @param formData       RevisedFormFields from the progress store or params.
 * @param revisionReason The reason ID (e.g. "missed_income", "wrong_deduction").
 * @param originalGrossIncomeStr  Optional formatted string like "₹8,12,400" from the original return.
 */
export function buildComparisonRows(
  formData: RevisedFormFields,
  revisionReason: string | null,
  originalGrossIncomeStr?: string,
): ComputationComparisonRow[] {
  const salary = parseRevisedAmount(formData.salaryBusinessIncome);
  const other = parseRevisedAmount(formData.otherIncome);
  const c80 = parseRevisedAmount(formData.sec80c);
  const d80 = parseRevisedAmount(formData.sec80d);
  const hli = parseRevisedAmount(formData.homeLoanInterest);
  const taxable = parseRevisedAmount(formData.taxableIncome);

  const revisedGross = salary + other;
  const revisedDeductions = c80 + d80 + hli;

  const originalGross =
    originalGrossIncomeStr != null
      ? parseRevisedAmount(originalGrossIncomeStr)
      : undefined;

  const isIncomeRevision =
    revisionReason === "missed_income" ||
    revisionReason === "other" ||
    salary > 0 ||
    other > 0;

  const isDeductionRevision =
    revisionReason === "wrong_deduction" ||
    revisionReason === "other" ||
    revisedDeductions > 0;

  const rows: ComputationComparisonRow[] = [];

  // Gross Total Income — always shown
  rows.push({
    particular: "Gross total income",
    original: originalGross !== undefined ? formatInr(originalGross) : "—",
    revised: revisedGross > 0 ? formatInr(revisedGross) : "—",
    change: computeChangeLabel(originalGross, revisedGross),
    isHighlight: true,
  });

  // Other Income — separate row (BUG-ITR-057)
  if (isIncomeRevision) {
    rows.push({
      particular: "Other income",
      original: "—",
      revised: other > 0 ? formatInr(other) : "—",
      change: "—",
      isHighlight: false,
    });
  }

  // Total Deductions
  if (isDeductionRevision) {
    rows.push({
      particular: "Total deductions",
      original: "—",
      revised: revisedDeductions > 0 ? formatInr(revisedDeductions) : "—",
      change: "—",
      isHighlight: false,
    });
  }

  // Taxable Income (user-entered)
  if (taxable > 0 || isIncomeRevision || isDeductionRevision) {
    rows.push({
      particular: "Taxable income",
      original: "—",
      revised: taxable > 0 ? formatInr(taxable) : "—",
      change: "—",
      isHighlight: true,
    });
  }

  return rows;
}
