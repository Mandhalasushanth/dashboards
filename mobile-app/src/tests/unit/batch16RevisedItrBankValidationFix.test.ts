/**
 * Batch 16 — Revised ITR Bank Details Correction Validation
 *
 * Five validation bugs in UpdateRevisedDetailsScreen.validate() for reason="incorrect_bank":
 *
 * Bug 1: Bank account accepts letters/underscore
 *   Old: replace(/[^\w]/g, "") — \w = [a-zA-Z0-9_], letters not stripped.
 *   "ABC123456" was 9 chars after cleaning → passed validation.
 *   Fix: validators.bankAccountNumber() checks /^[0-9]+$/ first.
 *
 * Bug 2: Bank account min length threshold too small (4 vs 9)
 *   Old: cleanBank.length < 4 — a 4-digit account "1234" passed.
 *   Fix: validateBankAccountNumber() requires 9–18 digits.
 *
 * Bug 3: Bank account max length not validated in validate()
 *   Old: only length < 4 checked; a 20-digit account passed.
 *   Fix: validateBankAccountNumber() rejects > 18 digits.
 *
 * Bug 4: All-zero bank account not rejected
 *   Old: "000000000" (9 chars) ≥ 4 — passes validation.
 *   Fix: validateBankAccountNumber() rejects /^0+$/ matches.
 *
 * Bug 5: IFSC format not validated (length-only check)
 *   Old: cleanIfsc.length !== 11 — "SBIN1001234" (5th char ≠ '0') passed length check.
 *   Fix: validateIfsc() applies /^[A-Z]{4}0[A-Z0-9]{6}$/.
 *
 * All fixes delegate to the canonical shared validators in:
 *   - shared/validators/indianTaxValidators.ts
 *   - shared/validation/validators.ts
 *
 * Uses Node.js built-in test runner (node:test / node:assert/strict).
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

// ── Inline validator implementations (mirrors production source) ──────────────

const BANK_ACCOUNT_REGEX = /^[0-9]{9,18}$/;
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

function validateBankAccountNumber(accountNumber: string): boolean {
  if (!accountNumber) return false;
  const clean = accountNumber.trim();
  return BANK_ACCOUNT_REGEX.test(clean) && !/^0+$/.test(clean);
}

function validateIfsc(ifsc: string): boolean {
  if (!ifsc) return false;
  return IFSC_REGEX.test(ifsc.trim().toUpperCase());
}

// Fixed validators (mirrors validators.bankAccountNumber / validators.ifsc)
function bankAccountNumberValidator(fieldName = "Bank account for refund") {
  return (value: string | undefined): string | null => {
    if (!value || String(value).trim() === "") return `${fieldName} is required`;
    const clean = String(value).trim();
    if (!/^[0-9]+$/.test(clean)) return `${fieldName} must contain digits only`;
    if (/^0+$/.test(clean)) return `${fieldName} cannot be all zeros`;
    if (!validateBankAccountNumber(clean)) return `${fieldName} must be between 9 and 18 digits`;
    return null;
  };
}

function ifscValidator(fieldName = "IFSC") {
  return (value: string | undefined): string | null => {
    if (!value || String(value).trim() === "") return `${fieldName} is required`;
    if (!validateIfsc(String(value))) return "Enter valid 11-character IFSC code (e.g. SBIN0001234)";
    return null;
  };
}

// Old broken validator replicas (for proof-of-bug tests)
function oldBankValidate(bankAccount: string): string | null {
  const cleanBank = (bankAccount || "").replace(/[^\w]/g, "");
  if (!cleanBank || cleanBank.length < 4) {
    return "Enter a valid bank account number.";
  }
  return null;
}

function oldIfscValidate(ifsc: string): string | null {
  const cleanIfsc = (ifsc || "").trim().toUpperCase();
  if (!cleanIfsc) return "IFSC code is required.";
  if (cleanIfsc.length !== 11) return "IFSC must be 11 characters.";
  return null;
}

// Fixed validate() — mirrors UpdateRevisedDetailsScreen.validate() after Batch 16
type ValidationErrors = { bankAccount?: string; ifsc?: string };

function validateIncorrectBank(bankAccount: string, ifsc: string): ValidationErrors {
  const newErrors: ValidationErrors = {};
  const bankError = bankAccountNumberValidator("Bank account for refund")(bankAccount);
  if (bankError) newErrors.bankAccount = bankError;
  const ifscError = ifscValidator("IFSC")(ifsc);
  if (ifscError) newErrors.ifsc = ifscError;
  return newErrors;
}

// ── Bug 1: Letters in bank account ────────────────────────────────────────────

describe("Bug 1 — Bank account accepts letters (proof of old bug, new fix)", () => {
  it("OLD: 'ABC123456' (9 chars after clean) passes old validation — shows the bug", () => {
    assert.equal(oldBankValidate("ABC123456"), null, "old validator incorrectly accepted letters");
  });

  it("NEW: 'ABC123456' is rejected — must contain digits only", () => {
    const errors = validateIncorrectBank("ABC123456", "SBIN0001234");
    assert.ok(errors.bankAccount, "expected bankAccount error");
    assert.match(errors.bankAccount!, /digits only/i);
  });

  it("NEW: '1234A56789' is rejected — embedded letter", () => {
    const errors = validateIncorrectBank("1234A56789", "SBIN0001234");
    assert.ok(errors.bankAccount);
    assert.match(errors.bankAccount!, /digits only/i);
  });

  it("NEW: 'ABCDEFGHI' (9 letters) is rejected", () => {
    const errors = validateIncorrectBank("ABCDEFGHI", "SBIN0001234");
    assert.ok(errors.bankAccount);
    assert.match(errors.bankAccount!, /digits only/i);
  });

  it("NEW: '12345_6789' (underscore) is rejected", () => {
    const errors = validateIncorrectBank("12345_6789", "SBIN0001234");
    assert.ok(errors.bankAccount);
    assert.match(errors.bankAccount!, /digits only/i);
  });
});

// ── Bug 2: Min length threshold too small (4 vs 9) ────────────────────────────

describe("Bug 2 — Bank account min length threshold (4 vs correct 9)", () => {
  it("OLD: '1234' (4 digits) passes old validation — shows the bug", () => {
    assert.equal(oldBankValidate("1234"), null, "old validator accepted 4-digit account");
  });

  it("OLD: '12345678' (8 digits) passes old validation", () => {
    assert.equal(oldBankValidate("12345678"), null, "old validator accepted 8-digit account");
  });

  it("NEW: '1234' (4 digits) rejected — must be 9–18 digits", () => {
    const errors = validateIncorrectBank("1234", "SBIN0001234");
    assert.ok(errors.bankAccount);
    assert.match(errors.bankAccount!, /9.*18|between/i);
  });

  it("NEW: '12345678' (8 digits) rejected — one below minimum", () => {
    const errors = validateIncorrectBank("12345678", "SBIN0001234");
    assert.ok(errors.bankAccount);
    assert.match(errors.bankAccount!, /9.*18|between/i);
  });

  it("NEW: '123456789' (9 digits) accepted — at minimum boundary", () => {
    const errors = validateIncorrectBank("123456789", "SBIN0001234");
    assert.equal(errors.bankAccount, undefined);
  });

  it("NEW: '123456789012' (12 digits) accepted — typical account length", () => {
    const errors = validateIncorrectBank("123456789012", "SBIN0001234");
    assert.equal(errors.bankAccount, undefined);
  });
});

// ── Bug 3: Max length not validated ───────────────────────────────────────────

describe("Bug 3 — Bank account max length not checked in old validate()", () => {
  it("OLD: 19-digit account passes old validation — shows the bug", () => {
    assert.equal(oldBankValidate("1234567890123456789"), null, "old validator accepted 19-digit account");
  });

  it("OLD: 25-digit account passes old validation", () => {
    assert.equal(oldBankValidate("1234567890123456789012345"), null, "old validator accepted 25-digit account");
  });

  it("NEW: '1234567890123456789' (19 digits) rejected — exceeds 18", () => {
    const errors = validateIncorrectBank("1234567890123456789", "SBIN0001234");
    assert.ok(errors.bankAccount);
    assert.match(errors.bankAccount!, /9.*18|between/i);
  });

  it("NEW: '123456789012345678' (18 digits) accepted — at maximum boundary", () => {
    const errors = validateIncorrectBank("123456789012345678", "SBIN0001234");
    assert.equal(errors.bankAccount, undefined);
  });

  it("NEW: '1234567890123456789012345' (25 digits) rejected", () => {
    const errors = validateIncorrectBank("1234567890123456789012345", "SBIN0001234");
    assert.ok(errors.bankAccount);
    assert.match(errors.bankAccount!, /9.*18|between/i);
  });
});

// ── Bug 4: All-zeros not rejected ─────────────────────────────────────────────

describe("Bug 4 — All-zero bank account not rejected by old validate()", () => {
  it("OLD: '000000000' (9 zeros) passes old validation — shows the bug", () => {
    assert.equal(oldBankValidate("000000000"), null, "old validator accepted all-zero account");
  });

  it("OLD: '000000000000' (12 zeros) passes old validation", () => {
    assert.equal(oldBankValidate("000000000000"), null);
  });

  it("NEW: '000000000' (9 zeros) rejected — cannot be all zeros", () => {
    const errors = validateIncorrectBank("000000000", "SBIN0001234");
    assert.ok(errors.bankAccount);
    assert.match(errors.bankAccount!, /zeros/i);
  });

  it("NEW: '000000000000' (12 zeros) rejected", () => {
    const errors = validateIncorrectBank("000000000000", "SBIN0001234");
    assert.ok(errors.bankAccount);
    assert.match(errors.bankAccount!, /zeros/i);
  });

  it("NEW: '000000001' (leading zeros, last digit 1) accepted", () => {
    const errors = validateIncorrectBank("000000001", "SBIN0001234");
    assert.equal(errors.bankAccount, undefined);
  });

  it("NEW: '100000000' (non-zero) accepted", () => {
    const errors = validateIncorrectBank("100000000", "SBIN0001234");
    assert.equal(errors.bankAccount, undefined);
  });
});

// ── Bug 5: IFSC format not validated (length-only check) ──────────────────────

describe("Bug 5 — IFSC format not validated in old validate() (length-only check)", () => {
  it("OLD: 'SBIN1001234' (5th char='1' not '0') passes old length check — shows the bug", () => {
    assert.equal(oldIfscValidate("SBIN1001234"), null, "old validator accepted invalid IFSC 5th char");
  });

  it("OLD: '1BIN0001234' (digit in bank code) passes old length check", () => {
    assert.equal(oldIfscValidate("1BIN0001234"), null);
  });

  it("OLD: 'ABCDE001234' (5 letters, non-zero 5th) passes old length check", () => {
    assert.equal(oldIfscValidate("ABCDE001234"), null);
  });

  it("NEW: 'SBIN1001234' rejected — 5th character must be '0'", () => {
    const errors = validateIncorrectBank("123456789", "SBIN1001234");
    assert.ok(errors.ifsc);
    assert.match(errors.ifsc!, /IFSC/i);
  });

  it("NEW: '1BIN0001234' rejected — bank code must be 4 letters", () => {
    const errors = validateIncorrectBank("123456789", "1BIN0001234");
    assert.ok(errors.ifsc);
    assert.match(errors.ifsc!, /IFSC/i);
  });

  it("NEW: 'ABCDE001234' rejected — bank code must be exactly 4 letters", () => {
    const errors = validateIncorrectBank("123456789", "ABCDE001234");
    assert.ok(errors.ifsc);
    assert.match(errors.ifsc!, /IFSC/i);
  });

  it("NEW: 'SB!N0001234' rejected — special character in bank code", () => {
    const errors = validateIncorrectBank("123456789", "SB!N0001234");
    assert.ok(errors.ifsc);
    assert.match(errors.ifsc!, /IFSC/i);
  });

  it("NEW: 'SBIN000123@' rejected — special character in branch code", () => {
    const errors = validateIncorrectBank("123456789", "SBIN000123@");
    assert.ok(errors.ifsc);
    assert.match(errors.ifsc!, /IFSC/i);
  });
});

// ── Valid combined inputs ─────────────────────────────────────────────────────

describe("Fixed validate() — valid incorrect_bank inputs pass both checks", () => {
  const VALID_BANKS = [
    ["123456789",         "9 digits — SBI-style short"],
    ["123456789012",      "12 digits — typical"],
    ["123456789012345678","18 digits — maximum"],
    ["000000001",         "leading zeros but not all-zeros"],
  ] as const;

  const VALID_IFSCS = [
    "SBIN0001234",  // SBI
    "HDFC0001234",  // HDFC
    "ICIC0001234",  // ICICI
    "UTIB0001234",  // Axis
    "ABCD0ABCDEF",  // alphanumeric suffix
  ] as const;

  VALID_BANKS.forEach(([bank, label]) => {
    it(`accepts bank account: ${label}`, () => {
      const errors = validateIncorrectBank(bank, "SBIN0001234");
      assert.equal(errors.bankAccount, undefined);
    });
  });

  VALID_IFSCS.forEach((ifsc) => {
    it(`accepts IFSC: ${ifsc}`, () => {
      const errors = validateIncorrectBank("123456789", ifsc);
      assert.equal(errors.ifsc, undefined);
    });
  });

  it("accepts valid bank + valid IFSC — no errors returned", () => {
    const errors = validateIncorrectBank("123456789012", "SBIN0001234");
    assert.equal(Object.keys(errors).length, 0);
  });
});

// ── Required / empty field guards ─────────────────────────────────────────────

describe("Fixed validate() — required field guards (empty inputs)", () => {
  it("reports bankAccount required when empty string", () => {
    const errors = validateIncorrectBank("", "SBIN0001234");
    assert.ok(errors.bankAccount);
    assert.match(errors.bankAccount!, /required/i);
  });

  it("reports ifsc required when empty string", () => {
    const errors = validateIncorrectBank("123456789", "");
    assert.ok(errors.ifsc);
    assert.match(errors.ifsc!, /required/i);
  });

  it("reports both errors when both are empty", () => {
    const errors = validateIncorrectBank("", "");
    assert.ok(errors.bankAccount);
    assert.ok(errors.ifsc);
  });
});

// ── IFSC lowercase tolerance ───────────────────────────────────────────────────

describe("Fixed validate() — IFSC case-insensitive input", () => {
  it("accepts lowercase IFSC (internally uppercased by validateIfsc)", () => {
    const errors = validateIncorrectBank("123456789", "sbin0001234");
    assert.equal(errors.ifsc, undefined);
  });

  it("accepts mixed-case IFSC", () => {
    const errors = validateIncorrectBank("123456789", "Sbin0001234");
    assert.equal(errors.ifsc, undefined);
  });
});
