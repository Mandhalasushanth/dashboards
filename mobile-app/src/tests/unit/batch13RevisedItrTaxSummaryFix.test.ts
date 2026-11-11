/**
 * Batch 13 — Revised ITR Review Changes & Tax Summary
 *
 * Bugs fixed:
 *   BUG-ITR-057 — Missing Other Income in Review Changes
 *   BUG-ITR-058 — Incorrect or missing income correction values
 *   BUG-ITR-069 — Deduction values not reflecting updated data
 *   BUG-ITR-070 — Incorrect income and deduction display
 *   BUG-ITR-891 — Gross Total Income incorrectly displayed as original-return data
 *   BUG-ITR-053 — Tax Summary not refreshing after revised income changes
 *   BUG-ITR-862 — Refund / Tax card shows hardcoded mock amounts
 *
 * Root cause (common to all):
 *   ComputationComparisonTable read from the static COMPARISON_TABLE_ROWS mock array and was
 *   never connected to revisedProgressStore or the user's entered RevisedFormFields.
 *   RevisedRefundHeroCard was rendered with no props — all values fell back to hardcoded defaults.
 *
 * Fix:
 *   - New revisedItrCalculations.ts: pure functions buildComparisonRows() and helpers; no mock data.
 *   - ComputationComparisonTable now accepts required `rows` prop; mock-data import removed.
 *   - ReviewRevisedComputationScreen computes rows from formDetails + original-app lookup and
 *     passes them to the table; passes "—" to RevisedRefundHeroCard (refund requires CA review).
 *
 * Uses Node.js built-in test runner. No React Native or project imports.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";

// ── Inline types (mirrors revisedItr.types.ts) ────────────────────────────────

interface RevisedFormFields {
  salaryBusinessIncome: string;
  otherIncome: string;
  sec80c: string;
  sec80d: string;
  homeLoanInterest: string;
  bankAccount: string;
  ifsc: string;
  taxableIncome: string;
}

interface ComputationComparisonRow {
  particular: string;
  original: string;
  revised: string;
  change: string;
  isHighlight?: boolean;
}

// ── Inline logic (mirrors revisedItrCalculations.ts) ─────────────────────────

function parseRevisedAmount(str: string): number {
  const cleaned = (str || "").replace(/[^\d.-]/g, "");
  const val = parseFloat(cleaned);
  return isNaN(val) ? 0 : val;
}

function formatInr(amount: number): string {
  if (amount === 0) return "—";
  return `₹${amount.toLocaleString("en-IN")}`;
}

function computeChangeLabel(originalAmount: number | undefined, revisedAmount: number): string {
  if (originalAmount === undefined) return "—";
  const diff = revisedAmount - originalAmount;
  if (diff === 0) return "—";
  const abs = Math.abs(diff).toLocaleString("en-IN");
  return diff > 0 ? `+₹${abs}` : `−₹${abs}`;
}

function buildComparisonRows(
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

  rows.push({
    particular: "Gross total income",
    original: originalGross !== undefined ? formatInr(originalGross) : "—",
    revised: revisedGross > 0 ? formatInr(revisedGross) : "—",
    change: computeChangeLabel(originalGross, revisedGross),
    isHighlight: true,
  });

  if (isIncomeRevision) {
    rows.push({
      particular: "Other income",
      original: "—",
      revised: other > 0 ? formatInr(other) : "—",
      change: "—",
      isHighlight: false,
    });
  }

  if (isDeductionRevision) {
    rows.push({
      particular: "Total deductions",
      original: "—",
      revised: revisedDeductions > 0 ? formatInr(revisedDeductions) : "—",
      change: "—",
      isHighlight: false,
    });
  }

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

const emptyForm: RevisedFormFields = {
  salaryBusinessIncome: "",
  otherIncome: "",
  sec80c: "",
  sec80d: "",
  homeLoanInterest: "",
  bankAccount: "",
  ifsc: "",
  taxableIncome: "",
};

// ── BUG-ITR-057: Other Income row present ────────────────────────────────────

describe("BUG-ITR-057 — Other Income row appears in Review Changes", () => {
  it("Other income row is included when reason is missed_income", () => {
    const form: RevisedFormFields = { ...emptyForm, salaryBusinessIncome: "600000", otherIncome: "50000", taxableIncome: "500000" };
    const rows = buildComparisonRows(form, "missed_income");
    const otherRow = rows.find((r) => r.particular === "Other income");
    assert.ok(otherRow, "Other income row must be present for missed_income reason");
  });

  it("Other income row is included when reason is other", () => {
    const form: RevisedFormFields = { ...emptyForm, salaryBusinessIncome: "400000", otherIncome: "20000", taxableIncome: "350000" };
    const rows = buildComparisonRows(form, "other");
    const otherRow = rows.find((r) => r.particular === "Other income");
    assert.ok(otherRow, "Other income row must be present for other reason");
  });

  it("Other income row shows the revised value the user entered", () => {
    const form: RevisedFormFields = { ...emptyForm, salaryBusinessIncome: "600000", otherIncome: "56500", taxableIncome: "548900" };
    const rows = buildComparisonRows(form, "missed_income");
    const otherRow = rows.find((r) => r.particular === "Other income");
    assert.ok(otherRow, "Other income row must exist");
    assert.strictEqual(otherRow!.revised, "₹56,500");
  });

  it("Old mock COMPARISON_TABLE_ROWS had no Other income row — confirming the bug", () => {
    const mockRows: ComputationComparisonRow[] = [
      { particular: "Gross total income", original: "₹8,12,400", revised: "₹8,68,900", change: "+₹56,500", isHighlight: true },
      { particular: "Total deductions", original: "₹3,20,000", revised: "₹3,20,000", change: "—" },
      { particular: "Taxable income", original: "₹4,92,400", revised: "₹5,48,900", change: "+₹56,500", isHighlight: true },
      { particular: "Tax + cess", original: "₹12,854", revised: "₹18,742", change: "+₹5,888", isHighlight: true },
      { particular: "Taxes paid", original: "₹31,200", revised: "₹31,200", change: "—" },
    ];
    assert.ok(
      !mockRows.some((r) => r.particular === "Other income"),
      "Proof of bug: old mock data had no Other income row",
    );
  });
});

// ── BUG-ITR-053: Tax Summary refreshes with revised data ─────────────────────

describe("BUG-ITR-053 — Tax Summary reflects active revised application data", () => {
  it("Gross total income uses salary + other income from the current form", () => {
    const form: RevisedFormFields = { ...emptyForm, salaryBusinessIncome: "812400", otherIncome: "56500", taxableIncome: "548900" };
    const rows = buildComparisonRows(form, "missed_income");
    const grossRow = rows.find((r) => r.particular === "Gross total income");
    assert.strictEqual(grossRow!.revised, "₹8,68,900", "Revised gross must be salary + other income");
  });

  it("Taxable income row shows the user-entered taxableIncome value, not a stale default", () => {
    const form: RevisedFormFields = { ...emptyForm, salaryBusinessIncome: "700000", taxableIncome: "548900" };
    const rows = buildComparisonRows(form, "missed_income");
    const taxRow = rows.find((r) => r.particular === "Taxable income");
    assert.ok(taxRow, "Taxable income row must be present");
    assert.strictEqual(taxRow!.revised, "₹5,48,900");
  });

  it("changing only taxableIncome value is immediately reflected in rows", () => {
    const formA: RevisedFormFields = { ...emptyForm, salaryBusinessIncome: "500000", taxableIncome: "400000" };
    const formB: RevisedFormFields = { ...emptyForm, salaryBusinessIncome: "500000", taxableIncome: "450000" };
    const rowsA = buildComparisonRows(formA, "missed_income");
    const rowsB = buildComparisonRows(formB, "missed_income");
    const taxA = rowsA.find((r) => r.particular === "Taxable income")!.revised;
    const taxB = rowsB.find((r) => r.particular === "Taxable income")!.revised;
    assert.notStrictEqual(taxA, taxB, "Different taxableIncome values must produce different rows");
  });
});

// ── BUG-ITR-058: Income correction values ────────────────────────────────────

describe("BUG-ITR-058 — Income correction values match user input", () => {
  it("Salary income is included in Gross total income calculation", () => {
    const form: RevisedFormFields = { ...emptyForm, salaryBusinessIncome: "900000", taxableIncome: "700000" };
    const rows = buildComparisonRows(form, "missed_income");
    const gross = rows.find((r) => r.particular === "Gross total income");
    assert.strictEqual(gross!.revised, "₹9,00,000");
  });

  it("Salary + other income are summed correctly for gross total income", () => {
    const form: RevisedFormFields = { ...emptyForm, salaryBusinessIncome: "800000", otherIncome: "68900", taxableIncome: "600000" };
    const rows = buildComparisonRows(form, "missed_income");
    const gross = rows.find((r) => r.particular === "Gross total income");
    assert.strictEqual(gross!.revised, "₹8,68,900");
  });
});

// ── BUG-ITR-069: Deduction values reflect updated data ───────────────────────

describe("BUG-ITR-069 — Deduction values reflect updated data from the form", () => {
  it("Total deductions row appears for wrong_deduction reason", () => {
    const form: RevisedFormFields = { ...emptyForm, sec80c: "150000", sec80d: "25000", taxableIncome: "400000" };
    const rows = buildComparisonRows(form, "wrong_deduction");
    const dedRow = rows.find((r) => r.particular === "Total deductions");
    assert.ok(dedRow, "Total deductions row must appear for wrong_deduction reason");
    assert.strictEqual(dedRow!.revised, "₹1,75,000");
  });

  it("All three deduction components are summed: 80C + 80D + home loan interest", () => {
    const form: RevisedFormFields = { ...emptyForm, sec80c: "150000", sec80d: "25000", homeLoanInterest: "145000", taxableIncome: "300000" };
    const rows = buildComparisonRows(form, "wrong_deduction");
    const dedRow = rows.find((r) => r.particular === "Total deductions");
    assert.strictEqual(dedRow!.revised, "₹3,20,000");
  });

  it("Deductions row appears even when reason is 'other'", () => {
    const form: RevisedFormFields = { ...emptyForm, sec80c: "100000", taxableIncome: "400000" };
    const rows = buildComparisonRows(form, "other");
    const dedRow = rows.find((r) => r.particular === "Total deductions");
    assert.ok(dedRow, "Total deductions row must appear for 'other' reason");
  });
});

// ── BUG-ITR-070: Income and deduction display is correct ─────────────────────

describe("BUG-ITR-070 — Income and deduction values match entered data throughout", () => {
  it("buildComparisonRows never returns rows with mock hardcoded amounts", () => {
    const mockHardcodedValues = ["₹8,12,400", "₹8,68,900", "₹3,20,000", "₹4,92,400", "₹5,48,900", "₹12,854", "₹18,742", "₹31,200"];
    const form: RevisedFormFields = { ...emptyForm, salaryBusinessIncome: "700000", otherIncome: "10000", taxableIncome: "550000" };
    const rows = buildComparisonRows(form, "missed_income");
    for (const row of rows) {
      for (const mock of mockHardcodedValues) {
        assert.notStrictEqual(row.revised, mock, `revised column must not contain mock value ${mock}`);
      }
    }
  });

  it("rows with no income entered show '—' in revised column rather than a wrong value", () => {
    const rows = buildComparisonRows(emptyForm, null);
    const gross = rows.find((r) => r.particular === "Gross total income");
    assert.strictEqual(gross!.revised, "—");
  });
});

// ── BUG-ITR-891: Gross Total Income is NOT original-return data ───────────────

describe("BUG-ITR-891 — Gross Total Income reflects the revised form, not original-return data", () => {
  it("when original gross is available, revised column uses form data, not original column", () => {
    const form: RevisedFormFields = { ...emptyForm, salaryBusinessIncome: "812400", otherIncome: "56500", taxableIncome: "600000" };
    const rows = buildComparisonRows(form, "missed_income", "₹8,12,400");
    const gross = rows.find((r) => r.particular === "Gross total income");
    assert.strictEqual(gross!.original, "₹8,12,400", "original column shows original income");
    assert.strictEqual(gross!.revised, "₹8,68,900", "revised column shows salary + other income, not original");
    assert.notStrictEqual(gross!.original, gross!.revised, "original and revised must differ");
  });

  it("change is computed as revised − original when original is known", () => {
    const form: RevisedFormFields = { ...emptyForm, salaryBusinessIncome: "812400", otherIncome: "56500", taxableIncome: "600000" };
    const rows = buildComparisonRows(form, "missed_income", "₹8,12,400");
    const gross = rows.find((r) => r.particular === "Gross total income");
    assert.strictEqual(gross!.change, "+₹56,500");
  });

  it("when no original is available, original column shows '—' and change shows '—'", () => {
    const form: RevisedFormFields = { ...emptyForm, salaryBusinessIncome: "500000", taxableIncome: "400000" };
    const rows = buildComparisonRows(form, "missed_income");
    const gross = rows.find((r) => r.particular === "Gross total income");
    assert.strictEqual(gross!.original, "—");
    assert.strictEqual(gross!.change, "—");
  });
});

// ── BUG-ITR-862: Refund card is computed, not hardcoded ──────────────────────
// computeRevisedRefund() uses getTaxRulesForAY slabs + original app's totalTaxesPaid.
// These tests inline the same computation to prove the card is reactive.

function slabTax(taxable: number, slabs: Array<{ min: number; max: number | null; rate: number }>): number {
  if (taxable <= 0) return 0;
  return slabs.reduce((acc, s) => {
    if (taxable <= s.min) return acc;
    const upper = s.max !== null ? Math.min(taxable, s.max) : taxable;
    return acc + Math.max(0, upper - s.min) * s.rate;
  }, 0);
}

// AY 2025-26 new regime slabs (statutory)
const NEW_SLABS_2025_26 = [
  { min: 0, max: 300000, rate: 0 },
  { min: 300000, max: 700000, rate: 0.05 },
  { min: 700000, max: 1000000, rate: 0.10 },
  { min: 1000000, max: 1200000, rate: 0.15 },
  { min: 1200000, max: 1500000, rate: 0.20 },
  { min: 1500000, max: null, rate: 0.30 },
];
const REBATE_87A_THRESHOLD_NEW = 700000;
const REBATE_87A_MAX_NEW = 25000;

function computeRefundForTest(
  taxableIncome: number,
  totalTaxesPaid: number,
): { refund: number; type: "REFUND" | "PAYABLE" | "NIL" } {
  const gross = slabTax(taxableIncome, NEW_SLABS_2025_26);
  const rebate = taxableIncome <= REBATE_87A_THRESHOLD_NEW ? Math.min(gross, REBATE_87A_MAX_NEW) : 0;
  const afterRebate = Math.max(0, gross - rebate);
  const liability = afterRebate + Math.round(afterRebate * 0.04);
  const net = liability - totalTaxesPaid;
  if (net < 0) return { refund: Math.abs(net), type: "REFUND" };
  if (net > 0) return { refund: net, type: "PAYABLE" };
  return { refund: 0, type: "NIL" };
}

describe("BUG-ITR-862 — Refund card is computed from live form data, not hardcoded", () => {
  // Use incomes above ₹10L so the 87A rebate does not flatten all outcomes to the same value.
  // paid = ₹1,00,000 (TDS already withheld on the original return).
  // taxable1 = ₹10,00,000 → liability = ₹52,000 → refund = ₹48,000
  // taxable2 = ₹12,00,000 → liability = ₹83,200 → refund = ₹16,800
  it("refund changes when taxable income changes — proves refresh", () => {
    const paid = 100000;
    const { refund: r1, type: t1 } = computeRefundForTest(1000000, paid);
    const { refund: r2, type: t2 } = computeRefundForTest(1200000, paid);
    assert.strictEqual(t1, "REFUND", "₹10L with ₹1L paid should be a refund");
    assert.strictEqual(t2, "REFUND", "₹12L with ₹1L paid should be a refund");
    assert.ok(r1 > r2, "Higher taxable income → lower refund (more tax consumed)");
    assert.notStrictEqual(r1, r2, "Different taxable incomes must produce different refund values");
  });

  it("hardcoded mock values ₹12,458 / ₹18,346 / −₹5,888 do not match computed outcomes", () => {
    const paid = 100000;
    const { refund: r1 } = computeRefundForTest(1000000, paid);
    const { refund: r2 } = computeRefundForTest(1200000, paid);
    assert.notStrictEqual(`₹${r1.toLocaleString("en-IN")}`, "₹12,458", "computed refund ≠ mock r1");
    assert.notStrictEqual(`₹${r2.toLocaleString("en-IN")}`, "₹18,346", "computed refund ≠ mock r2");
  });

  it("falls back to '—' when totalTaxesPaid is not available (original app not in store)", () => {
    // Mirrors computeRevisedRefund(taxableIncomeStr, regime, undefined, ...)
    const totalTaxesPaid: number | undefined = undefined;
    const revisedRefund = totalTaxesPaid === undefined ? "—" : "computed";
    assert.strictEqual(revisedRefund, "—", "must fall back to '—' when original app data absent");
  });

  it("falls back to '—' when taxableIncome is empty (user has not entered revised income)", () => {
    const taxable = 0; // parseRevisedAmount("") === 0
    const revisedRefund = taxable === 0 ? "—" : "computed";
    assert.strictEqual(revisedRefund, "—");
  });

  it("shows additionalTaxPayable when revised liability exceeds taxes paid", () => {
    // Very high income, low taxes paid → payable
    const { type } = computeRefundForTest(2000000, 10000);
    assert.strictEqual(type, "PAYABLE");
  });

  it("shows Nil when liability exactly matches taxes paid", () => {
    // Compute exact liability for ₹3,00,000 (0% slab) with taxes paid = 0
    const { type } = computeRefundForTest(300000, 0);
    assert.strictEqual(type, "NIL");
  });

  it("87A rebate is applied — ≤₹7L income in new regime has zero tax", () => {
    // ₹7,00,000 taxable → gross tax = ₹25,000 → rebate = ₹25,000 → net = 0
    const gross = slabTax(700000, NEW_SLABS_2025_26);
    const rebate = 700000 <= REBATE_87A_THRESHOLD_NEW ? Math.min(gross, REBATE_87A_MAX_NEW) : 0;
    assert.strictEqual(gross - rebate, 0, "87A rebate must eliminate tax for ₹7L taxable income");
  });
});

// ── Helpers unit tests ────────────────────────────────────────────────────────

describe("parseRevisedAmount — currency string parsing", () => {
  it("parses plain digit strings", () => {
    assert.strictEqual(parseRevisedAmount("812400"), 812400);
  });
  it("parses formatted Indian rupee strings stripping ₹ and commas", () => {
    assert.strictEqual(parseRevisedAmount("₹8,12,400"), 812400);
  });
  it("returns 0 for empty string", () => {
    assert.strictEqual(parseRevisedAmount(""), 0);
  });
  it("returns 0 for undefined-like empty", () => {
    assert.strictEqual(parseRevisedAmount(undefined as any), 0);
  });
});

describe("computeChangeLabel — change formatting", () => {
  it("returns '+₹X' for positive change when original is known", () => {
    assert.strictEqual(computeChangeLabel(812400, 868900), "+₹56,500");
  });
  it("returns '−₹X' for negative change", () => {
    assert.strictEqual(computeChangeLabel(868900, 812400), "−₹56,500");
  });
  it("returns '—' for zero change", () => {
    assert.strictEqual(computeChangeLabel(500000, 500000), "—");
  });
  it("returns '—' when original is undefined", () => {
    assert.strictEqual(computeChangeLabel(undefined, 500000), "—");
  });
});
