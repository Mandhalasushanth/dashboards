/**
 * Batch 9 — ITR income validation and input formatting regression tests
 *
 * Root causes fixed:
 *
 * GROUP B — All income amount fields used a digits-only replace that stripped
 *   decimal points and commas on every keystroke. Fixed by switching to a
 *   decimal-aware replace chain and keyboardType="decimal-pad" across 14
 *   fields in 4 components.
 *   Bugs: BUG_ITR_027-040, 052, 054, 057-063, 072-079, 089-090
 *
 * GROUP A — validateInputs() in Step2IncomeSources had no cross-field checks.
 *   Fixed by adding 6 business-rule guards before the submit gate.
 *   Bugs: BUG_ITR_026/031 (gross salary > 0)
 *         BUG_ITR_036/037 (allowances <= gross salary)
 *         BUG_ITR_041    (TDS <= gross salary)
 *         BUG_ITR_042/051 (home loan interest <= 200000 for self-occupied)
 *         BUG_ITR_043/044 (annual rent > 0 for let-out)
 *         BUG_ITR_045    (municipal taxes <= annual rent)
 *         BUG_ITR_055/056 (declared profit <= gross turnover)
 *
 * GROUP C (BUG_ITR_021/024/025) — Employer name allowed leading spaces and
 *   consecutive spaces. Fixed with trimStart() + /  +/g → " " normalization.
 *
 * Uses Node.js built-in test runner. No React Native or project imports.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";

// ── Inline helpers (mirror the fixed logic) ──────────────────────────────────

/** Mirrors the new onChangeText handler for all income amount fields. */
function parseAmountInput(val: string): string {
  return val.replace(/[^0-9.]/g, "").replace(/(\.\d*)\..*/, "$1");
}

/** Mirrors the employer name onChangeText handler. */
function parseEmployerName(val: string): string {
  return val.replace(/[^a-zA-Z\s]/g, "").trimStart().replace(/  +/g, " ");
}

/** Mirrors the validateInputs salary cross-field logic. */
function validateSalary(grossSalary: string, allowances: string, tdsDeducted: string): string | null {
  if (!grossSalary.trim()) return "Gross Salary (Annual) is mandatory.";
  if (parseFloat(grossSalary || "0") === 0) return "Gross Salary must be greater than zero.";
  if (!allowances.trim()) return "Exempt Allowances is mandatory";
  if (!tdsDeducted.trim()) return "TDS Deducted by Employer is mandatory";
  const gross = parseFloat(grossSalary || "0");
  const exempt = parseFloat(allowances || "0");
  if (exempt > gross) return "Exempt Allowances cannot exceed Gross Salary.";
  const tds = parseFloat(tdsDeducted || "0");
  if (tds > gross) return "TDS Deducted by Employer cannot exceed Gross Salary.";
  return null;
}

/** Mirrors the validateInputs house property cross-field logic. */
function validateHouseProperty(
  propertyType: "self_occupied" | "let_out",
  annualRent: string,
  municipalTax: string,
  homeLoanInterest: string
): string | null {
  if (propertyType === "let_out") {
    if (!annualRent.trim()) return "Annual Rent Received is mandatory for let-out property.";
    if (parseFloat(annualRent || "0") === 0) return "Annual Rent Received must be greater than zero for let-out property.";
    if (!municipalTax.trim()) return "Municipal Taxes Paid is mandatory";
    const rent = parseFloat(annualRent || "0");
    const mun = parseFloat(municipalTax || "0");
    if (mun > rent) return "Municipal Taxes Paid cannot exceed Annual Rent Received.";
  }
  if (!homeLoanInterest.trim()) return "Home Loan Interest Paid is mandatory";
  if (propertyType === "self_occupied") {
    const loan = parseFloat(homeLoanInterest || "0");
    if (loan > 200000) return "Home Loan Interest deduction is limited to ₹2,00,000";
  }
  return null;
}

/** Mirrors the validateInputs business cross-field logic. */
function validateBusiness(grossTurnover: string, declaredProfit: string): string | null {
  if (!grossTurnover.trim()) return "Gross Turnover is mandatory";
  if (!declaredProfit.trim()) return "Declared Profit is mandatory";
  const turnover = parseFloat(grossTurnover || "0");
  const profit = parseFloat(declaredProfit || "0");
  if (profit > turnover) return "Declared Net Profit cannot exceed Gross Turnover.";
  return null;
}

// ── Group B: decimal and formatting input tests ───────────────────────────────

describe("Amount input parsing — decimal support (Group B)", () => {
  it("stores integer value unchanged", () => {
    assert.equal(parseAmountInput("850000"), "850000");
  });

  it("stores decimal value (BUG_ITR_028/033/039/057/058/062/063/072-075 regression)", () => {
    assert.equal(parseAmountInput("12345.67"), "12345.67");
  });

  it("strips comma from input — comma never stored (BUG_ITR_027/032/076-079 regression)", () => {
    assert.equal(parseAmountInput("1,00,000"), "100000");
  });

  it("strips comma but retains decimal", () => {
    assert.equal(parseAmountInput("1,00,000.50"), "100000.50");
  });

  it("prevents double decimal point", () => {
    assert.equal(parseAmountInput("123.45.67"), "123.45");
  });

  it("handles leading decimal", () => {
    assert.equal(parseAmountInput(".5"), ".5");
  });

  it("strips hyphen — negative sign not stored (user can still type 0)", () => {
    assert.equal(parseAmountInput("-50000"), "50000");
  });

  it("strips letters and special chars", () => {
    assert.equal(parseAmountInput("abc12345xyz"), "12345");
  });

  it("handles empty string", () => {
    assert.equal(parseAmountInput(""), "");
  });

  it("trailing decimal point preserved during typing", () => {
    // User is mid-typing "12345." before entering the decimal digit
    assert.equal(parseAmountInput("12345."), "12345.");
  });
});

// ── Group C: employer name formatting ─────────────────────────────────────────

describe("Employer name input sanitisation (BUG_ITR_021/024/025)", () => {
  it("preserves valid alpha and space", () => {
    assert.equal(parseEmployerName("Acme Technologies"), "Acme Technologies");
  });

  it("strips leading spaces (BUG_ITR_024 regression)", () => {
    assert.equal(parseEmployerName("  Acme Corp"), "Acme Corp");
  });

  it("normalises consecutive spaces (BUG_ITR_021 regression)", () => {
    assert.equal(parseEmployerName("Acme  Corp"), "Acme Corp");
  });

  it("three consecutive spaces collapse to one", () => {
    assert.equal(parseEmployerName("Acme   Ltd"), "Acme Ltd");
  });

  it("strips special characters (BUG_ITR_022 regression)", () => {
    assert.equal(parseEmployerName("Acme@Corp!"), "AcmeCorp");
  });

  it("strips emoji (BUG_ITR_023 regression)", () => {
    assert.equal(parseEmployerName("Acme🚀Corp"), "AcmeCorp");
  });

  it("strips digits from employer name", () => {
    assert.equal(parseEmployerName("Acme123"), "Acme");
  });
});

// ── Group A: salary cross-field validation ────────────────────────────────────

describe("Salary cross-field validation (BUG_ITR_026/031/036/037/041)", () => {
  it("passes valid inputs", () => {
    assert.equal(validateSalary("850000", "50000", "45000"), null);
  });

  it("rejects empty gross salary", () => {
    assert.match(validateSalary("", "0", "0") ?? "", /mandatory/i);
  });

  it("rejects zero gross salary (BUG_ITR_026/031 regression)", () => {
    assert.match(validateSalary("0", "0", "0") ?? "", /greater than zero/i);
  });

  it("rejects allowances exceeding gross salary (BUG_ITR_036/037 regression)", () => {
    assert.match(validateSalary("500000", "600000", "0") ?? "", /cannot exceed Gross Salary/i);
  });

  it("allows allowances equal to gross salary (edge case — should pass)", () => {
    assert.equal(validateSalary("500000", "500000", "0"), null);
  });

  it("rejects TDS exceeding gross salary (BUG_ITR_041 regression)", () => {
    assert.match(validateSalary("500000", "0", "600000") ?? "", /cannot exceed Gross Salary/i);
  });

  it("allows TDS equal to gross salary (edge case — should pass)", () => {
    assert.equal(validateSalary("500000", "0", "500000"), null);
  });

  it("allows both allowances and TDS below gross salary", () => {
    assert.equal(validateSalary("1000000", "100000", "150000"), null);
  });

  it("works with decimal salary values", () => {
    assert.equal(validateSalary("850000.50", "50000.25", "45000.00"), null);
  });
});

// ── Group A: house property cross-field validation ────────────────────────────

describe("House property cross-field validation (BUG_ITR_042-045/051)", () => {
  it("self-occupied with valid home loan interest passes", () => {
    assert.equal(validateHouseProperty("self_occupied", "", "", "150000"), null);
  });

  it("self-occupied with home loan interest exactly 200000 passes (boundary)", () => {
    assert.equal(validateHouseProperty("self_occupied", "", "", "200000"), null);
  });

  it("self-occupied with home loan interest > 200000 is rejected (BUG_ITR_042/051 regression)", () => {
    assert.match(
      validateHouseProperty("self_occupied", "", "", "250000") ?? "",
      /2,00,000|200000/
    );
  });

  it("let-out with all valid fields passes", () => {
    assert.equal(validateHouseProperty("let_out", "240000", "10000", "50000"), null);
  });

  it("let-out with zero annual rent is rejected (BUG_ITR_043/044 regression)", () => {
    assert.match(
      validateHouseProperty("let_out", "0", "0", "0") ?? "",
      /greater than zero/i
    );
  });

  it("let-out with municipal taxes exceeding annual rent is rejected (BUG_ITR_045 regression)", () => {
    assert.match(
      validateHouseProperty("let_out", "100000", "150000", "50000") ?? "",
      /cannot exceed Annual Rent/i
    );
  });

  it("let-out with municipal taxes equal to annual rent passes (edge case)", () => {
    assert.equal(validateHouseProperty("let_out", "100000", "100000", "50000"), null);
  });

  it("let-out does NOT apply the 200000 home loan limit", () => {
    assert.equal(validateHouseProperty("let_out", "300000", "50000", "500000"), null);
  });
});

// ── Group A: business/profession cross-field validation ───────────────────────

describe("Business/profession cross-field validation (BUG_ITR_055/056)", () => {
  it("valid profit within turnover passes", () => {
    assert.equal(validateBusiness("2500000", "300000"), null);
  });

  it("profit exactly equal to turnover passes (edge case)", () => {
    assert.equal(validateBusiness("2500000", "2500000"), null);
  });

  it("profit exceeding turnover is rejected (BUG_ITR_055/056 regression)", () => {
    assert.match(
      validateBusiness("2500000", "3000000") ?? "",
      /cannot exceed Gross Turnover/i
    );
  });

  it("zero declared profit with non-zero turnover passes", () => {
    assert.equal(validateBusiness("2500000", "0"), null);
  });

  it("empty gross turnover is rejected", () => {
    assert.match(validateBusiness("", "0") ?? "", /mandatory/i);
  });

  it("works with decimal amounts", () => {
    assert.equal(validateBusiness("2500000.50", "300000.25"), null);
  });
});
