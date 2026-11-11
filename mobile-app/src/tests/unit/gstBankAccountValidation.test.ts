/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { GstValidators } from "../../modules/gst/utils/gstValidators";

// ===============================================================================================
// Finsolz GST Registration — Bank Account Number & Confirm Account Number Validation Tests
// Rules:
// - Rule A: Required field (reject empty and whitespace-only)
// - Rule B: Digits only (reject letters, punctuation, emojis, spaces; do not silently sanitize)
// - Rule C: Reject all-zero account numbers (0, 00, 000000000, 0000000000000000)
// - Rule D: Established length rules (9 to 18 digits)
// - Rule E: Confirm account number synchronization and mismatch detection
// ===============================================================================================

const VALID_SAMPLE_FORM: Record<string, string> = {
  legalName: "Acme Enterprises Private Limited",
  businessName: "Acme Enterprises",
  businessType: "Private Limited Company",
  natureOfBusiness: "Retail Business",
  placeOfBusiness: "Principal Place of Business",
  businessStartDate: "01-01-2023",
  reasonForRegistration: "Crossing Threshold",
  compositionScheme: "No",
  businessAddress: "Flat 101, Lake View Towers, 5th Main Road",
  city: "Bengaluru",
  district: "Bengaluru Urban",
  state: "Karnataka",
  pinCode: "560001",
  hsnCode: "998311",
  accountHolderName: "Acme Enterprises Private Limited",
  bankAccountNumber: "123456789012",
  confirmBankAccountNumber: "123456789012",
  ifscCode: "HDFC0001234",
  bankName: "HDFC Bank",
  branchName: "Koramangala",
  accountType: "Current",
  signatoryName: "Rajesh Kumar",
  signatoryPan: "ABCPE1234F",
  signatoryDob: "15-08-1985",
  signatoryDesignation: "Director",
  signatoryMobile: "9876543210",
  signatoryEmail: "rajesh@acmeenterprises.com",
  aadhaarConsent: "true",
};

test("Bank Account Rule A: rejects empty and whitespace-only values", () => {
  const emptyInputs = ["", "   ", "\t", "\n", " \t \n "];
  emptyInputs.forEach((input) => {
    assert.equal(GstValidators.isValidBankAccount(input), false, `Should reject empty/whitespace input: "${input}"`);
    assert.equal(GstValidators.validateBankAccountNumber(input), "Bank account number is required");
    assert.equal(GstValidators.validateBusinessField("bankAccountNumber", input), "Bank account number is required");
    assert.equal(GstValidators.validateConfirmBankAccountNumber(input), "Confirm account number is required");
    assert.equal(GstValidators.validateBusinessField("confirmBankAccountNumber", input), "Confirm account number is required");
  });
});

test("Bank Account Rule B: rejects alphabetic characters, punctuation, emojis, and spaces", () => {
  const invalidInputs = [
    "12345678A", // letter at end
    "A12345678", // letter at start
    "1234A5678", // letter in middle
    "account123", // full word
    "12345 6789", // embedded space
    " 123456789", // leading space
    "123456789 ", // trailing space
    "1234-5678-9", // hyphens
    "1234.5678.9", // dots
    "123456789!", // punctuation
    "12345678#0", // special char
    "123456789💰", // emoji
    "123456789🏦", // emoji
    "१२३४५६७८९", // Devanagari numerals
  ];

  invalidInputs.forEach((input) => {
    assert.equal(GstValidators.isValidBankAccount(input), false, `Should reject non-ASCII digit input: "${input}"`);
    assert.equal(
      GstValidators.validateBankAccountNumber(input),
      "Account number must contain digits only.",
      `Expected digits only message for: "${input}"`
    );
    assert.equal(
      GstValidators.validateBusinessField("bankAccountNumber", input),
      "Account number must contain digits only."
    );
    assert.equal(
      GstValidators.validateConfirmBankAccountNumber(input, "123456789012"),
      "Account number must contain digits only."
    );
  });
});

test("Bank Account Rule C: rejects all-zero account numbers regardless of length", () => {
  const allZeroInputs = [
    "0",
    "00",
    "000000000", // 9 zeros
    "0000000000", // 10 zeros
    "000000000000", // 12 zeros
    "0000000000000000", // 16 zeros
    "000000000000000000", // 18 zeros
  ];

  allZeroInputs.forEach((input) => {
    assert.equal(GstValidators.isValidBankAccount(input), false, `Should reject all-zero input: "${input}"`);
    assert.equal(
      GstValidators.validateBankAccountNumber(input),
      "Enter a valid bank account number. An account number cannot contain only zeros.",
      `Expected all-zero message for: "${input}"`
    );
    assert.equal(
      GstValidators.validateBusinessField("bankAccountNumber", input),
      "Enter a valid bank account number. An account number cannot contain only zeros."
    );
    assert.equal(
      GstValidators.validateConfirmBankAccountNumber(input, "123456789012"),
      "Enter a valid bank account number. An account number cannot contain only zeros."
    );
  });
});

test("Bank Account Rule D: enforces established length boundaries (9 to 18 digits)", () => {
  // Shorter than minimum (1 to 8 digits)
  const tooShort = ["1", "12", "1234", "1234567", "12345678"];
  tooShort.forEach((input) => {
    assert.equal(GstValidators.isValidBankAccount(input), false, `Should reject too short input: "${input}"`);
    assert.equal(
      GstValidators.validateBankAccountNumber(input),
      "Enter a valid bank account number (9 to 18 digits)",
      `Expected length error for: "${input}"`
    );
  });

  // Longer than maximum (19+ digits)
  const tooLong = [
    "1234567890123456789", // 19 digits
    "12345678901234567890", // 20 digits
  ];
  tooLong.forEach((input) => {
    assert.equal(GstValidators.isValidBankAccount(input), false, `Should reject too long input: "${input}"`);
    assert.equal(
      GstValidators.validateBankAccountNumber(input),
      "Enter a valid bank account number (9 to 18 digits)",
      `Expected length error for: "${input}"`
    );
  });
});

test("Bank Account: accepts established minimum (9 digits) and maximum (18 digits) all nonzero", () => {
  const min9Digits = "123456789";
  const max18Digits = "123456789012345678";
  const valid12Digits = "123456789012";
  const valid15Digits = "123456789012345";

  [min9Digits, max18Digits, valid12Digits, valid15Digits].forEach((input) => {
    assert.equal(GstValidators.isValidBankAccount(input), true, `Should accept valid input: "${input}"`);
    assert.equal(GstValidators.validateBankAccountNumber(input), "");
    assert.equal(GstValidators.validateBusinessField("bankAccountNumber", input), "");
  });
});

test("Bank Account: does not reject legitimate account numbers beginning with zero", () => {
  const legitimateLeadingZeros = [
    "012345678", // 9 digits, starts with 0
    "0012345678", // 10 digits, starts with 00
    "0123456789012", // 13 digits, starts with 0
    "000123456789012345", // 18 digits, starts with 000
  ];

  legitimateLeadingZeros.forEach((input) => {
    assert.equal(GstValidators.isValidBankAccount(input), true, `Should accept leading zero input with nonzeros: "${input}"`);
    assert.equal(GstValidators.validateBankAccountNumber(input), "");
    assert.equal(GstValidators.validateBusinessField("bankAccountNumber", input), "");
  });
});

test("Confirm Account Number: accepts valid account number with matching confirmation", () => {
  const validPairs = [
    ["123456789", "123456789"],
    ["012345678", "012345678"],
    ["123456789012", "123456789012"],
    ["123456789012345678", "123456789012345678"],
  ];

  validPairs.forEach(([acc, conf]) => {
    assert.equal(GstValidators.isBankAccountMatch(acc, conf), true);
    assert.equal(GstValidators.validateConfirmBankAccountNumber(conf, acc), "");
    assert.equal(
      GstValidators.validateBusinessField("confirmBankAccountNumber", conf, { bankAccountNumber: acc }),
      ""
    );
  });
});

test("Confirm Account Number: displays mismatch error when confirmation differs from account number", () => {
  const mismatchedPairs = [
    ["123456789", "987654321"], // completely different
    ["123456789", "123456780"], // off by last digit
    ["123456789012", "123456789013"], // off by last digit
    ["123456789", "12345"], // partial entry
  ];

  mismatchedPairs.forEach(([acc, conf]) => {
    assert.equal(GstValidators.isBankAccountMatch(acc, conf), false);
    assert.equal(
      GstValidators.validateConfirmBankAccountNumber(conf, acc),
      "Account numbers do not match.",
      `Expected mismatch for: acc=${acc}, conf=${conf}`
    );
    assert.equal(
      GstValidators.validateBusinessField("confirmBankAccountNumber", conf, { bankAccountNumber: acc }),
      "Account numbers do not match."
    );
  });
});

test("Confirm Account Number: prioritizes format errors over mismatch errors", () => {
  const original = "123456789012";

  // Non-digit input in confirm field should show format error, not mismatch error
  assert.equal(
    GstValidators.validateConfirmBankAccountNumber("12345678901A", original),
    "Account number must contain digits only."
  );

  // All zeros in confirm field should show all-zero error, not mismatch error
  assert.equal(
    GstValidators.validateConfirmBankAccountNumber("000000000", original),
    "Enter a valid bank account number. An account number cannot contain only zeros."
  );

  // Exceeds max length in confirm field should show length error
  assert.equal(
    GstValidators.validateConfirmBankAccountNumber("1234567890123456789", original),
    "Enter a valid bank account number (9 to 18 digits)"
  );
});

test("Flow & Submission: whole-form submission blocks invalid bank details and allows valid progression", () => {
  // 1. Valid form passes with no errors
  const validResult = GstValidators.validateBusinessForm(VALID_SAMPLE_FORM);
  assert.equal(Object.keys(validResult).length, 0, `Expected 0 errors for valid form, got: ${JSON.stringify(validResult)}`);

  // 2. All-zero account number blocks submission
  const zeroAccountResult = GstValidators.validateBusinessForm({
    ...VALID_SAMPLE_FORM,
    bankAccountNumber: "000000000",
    confirmBankAccountNumber: "000000000",
  });
  assert.equal(
    zeroAccountResult.bankAccountNumber,
    "Enter a valid bank account number. An account number cannot contain only zeros."
  );

  // 3. Letters in account number block submission
  const letterAccountResult = GstValidators.validateBusinessForm({
    ...VALID_SAMPLE_FORM,
    bankAccountNumber: "12345678A012",
    confirmBankAccountNumber: "12345678A012",
  });
  assert.equal(letterAccountResult.bankAccountNumber, "Account number must contain digits only.");

  // 4. Mismatched account numbers block submission
  const mismatchResult = GstValidators.validateBusinessForm({
    ...VALID_SAMPLE_FORM,
    bankAccountNumber: "123456789012",
    confirmBankAccountNumber: "123456789019",
  });
  assert.equal(mismatchResult.confirmBankAccountNumber, "Account numbers do not match.");

  // 5. Short account number (8 digits) blocks submission
  const shortResult = GstValidators.validateBusinessForm({
    ...VALID_SAMPLE_FORM,
    bankAccountNumber: "12345678",
    confirmBankAccountNumber: "12345678",
  });
  assert.equal(shortResult.bankAccountNumber, "Enter a valid bank account number (9 to 18 digits)");

  // 6. Correction of invalid value clears error and allows progression
  const correctedForm = {
    ...VALID_SAMPLE_FORM,
    bankAccountNumber: "987654321098",
    confirmBankAccountNumber: "987654321098",
  };
  const correctedResult = GstValidators.validateBusinessForm(correctedForm);
  assert.equal(Object.keys(correctedResult).length, 0);
});

test("Code Architecture: component GstBusinessStep preserves raw input for authoritative validation", () => {
  const filePath = path.resolve(__dirname, "../../modules/gst/gst-registration/components/GstBusinessStep/GstBusinessStep.tsx");
  const content = fs.readFileSync(filePath, "utf-8");

  const bankAccountBlock = content.slice(content.indexOf('"bankAccountNumber"'), content.indexOf('"ifscCode"'));
  assert.match(bankAccountBlock, /keyboardType:\s*"numeric"/);
  assert.match(bankAccountBlock, /maxLength:\s*18/);
  assert.doesNotMatch(bankAccountBlock, /transform:\s*sanitizeDigits/);

  const confirmBlock = content.slice(content.indexOf('"confirmBankAccountNumber"'), content.indexOf('"ifscCode"'));
  assert.match(confirmBlock, /keyboardType:\s*"numeric"/);
  assert.match(confirmBlock, /maxLength:\s*18/);
  assert.doesNotMatch(confirmBlock, /transform:\s*sanitizeDigits/);
});
