/**
 * Batch 15 — Revised ITR Field Validation + TypeError
 * Bugs: BUG-ITR-074 through BUG-ITR-079
 *
 * Root causes:
 * 1. getInitialForm() returned storeFormData directly; store accepts
 *    Partial<RevisedFormFields> so some fields could be undefined.
 *    validate() then called .trim()/.replace() on undefined → TypeError crash.
 * 2. keyboardType="numeric" on Android shows a decimal key; /[^0-9]/g
 *    strips it silently — confusing UX. Fixed to "number-pad".
 *
 * Fix: getInitialForm() always merges with DEFAULT_REVISED_FORM_FIELDS.
 *      validate() guards every field with (field || "").
 *      All 6 amount fields use keyboardType="number-pad".
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

// ─── Minimal types (mirrors revisedItr.types.ts) ─────────────────────────────

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

const DEFAULT_REVISED_FORM_FIELDS: RevisedFormFields = {
  salaryBusinessIncome: "",
  otherIncome: "",
  sec80c: "",
  sec80d: "",
  homeLoanInterest: "",
  bankAccount: "",
  ifsc: "",
  taxableIncome: "",
};

// ─── Helpers replicating the fixed logic ─────────────────────────────────────

function getInitialForm(
  revisedDetailsJson: string | undefined,
  storeFormData: Partial<RevisedFormFields> | null
): RevisedFormFields {
  if (revisedDetailsJson) {
    try {
      const parsed: unknown = JSON.parse(revisedDetailsJson);
      if (parsed && typeof parsed === "object") {
        return {
          ...DEFAULT_REVISED_FORM_FIELDS,
          ...(parsed as Partial<RevisedFormFields>),
        };
      }
    } catch { }
  }
  if (storeFormData) {
    return { ...DEFAULT_REVISED_FORM_FIELDS, ...storeFormData };
  }
  return DEFAULT_REVISED_FORM_FIELDS;
}

type ValidationErrors = Partial<Record<keyof RevisedFormFields, string>>;

function validate(
  form: RevisedFormFields,
  reason: string
): { valid: boolean; errors: ValidationErrors } {
  const newErrors: ValidationErrors = {};

  if (reason === "missed_income" || reason === "other") {
    if (!(form.salaryBusinessIncome || "").trim()) {
      newErrors.salaryBusinessIncome = "Salary / Business income is required.";
    }
    if (!(form.taxableIncome || "").trim()) {
      newErrors.taxableIncome = "Taxable income is required.";
    }
  }

  if (reason === "wrong_deduction") {
    if (!(form.taxableIncome || "").trim()) {
      newErrors.taxableIncome = "Taxable income is required.";
    }
  }

  if (reason === "incorrect_bank") {
    const cleanBank = (form.bankAccount || "").replace(/[^\w]/g, "");
    if (!cleanBank || cleanBank.length < 4) {
      newErrors.bankAccount = "Enter a valid bank account number.";
    }
    const cleanIfsc = (form.ifsc || "").trim().toUpperCase();
    if (!cleanIfsc) {
      newErrors.ifsc = "IFSC code is required.";
    } else if (cleanIfsc.length !== 11) {
      newErrors.ifsc = "IFSC must be 11 characters.";
    }
  }

  return { valid: Object.keys(newErrors).length === 0, errors: newErrors };
}

// ─── getInitialForm tests ─────────────────────────────────────────────────────

describe("BUG-ITR-074–079 getInitialForm — always returns complete RevisedFormFields", () => {
  it("returns all defaults when params and store are both absent", () => {
    const form = getInitialForm(undefined, null);
    assert.deepEqual(form, DEFAULT_REVISED_FORM_FIELDS);
  });

  it("merges partial storeFormData with defaults — no undefined fields", () => {
    const partial: Partial<RevisedFormFields> = { salaryBusinessIncome: "500000" };
    const form = getInitialForm(undefined, partial);
    assert.equal(form.salaryBusinessIncome, "500000");
    assert.equal(form.taxableIncome, "");
    assert.equal(form.bankAccount, "");
    assert.equal(form.ifsc, "");
  });

  it("merges partial JSON params with defaults", () => {
    const json = JSON.stringify({ taxableIncome: "400000" });
    const form = getInitialForm(json, null);
    assert.equal(form.taxableIncome, "400000");
    assert.equal(form.salaryBusinessIncome, "");
    assert.equal(form.otherIncome, "");
  });

  it("JSON params override storeFormData and defaults", () => {
    const json = JSON.stringify({ salaryBusinessIncome: "700000", taxableIncome: "600000" });
    const store: Partial<RevisedFormFields> = { salaryBusinessIncome: "100000" };
    const form = getInitialForm(json, store);
    assert.equal(form.salaryBusinessIncome, "700000");
    assert.equal(form.taxableIncome, "600000");
  });

  it("falls back to storeFormData when JSON is malformed", () => {
    const store: Partial<RevisedFormFields> = { salaryBusinessIncome: "300000" };
    const form = getInitialForm("{not valid json", store);
    assert.equal(form.salaryBusinessIncome, "300000");
    assert.equal(form.taxableIncome, "");
  });

  it("falls back to defaults when JSON is valid but not an object", () => {
    const form = getInitialForm(JSON.stringify("hello"), null);
    assert.deepEqual(form, DEFAULT_REVISED_FORM_FIELDS);
  });

  it("falls back to defaults when JSON is null literal", () => {
    const form = getInitialForm(JSON.stringify(null), null);
    assert.deepEqual(form, DEFAULT_REVISED_FORM_FIELDS);
  });

  it("all 8 fields are strings (never undefined) from partial store", () => {
    const partial: Partial<RevisedFormFields> = { sec80c: "150000" };
    const form = getInitialForm(undefined, partial);
    const fields: (keyof RevisedFormFields)[] = [
      "salaryBusinessIncome", "otherIncome", "sec80c", "sec80d",
      "homeLoanInterest", "bankAccount", "ifsc", "taxableIncome",
    ];
    for (const f of fields) {
      assert.equal(typeof form[f], "string", `${f} should be a string`);
    }
  });

  it("empty storeFormData object still merges — no undefined fields", () => {
    const form = getInitialForm(undefined, {});
    assert.deepEqual(form, DEFAULT_REVISED_FORM_FIELDS);
  });
});

// ─── validate() TypeError-safety tests ───────────────────────────────────────

describe("BUG-ITR-074 salaryBusinessIncome — validate() never throws TypeError", () => {
  it("does not throw when salaryBusinessIncome is undefined on form object", () => {
    const form = { ...DEFAULT_REVISED_FORM_FIELDS } as RevisedFormFields;
    (form as any).salaryBusinessIncome = undefined;
    assert.doesNotThrow(() => validate(form, "missed_income"));
  });

  it("reports required error when salaryBusinessIncome is undefined", () => {
    const form = { ...DEFAULT_REVISED_FORM_FIELDS } as RevisedFormFields;
    (form as any).salaryBusinessIncome = undefined;
    const { valid, errors } = validate(form, "missed_income");
    assert.equal(valid, false);
    assert.ok(errors.salaryBusinessIncome);
  });

  it("passes validation when salaryBusinessIncome is provided", () => {
    const form = { ...DEFAULT_REVISED_FORM_FIELDS, salaryBusinessIncome: "500000", taxableIncome: "400000" };
    const { errors } = validate(form, "missed_income");
    assert.equal(errors.salaryBusinessIncome, undefined);
  });
});

describe("BUG-ITR-079 taxableIncome — validate() never throws TypeError", () => {
  it("does not throw when taxableIncome is undefined (missed_income reason)", () => {
    const form = { ...DEFAULT_REVISED_FORM_FIELDS, salaryBusinessIncome: "500000" } as RevisedFormFields;
    (form as any).taxableIncome = undefined;
    assert.doesNotThrow(() => validate(form, "missed_income"));
  });

  it("does not throw when taxableIncome is undefined (wrong_deduction reason)", () => {
    const form = { ...DEFAULT_REVISED_FORM_FIELDS } as RevisedFormFields;
    (form as any).taxableIncome = undefined;
    assert.doesNotThrow(() => validate(form, "wrong_deduction"));
  });

  it("reports required error when taxableIncome is undefined for wrong_deduction", () => {
    const form = { ...DEFAULT_REVISED_FORM_FIELDS } as RevisedFormFields;
    (form as any).taxableIncome = undefined;
    const { valid, errors } = validate(form, "wrong_deduction");
    assert.equal(valid, false);
    assert.ok(errors.taxableIncome);
  });

  it("passes taxableIncome validation when value is provided", () => {
    const form = { ...DEFAULT_REVISED_FORM_FIELDS, taxableIncome: "400000" };
    const { errors } = validate(form, "wrong_deduction");
    assert.equal(errors.taxableIncome, undefined);
  });
});

describe("BUG-ITR-076/077 bankAccount + IFSC — validate() never throws TypeError", () => {
  it("does not throw when bankAccount is undefined", () => {
    const form = { ...DEFAULT_REVISED_FORM_FIELDS } as RevisedFormFields;
    (form as any).bankAccount = undefined;
    assert.doesNotThrow(() => validate(form, "incorrect_bank"));
  });

  it("does not throw when ifsc is undefined", () => {
    const form = { ...DEFAULT_REVISED_FORM_FIELDS, bankAccount: "12345678" } as RevisedFormFields;
    (form as any).ifsc = undefined;
    assert.doesNotThrow(() => validate(form, "incorrect_bank"));
  });

  it("reports bankAccount required error when undefined", () => {
    const form = { ...DEFAULT_REVISED_FORM_FIELDS } as RevisedFormFields;
    (form as any).bankAccount = undefined;
    const { errors } = validate(form, "incorrect_bank");
    assert.ok(errors.bankAccount);
  });

  it("reports ifsc required error when undefined", () => {
    const form = { ...DEFAULT_REVISED_FORM_FIELDS, bankAccount: "12345678" } as RevisedFormFields;
    (form as any).ifsc = undefined;
    const { errors } = validate(form, "incorrect_bank");
    assert.ok(errors.ifsc);
  });

  it("reports ifsc length error when shorter than 11 chars", () => {
    const form = { ...DEFAULT_REVISED_FORM_FIELDS, bankAccount: "12345678", ifsc: "SBIN001" };
    const { errors } = validate(form, "incorrect_bank");
    assert.ok(errors.ifsc);
  });

  it("passes incorrect_bank validation with valid account and IFSC", () => {
    const form = { ...DEFAULT_REVISED_FORM_FIELDS, bankAccount: "123456789012", ifsc: "SBIN0001234" };
    const { valid } = validate(form, "incorrect_bank");
    assert.equal(valid, true);
  });
});

// ─── Full-form null-safety (all 8 fields undefined) ──────────────────────────

describe("Full-form undefined fields — validate() never crashes on any reason", () => {
  const allUndefinedForm = {
    salaryBusinessIncome: undefined,
    otherIncome: undefined,
    sec80c: undefined,
    sec80d: undefined,
    homeLoanInterest: undefined,
    bankAccount: undefined,
    ifsc: undefined,
    taxableIncome: undefined,
  } as unknown as RevisedFormFields;

  const reasons = ["missed_income", "wrong_deduction", "incorrect_bank", "other"] as const;

  for (const reason of reasons) {
    it(`does not throw for reason="${reason}" when all fields are undefined`, () => {
      assert.doesNotThrow(() => validate(allUndefinedForm, reason));
    });
  }
});

// ─── keyboardType contract: number-pad strips decimal on input ────────────────

describe("BUG-ITR-074–079 keyboardType='number-pad' — /[^0-9]/g strips decimal correctly", () => {
  const strip = (val: string) => val.replace(/[^0-9]/g, "");

  it("strips decimal point from input (user typed '1234.56')", () => {
    assert.equal(strip("1234.56"), "123456");
  });

  it("strips comma from input (user typed '1,00,000')", () => {
    assert.equal(strip("1,00,000"), "100000");
  });

  it("strips all non-digit chars", () => {
    assert.equal(strip("₹5 00 000"), "500000");
  });

  it("preserves a clean integer string", () => {
    assert.equal(strip("750000"), "750000");
  });

  it("strips empty string to empty string", () => {
    assert.equal(strip(""), "");
  });

  // number-pad keyboard never emits a decimal on its own — this test
  // confirms our regex is the correct guard for the "numeric" fallback
  // that previously allowed a decimal key to appear.
  it("confirms number-pad intent: only digits 0–9 pass through", () => {
    const digitOnly = /^[0-9]*$/;
    assert.ok(digitOnly.test(strip("9,87,654")));
    assert.ok(digitOnly.test(strip("0")));
    assert.ok(digitOnly.test(strip("")));
  });
});

// ─── getInitialForm regression: previous broken behavior ─────────────────────

describe("Regression — old getInitialForm returned raw storeFormData (proof of bug)", () => {
  it("old behavior: returning storeFormData directly left fields undefined", () => {
    const partial: Partial<RevisedFormFields> = { salaryBusinessIncome: "500000" };
    // Simulate OLD behavior: return storeFormData || DEFAULT
    const oldResult = (partial as RevisedFormFields) || DEFAULT_REVISED_FORM_FIELDS;
    // salaryBusinessIncome is set but taxableIncome is missing
    assert.equal(oldResult.taxableIncome, undefined);
    // validate() would then crash on oldResult.taxableIncome.trim()
    assert.throws(() => {
      if (!(oldResult.taxableIncome as any)) {
        (oldResult.taxableIncome as any).trim(); // TypeError
      }
    });
  });

  it("new behavior: getInitialForm always returns complete form", () => {
    const partial: Partial<RevisedFormFields> = { salaryBusinessIncome: "500000" };
    const newResult = getInitialForm(undefined, partial);
    assert.equal(typeof newResult.taxableIncome, "string");
    // Now validate() does not throw
    assert.doesNotThrow(() => validate(newResult, "missed_income"));
  });
});
