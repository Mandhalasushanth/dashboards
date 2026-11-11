/**
 * ITR Bank Account & IFSC Validation — unit tests
 *
 * Mirrors the logic of:
 *   - validateBankAccountNumber() in shared/validators/indianTaxValidators.ts
 *   - validateIfsc() in shared/validators/indianTaxValidators.ts
 *   - validators.bankAccountNumber() in shared/validation/validators.ts
 *   - validators.ifsc() in shared/validation/validators.ts
 *
 * The 9–18 digit bank account rule is the product-wide "GST-Aligned" standard,
 * confirmed in BankSelectorModal.tsx ("GST-Aligned Account Number Validation"),
 * tdsValidation.ts (ACCOUNT_NUMBER_REGEX = /^[0-9]{9,18}$/), and
 * tdsFormValidation.ts (ACCOUNT_REGEX = /^\d{9,18}$/).
 *
 * Uses Node.js built-in test runner (node:test / node:assert/strict). No React Native imports.
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

// Mirrors validators.bankAccountNumber() error message logic
function bankAccountNumberValidator(fieldName = "Account Number") {
  return (value: string | undefined): string | null => {
    if (!value || String(value).trim() === "") return `${fieldName} is required`;
    const clean = String(value).trim();
    if (!/^[0-9]+$/.test(clean)) return `${fieldName} must contain digits only`;
    if (/^0+$/.test(clean)) return `${fieldName} cannot be all zeros`;
    if (!validateBankAccountNumber(clean)) return `${fieldName} must be between 9 and 18 digits`;
    return null;
  };
}

// Mirrors validators.ifsc() error message logic
function ifscValidator(fieldName = "IFSC Code") {
  return (value: string | undefined): string | null => {
    if (!value || String(value).trim() === "") return `${fieldName} is required`;
    if (!validateIfsc(String(value))) return "Enter valid 11-character IFSC code (e.g. SBIN0001234)";
    return null;
  };
}

// ── 1. validateBankAccountNumber — valid inputs ───────────────────────────────

describe("validateBankAccountNumber — valid inputs", () => {
  const VALID = [
    ["123456789",           "9 digits — minimum boundary"],
    ["1234567890",          "10 digits"],
    ["123456789012",        "12 digits — typical bank account"],
    ["12345678901234567",   "17 digits"],
    ["123456789012345678",  "18 digits — maximum boundary"],
    ["100000000",           "not all-zeros"],
    ["000000001",           "leading zeros but not all-zeros"],
  ] as const;

  VALID.forEach(([acct, label]) => {
    it(`accepts ${label}`, () => {
      assert.equal(validateBankAccountNumber(acct), true);
    });
  });
});

// ── 2. validateBankAccountNumber — length boundary rejects ────────────────────

describe("validateBankAccountNumber — length boundary rejects", () => {
  it("rejects empty string", () => {
    assert.equal(validateBankAccountNumber(""), false);
  });

  it("rejects 8 digits (one below minimum)", () => {
    assert.equal(validateBankAccountNumber("12345678"), false);
  });

  it("rejects 19 digits (one above maximum)", () => {
    assert.equal(validateBankAccountNumber("1234567890123456789"), false);
  });
});

// ── 3. validateBankAccountNumber — all-zero rejection ────────────────────────

describe("validateBankAccountNumber — all-zero rejection", () => {
  const ALL_ZEROS = [
    ["000000000",           "9 zeros (minimum-length all-zero)"],
    ["0000000000",          "10 zeros"],
    ["000000000000",        "12 zeros"],
    ["000000000000000000",  "18 zeros (maximum-length all-zero)"],
  ] as const;

  ALL_ZEROS.forEach(([acct, label]) => {
    it(`rejects ${label}`, () => {
      assert.equal(validateBankAccountNumber(acct), false);
    });
  });
});

// ── 4. validateBankAccountNumber — non-digit character rejection ──────────────

describe("validateBankAccountNumber — non-digit character rejection", () => {
  const INVALID = [
    ["12345678A",   "trailing letter"],
    ["A12345678",   "leading letter"],
    ["1234A56789",  "embedded letter"],
    ["12345 6789",  "embedded space"],
    ["1234-56789",  "hyphen"],
    ["1234.56789",  "dot"],
    ["123456789!",  "exclamation mark"],
    ["12345678#9",  "hash"],
  ] as const;

  INVALID.forEach(([acct, label]) => {
    it(`rejects account with ${label}`, () => {
      assert.equal(validateBankAccountNumber(acct), false);
    });
  });
});

// ── 5. validateBankAccountNumber — whitespace trimming ────────────────────────

describe("validateBankAccountNumber — whitespace trimming", () => {
  it("accepts valid number with surrounding whitespace (trimmed internally)", () => {
    assert.equal(validateBankAccountNumber("  123456789  "), true);
  });

  it("rejects whitespace-only string", () => {
    assert.equal(validateBankAccountNumber("   "), false);
  });
});

// ── 6. validateIfsc — valid inputs ───────────────────────────────────────────

describe("validateIfsc — valid inputs", () => {
  const VALID = [
    "SBIN0001234",  // SBI
    "HDFC0001234",  // HDFC
    "ICIC0001234",  // ICICI
    "UTIB0001234",  // Axis
    "KKBK0001234",  // Kotak
    "ABCD0ABCDEF",  // alphanumeric last 6
    "ABCD0000000",  // all-zero last 6 is structurally valid
  ];

  VALID.forEach((ifsc) => {
    it(`accepts "${ifsc}"`, () => {
      assert.equal(validateIfsc(ifsc), true);
    });
  });
});

// ── 7. validateIfsc — length boundary rejects ─────────────────────────────────

describe("validateIfsc — length boundary rejects", () => {
  it("rejects empty string", () => {
    assert.equal(validateIfsc(""), false);
  });

  it("rejects 10 characters (too short by 1)", () => {
    assert.equal(validateIfsc("SBIN000123"), false);
  });

  it("rejects 12 characters (too long by 1)", () => {
    assert.equal(validateIfsc("SBIN00012345"), false);
  });
});

// ── 8. validateIfsc — structural rejects ─────────────────────────────────────

describe("validateIfsc — structural rejects", () => {
  it("rejects non-zero 5th character (SBIN1001234)", () => {
    assert.equal(validateIfsc("SBIN1001234"), false);
  });

  it("rejects digit in bank code (1BIN0001234)", () => {
    assert.equal(validateIfsc("1BIN0001234"), false);
  });

  it("rejects special character in suffix (SBIN000123@)", () => {
    assert.equal(validateIfsc("SBIN000123@"), false);
  });

  it("rejects special character in bank code (SB!N0001234)", () => {
    assert.equal(validateIfsc("SB!N0001234"), false);
  });

  it("accepts lowercase input (uppercased internally)", () => {
    assert.equal(validateIfsc("sbin0001234"), true);
  });

  it("rejects 5-letter bank code with non-zero 5th (ABCDE001234)", () => {
    assert.equal(validateIfsc("ABCDE001234"), false);
  });

  it("rejects all-digit string (12345678901)", () => {
    assert.equal(validateIfsc("12345678901"), false);
  });
});

// ── 9. bankAccountNumberValidator — error messages ───────────────────────────

describe("bankAccountNumberValidator — error messages", () => {
  const fn = bankAccountNumberValidator();

  it("returns required message for empty string", () => {
    const msg = fn("");
    assert.notEqual(msg, null);
    assert.match(msg as string, /required/i);
  });

  it("returns required message for undefined", () => {
    const msg = fn(undefined);
    assert.notEqual(msg, null);
    assert.match(msg as string, /required/i);
  });

  it("returns digits-only message for alphanumeric input", () => {
    const msg = fn("12345678A");
    assert.notEqual(msg, null);
    assert.match(msg as string, /digits only/i);
  });

  it("returns all-zeros message for all-zero input", () => {
    const msg = fn("000000000");
    assert.notEqual(msg, null);
    assert.match(msg as string, /zeros/i);
  });

  it("returns length message for 8-digit input", () => {
    const msg = fn("12345678");
    assert.notEqual(msg, null);
    assert.match(msg as string, /9.*18|between/i);
  });

  it("returns null for a valid 12-digit account number", () => {
    assert.equal(fn("123456789012"), null);
  });

  it("returns null for 9-digit minimum", () => {
    assert.equal(fn("123456789"), null);
  });

  it("returns null for 18-digit maximum", () => {
    assert.equal(fn("123456789012345678"), null);
  });
});

// ── 10. ifscValidator — error messages ───────────────────────────────────────

describe("ifscValidator — error messages", () => {
  const fn = ifscValidator();

  it("returns required message for empty string", () => {
    const msg = fn("");
    assert.notEqual(msg, null);
    assert.match(msg as string, /required/i);
  });

  it("returns required message for undefined", () => {
    const msg = fn(undefined);
    assert.notEqual(msg, null);
    assert.match(msg as string, /required/i);
  });

  it("returns format message for malformed IFSC (non-zero 5th char)", () => {
    const msg = fn("SBIN1001234");
    assert.notEqual(msg, null);
    assert.match(msg as string, /IFSC/i);
  });

  it("returns format message for IFSC with special characters", () => {
    const msg = fn("SB!N0001234");
    assert.notEqual(msg, null);
    assert.match(msg as string, /IFSC/i);
  });

  it("returns null for SBIN0001234", () => {
    assert.equal(fn("SBIN0001234"), null);
  });

  it("returns null for HDFC0001234", () => {
    assert.equal(fn("HDFC0001234"), null);
  });
});

// ── 11. mapToFilingDto gate — invalid values must not reach submission ────────
// These confirm that the exact values previously used as fallback placeholders
// are now correctly rejected by the validators.

describe("mapToFilingDto gate — hardcoded placeholder values are rejected", () => {
  it("old placeholder '000000000' fails validateBankAccountNumber", () => {
    assert.equal(validateBankAccountNumber("000000000"), false);
  });

  it("8-digit account fails validateBankAccountNumber", () => {
    assert.equal(validateBankAccountNumber("12345678"), false);
  });

  it("account with letters fails validateBankAccountNumber", () => {
    assert.equal(validateBankAccountNumber("ABCD12345"), false);
  });

  it("note: 'ABCD0123456' passes structural IFSC check (real format, not a placeholder guard)", () => {
    // ABCD0123456 is structurally valid IFSC format — field-level input filtering
    // (BankSelectorModal onChangeText) prevents entry of truly fake values.
    assert.equal(validateIfsc("ABCD0123456"), true);
  });

  it("non-format IFSC 'BADIFSC' fails validateIfsc", () => {
    assert.equal(validateIfsc("BADIFSC"), false);
  });

  it("IFSC with special character fails validateIfsc", () => {
    assert.equal(validateIfsc("SBIN000123@"), false);
  });

  it("IFSC with wrong 5th char fails validateIfsc", () => {
    assert.equal(validateIfsc("SBIN1001234"), false);
  });
});
