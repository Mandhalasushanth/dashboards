/**
 * TDS Refund Validation — BUG-ITR-003 and BUG-ITR-011 regression tests
 *
 * BUG-ITR-011 root cause: tdsFormValidation.ts and tdsCustomerSchema.ts used
 * PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/ which accepts any uppercase letter
 * as the 4th PAN character. The 4th character encodes the taxpayer category and
 * must be one of A B C F G H J L P T (PAN_CATEGORY_CODES). The fix replaces the
 * local regex with describePanError / validatePan from indianTaxValidators.ts.
 *
 * BUG-ITR-003 root cause: tdsCustomerSchema.ts used isValidEmail from
 * tdsValidation.ts whose regex (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
 * accepts malformed addresses such as consecutive dots, leading dots, and trailing
 * special chars before @. The fix replaces it with validateEmail / validateEmailAddress
 * from indianTaxValidators.ts → profileValidators.ts.
 *
 * Uses Node.js built-in test runner. No React Native imports.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";

// ── Inline PAN constants (mirrors indianTaxValidators.ts) ─────────────────────

const PAN_CATEGORY_CODES = "ABCFGHJLPT";
const PAN_REGEX = new RegExp(`^[A-Z]{3}[${PAN_CATEGORY_CODES}][A-Z][0-9]{4}[A-Z]$`);
const PAN_SHAPE_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

function validatePan(pan: string): boolean {
  if (!pan) return false;
  return PAN_REGEX.test(pan.trim().toUpperCase());
}

function describePanCategoryError(pan: string): string {
  const clean = (pan || "").trim().toUpperCase();
  if (clean.length < 4 || PAN_CATEGORY_CODES.includes(clean[3])) return "";
  return `4th character of PAN must be one of ${PAN_CATEGORY_CODES.split("").join(", ")}`;
}

function describePanError(pan: string): string {
  const clean = (pan || "").trim().toUpperCase();
  if (!clean) return "";
  if (clean.length !== 10) return "PAN must be 10 characters, for example ABCPE1234F";
  if (!PAN_SHAPE_REGEX.test(clean)) return "PAN must be 5 letters, 4 digits, then 1 letter";
  return describePanCategoryError(clean);
}

// Mirror of validateSingleField panNumber case after fix
function validatePanField(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return "PAN Number is required";
  const panErr = describePanError(trimmed);
  if (panErr) return panErr;
  return undefined;
}

// ── Inline email constants (mirrors profileValidators.ts) ─────────────────────

const EMAIL_LOCAL_REGEX = /^[a-zA-Z0-9]+(?:[._+-][a-zA-Z0-9]+)*$/;
const VALID_TLD_REGEX = /^(com|in|org|net|co|gov|edu|mil|biz|info|io|ai|me|dev|app|tech|online|store|agency|global|world|[a-z]{2,4})$/i;
const EMAIL_REGEX_CANONICAL = /^[a-zA-Z0-9]+(?:[._+-][a-zA-Z0-9]+)*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
const DOMAIN_LABEL = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/;

function validateEmailAddress(raw: string): string {
  const email = (raw || "").trim();
  if (!email) return "";
  if (/\s/.test(email)) return "Email cannot contain spaces";
  if (email.length > 100) return "Email cannot be longer than 100 characters";
  if (email.includes("..")) return "Email cannot contain consecutive dots";
  const at = email.indexOf("@");
  if (at === -1) return "Email must contain @";
  if (at !== email.lastIndexOf("@")) return "Email can contain only one @";
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  if (!local) return "Enter the part of the email before @";
  if (!domain) return "Enter the email domain after @";
  if (!EMAIL_LOCAL_REGEX.test(local)) {
    return "Email before @ can only contain letters, numbers, and single . _ - +";
  }
  const labels = domain.split(".");
  if (labels.length < 2) return "Email domain must include a dot, for example gmail.com";
  if (domain.length > 253 || labels.some((label) => !DOMAIN_LABEL.test(label))) {
    return "Email domain is not valid";
  }
  const tld = labels[labels.length - 1].toLowerCase();
  if (!VALID_TLD_REGEX.test(tld)) return "Enter a valid domain extension (e.g. .com, .in)";
  if (!EMAIL_REGEX_CANONICAL.test(email)) return "Enter a valid email address";
  return "";
}

function validateEmail(email: string): boolean {
  return Boolean((email || "").trim()) && validateEmailAddress(email) === "";
}

// Old (buggy) regex used in tdsValidation.ts — kept to document the regression
const OLD_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// ── BUG-ITR-011: validatePan — valid 4th character ────────────────────────────

describe("validatePan — valid 4th character (ABCFGHJLPT)", () => {
  const VALID_CASES: [string, string][] = [
    ["ABAPE1234F", "4th char A (association of persons)"],
    ["ABCBE1234F", "4th char B (body of individuals)"],
    ["ABCCE1234F", "4th char C (company)"],
    ["ABCFE1234F", "4th char F (firm/LLP)"],
    ["ABCGE1234F", "4th char G (government)"],
    ["ABCHE1234F", "4th char H (HUF)"],
    ["ABCJE1234F", "4th char J (artificial juridical)"],
    ["ABCLE1234F", "4th char L (local authority)"],
    ["ABCPE1234F", "4th char P (individual)"],
    ["ABCTE1234F", "4th char T (trust)"],
  ];

  VALID_CASES.forEach(([pan, label]) => {
    it(`accepts PAN with ${label}`, () => {
      assert.equal(validatePan(pan), true);
    });
  });
});

// ── BUG-ITR-011: validatePan — invalid 4th character (regression) ─────────────

describe("validatePan — rejects invalid 4th character (BUG-ITR-011 regression)", () => {
  const INVALID_4TH = ["D", "E", "I", "K", "M", "N", "O", "Q", "R", "S", "U", "V", "W", "X", "Y", "Z"];

  INVALID_4TH.forEach((ch) => {
    it(`rejects PAN with 4th char '${ch}' (not a valid taxpayer category)`, () => {
      const pan = `ABC${ch}E1234F`;
      assert.equal(validatePan(pan), false,
        `Expected false for ABCDE1234F-style PAN with 4th char '${ch}' — previously accepted by the buggy local regex`);
    });
  });
});

// ── BUG-ITR-011: describePanError — messages ──────────────────────────────────

describe("describePanError — returns empty string for valid PAN", () => {
  const VALID_PANS = ["ABCPE1234F", "BNCFH9876K", "ZZZTE0001A", "ABCTE9999Z"];

  VALID_PANS.forEach((pan) => {
    it(`returns "" for valid PAN "${pan}"`, () => {
      assert.equal(describePanError(pan), "");
    });
  });
});

describe("describePanError — length check", () => {
  it("returns error for 9-char PAN (too short)", () => {
    const msg = describePanError("ABCPE123F");
    assert.notEqual(msg, "");
    assert.match(msg, /10/);
  });

  it("returns error for 11-char PAN (too long)", () => {
    const msg = describePanError("ABCPE12345FF");
    assert.notEqual(msg, "");
    assert.match(msg, /10/);
  });
});

describe("describePanError — 4th char category error message", () => {
  it("returns category error for 4th char E (invalid)", () => {
    const msg = describePanError("ABCEE1234F");
    assert.notEqual(msg, "");
    assert.match(msg, /4th/i);
  });

  it("returns empty for 4th char P (valid individual)", () => {
    assert.equal(describePanError("ABCPE1234F"), "");
  });
});

describe("validatePanField — mirrors fixed tdsFormValidation.ts panNumber case", () => {
  it("returns required message for empty string", () => {
    assert.match(validatePanField("") as string, /required/i);
  });

  it("returns undefined for valid PAN ABCPE1234F", () => {
    assert.equal(validatePanField("ABCPE1234F"), undefined);
  });

  it("returns error for PAN with invalid 4th char E", () => {
    const err = validatePanField("ABCEE1234F");
    assert.notEqual(err, undefined);
    assert.match(err as string, /4th/i);
  });

  it("returns error for PAN with invalid 4th char I", () => {
    const err = validatePanField("ABCIE1234F");
    assert.notEqual(err, undefined);
    assert.match(err as string, /4th/i);
  });

  it("returns error for PAN with invalid 4th char K", () => {
    const err = validatePanField("ABCKE1234F");
    assert.notEqual(err, undefined);
    assert.match(err as string, /4th/i);
  });

  it("accepts lowercase input (normalized internally)", () => {
    assert.equal(validatePanField("abcpe1234f"), undefined);
  });
});

// ── BUG-ITR-003: validateEmail — valid inputs ─────────────────────────────────

describe("validateEmail — valid email addresses", () => {
  const VALID = [
    "test@gmail.com",
    "user.name@example.co.in",
    "first+last@example.org",
    "user123@domain.net",
    "a@b.in",
    "USER@GMAIL.COM",
    "test-user@my-domain.dev",
  ];

  VALID.forEach((email) => {
    it(`accepts "${email}"`, () => {
      assert.equal(validateEmail(email), true);
    });
  });
});

// ── BUG-ITR-003: validateEmail — previously accepted by old regex (regression) ─

describe("validateEmail — malformed emails that old regex accepted (BUG-ITR-003 regression)", () => {
  it("rejects consecutive dots in local part: test..test@gmail.com", () => {
    assert.equal(OLD_EMAIL_REGEX.test("test..test@gmail.com"), true, "Confirm old regex accepted it");
    assert.equal(validateEmail("test..test@gmail.com"), false, "New canonical validator rejects it");
  });

  it("rejects leading dot in local part: .test@gmail.com", () => {
    assert.equal(OLD_EMAIL_REGEX.test(".test@gmail.com"), true, "Confirm old regex accepted it");
    assert.equal(validateEmail(".test@gmail.com"), false, "New canonical validator rejects it");
  });

  it("rejects trailing special char before @: test_@gmail.com", () => {
    assert.equal(OLD_EMAIL_REGEX.test("test_@gmail.com"), true, "Confirm old regex accepted it");
    assert.equal(validateEmail("test_@gmail.com"), false, "New canonical validator rejects it");
  });

  it("rejects double dot: test@gmail..com", () => {
    assert.equal(OLD_EMAIL_REGEX.test("test@gmail..com"), true, "Confirm old regex accepted it");
    assert.equal(validateEmail("test@gmail..com"), false, "New canonical validator rejects it");
  });
});

// ── BUG-ITR-003: validateEmail — clearly invalid inputs (both validators reject) ─

describe("validateEmail — clearly invalid inputs rejected by both validators", () => {
  it("rejects missing @", () => {
    assert.equal(validateEmail("testgmail.com"), false);
  });

  it("rejects empty local part: @gmail.com", () => {
    assert.equal(validateEmail("@gmail.com"), false);
  });

  it("rejects empty domain: test@", () => {
    assert.equal(validateEmail("test@"), false);
  });

  it("rejects space in email: test @gmail.com", () => {
    assert.equal(validateEmail("test @gmail.com"), false);
  });

  it("rejects empty string", () => {
    assert.equal(validateEmail(""), false);
  });

  it("rejects two @ signs: test@test@gmail.com", () => {
    assert.equal(validateEmail("test@test@gmail.com"), false);
  });
});

// ── BUG-ITR-003: validateEmailAddress — detailed error messages ───────────────

describe("validateEmailAddress — error message content", () => {
  it("returns empty string for valid email (no error)", () => {
    assert.equal(validateEmailAddress("test@gmail.com"), "");
  });

  it("returns 'consecutive dots' message for test..test@gmail.com", () => {
    const msg = validateEmailAddress("test..test@gmail.com");
    assert.notEqual(msg, "");
    assert.match(msg, /consecutive/i);
  });

  it("returns 'spaces' message for email with space", () => {
    const msg = validateEmailAddress("test @gmail.com");
    assert.notEqual(msg, "");
    assert.match(msg, /space/i);
  });

  it("returns '@' message for email without @", () => {
    const msg = validateEmailAddress("testgmail.com");
    assert.notEqual(msg, "");
    assert.match(msg, /@/);
  });

  it("returns 'one @' message for double-@ email", () => {
    const msg = validateEmailAddress("test@test@gmail.com");
    assert.notEqual(msg, "");
    assert.match(msg, /one @/i);
  });

  it("returns 'before @' message for missing local part", () => {
    const msg = validateEmailAddress("@gmail.com");
    assert.notEqual(msg, "");
    assert.match(msg, /before @/i);
  });
});
