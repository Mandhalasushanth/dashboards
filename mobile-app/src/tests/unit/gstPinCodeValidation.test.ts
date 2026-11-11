/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { GstValidators } from "../../modules/gst/utils/gstValidators";

// ===============================================================================================
// Finsolz GST Registration — Indian PIN Code Validation Unit Tests
// - Accept exactly 6 numeric digits.
// - First digit must be 1–9; reject PIN codes beginning with 0.
// - Reject letters, spaces, emojis, and special characters.
// - Reject fewer than 6 digits and more than 6 digits.
// - Inline error messages:
//   - Empty: PIN code is required
//   - Non-numeric characters or whitespace: PIN code must contain digits only
//   - Starts with zero: PIN code cannot start with 0
//   - More than 6 digits: PIN code cannot exceed 6 digits
//   - Fewer than 6 digits: PIN code must contain exactly 6 digits
// ===============================================================================================

test("PIN Code: accepts valid 6-digit Indian PIN codes starting with digits 1-9", () => {
  const validPins = [
    "560001", // Bengaluru
    "110001", // New Delhi
    "400001", // Mumbai
    "600001", // Chennai
    "700001", // Kolkata
    "500081", // Hyderabad
    "380001", // Ahmedabad
    "190001", // Srinagar
    "999999", // Max 6-digit boundary
  ];

  validPins.forEach((pin) => {
    assert.equal(GstValidators.isValidPinCode(pin), true, `Expected valid for: ${pin}`);
    assert.equal(GstValidators.validatePinCode(pin), "", `Expected no error for: ${pin}`);
    assert.equal(
      GstValidators.validateBusinessField("pinCode", pin),
      "",
      `Expected field validation empty for: ${pin}`
    );
  });
});

test("PIN Code: rejects empty, null, undefined, and whitespace-only inputs with required message", () => {
  const emptyCases = ["", "   ", " \t ", "\n", null, undefined];

  emptyCases.forEach((val) => {
    assert.equal(GstValidators.isValidPinCode(val), false);
    assert.equal(GstValidators.validatePinCode(val), "PIN code is required");
    assert.equal(
      GstValidators.validateBusinessField("pinCode", (val ?? "") as string),
      "PIN code is required"
    );
  });
});

test("PIN Code: strictly rejects PIN codes starting with 0 with specific message", () => {
  const zeroCases = [
    "0",
    "01",
    "012",
    "0123",
    "01234",
    "012345",
    "056001",
    "000000",
    "099999",
    "0123456",
  ];

  zeroCases.forEach((pin) => {
    assert.equal(GstValidators.isValidPinCode(pin), false, `Expected invalid for: ${pin}`);
    assert.equal(
      GstValidators.validatePinCode(pin),
      "PIN code cannot start with 0",
      `Expected zero error for: ${pin}`
    );
    assert.equal(
      GstValidators.validateBusinessField("pinCode", pin),
      "PIN code cannot start with 0",
      `Expected zero error for: ${pin}`
    );
  });
});

test("PIN Code: rejects numeric inputs with fewer than 6 digits", () => {
  const shortPins = ["1", "12", "123", "1234", "12345", "56000"];

  shortPins.forEach((pin) => {
    assert.equal(GstValidators.isValidPinCode(pin), false, `Expected invalid for: ${pin}`);
    assert.equal(
      GstValidators.validatePinCode(pin),
      "PIN code must contain exactly 6 digits",
      `Expected length error for: ${pin}`
    );
    assert.equal(
      GstValidators.validateBusinessField("pinCode", pin),
      "PIN code must contain exactly 6 digits"
    );
  });
});

test("PIN Code: rejects numeric inputs with more than 6 digits", () => {
  const longPins = ["1234567", "5600019", "12345678", "560001000"];

  longPins.forEach((pin) => {
    assert.equal(GstValidators.isValidPinCode(pin), false, `Expected invalid for: ${pin}`);
    assert.equal(
      GstValidators.validatePinCode(pin),
      "PIN code cannot exceed 6 digits",
      `Expected length error for: ${pin}`
    );
    assert.equal(
      GstValidators.validateBusinessField("pinCode", pin),
      "PIN code cannot exceed 6 digits"
    );
  });
});

test("PIN Code: rejects alphabetic letters and alphanumeric combinations", () => {
  const letterPins = [
    "ABCDEF",
    "abcdef",
    "56000A",
    "A56000",
    "56A001",
    "PinCod",
    "560O01", // Capital letter O instead of zero
    "560I01", // Capital letter I instead of one
    "12AB56",
  ];

  letterPins.forEach((pin) => {
    assert.equal(GstValidators.isValidPinCode(pin), false, `Expected invalid for: ${pin}`);
    assert.equal(
      GstValidators.validatePinCode(pin),
      "PIN code must contain digits only",
      `Expected digit error for: ${pin}`
    );
    assert.equal(
      GstValidators.validateBusinessField("pinCode", pin),
      "PIN code must contain digits only"
    );
  });
});

test("PIN Code: rejects internal, leading, and trailing whitespace", () => {
  const spacePins = [
    "560 01",
    "56 001",
    " 560001",
    "560001 ",
    " 560001 ",
    "5 6 0 0 0 1",
    " 012345",
    "560\t01",
    "560001\n",
  ];

  spacePins.forEach((pin) => {
    assert.equal(GstValidators.isValidPinCode(pin), false, `Expected invalid for: ${pin}`);
    assert.equal(
      GstValidators.validatePinCode(pin),
      "PIN code must contain digits only",
      `Expected digit error for: ${pin}`
    );
    assert.equal(
      GstValidators.validateBusinessField("pinCode", pin),
      "PIN code must contain digits only"
    );
  });
});

test("PIN Code: rejects special characters, symbols, decimals, and emojis", () => {
  const specialPins = [
    "560-01",
    "560.01",
    "560/01",
    "560@01",
    "560#01",
    "560$01",
    "!@#$%^",
    "56000!",
    "+56001",
    "-56001",
    "560001.",
    "560001😊",
    "😊",
    "🇮🇳560001",
    "🎉56001",
  ];

  specialPins.forEach((pin) => {
    assert.equal(GstValidators.isValidPinCode(pin), false, `Expected invalid for: ${pin}`);
    assert.equal(
      GstValidators.validatePinCode(pin),
      "PIN code must contain digits only",
      `Expected digit error for: ${pin}`
    );
    assert.equal(
      GstValidators.validateBusinessField("pinCode", pin),
      "PIN code must contain digits only"
    );
  });
});

test("PIN Code: lookup is strictly gated by isValidPinCode", () => {
  const invalidCandidates = [
    "",
    "   ",
    "056001",
    "56000",
    "1234567",
    "56000A",
    " 560001",
    "560001 ",
    "560-01",
    "560001😊",
  ];

  invalidCandidates.forEach((pin) => {
    const isLookupAllowed = GstValidators.isValidPinCode(pin);
    assert.equal(isLookupAllowed, false, `Lookup should NOT trigger for: ${pin}`);
  });

  const validCandidates = ["560001", "110001", "500081"];
  validCandidates.forEach((pin) => {
    const isLookupAllowed = GstValidators.isValidPinCode(pin);
    assert.equal(isLookupAllowed, true, `Lookup SHOULD trigger for: ${pin}`);
  });
});

test("PIN Code: input enforcement preserves invalid characters without silent stripping", () => {
  // Pasting or typing invalid characters must not be silently stripped into valid digits
  const rawPastedAlphanumeric = "12AB56";
  const rawPastedWhitespace = " 560001 ";
  const rawPastedEmoji = "560001👍";

  // Validator sees the raw text and produces error
  assert.equal(GstValidators.validatePinCode(rawPastedAlphanumeric), "PIN code must contain digits only");
  assert.equal(GstValidators.validatePinCode(rawPastedWhitespace), "PIN code must contain digits only");
  assert.equal(GstValidators.validatePinCode(rawPastedEmoji), "PIN code must contain digits only");

  // Programmatically populated oversized values (> 6 digits) are caught
  const programmaticallyOversized = "560001999";
  assert.equal(GstValidators.validatePinCode(programmaticallyOversized), "PIN code cannot exceed 6 digits");
});

test("PIN Code: GstBusinessStep source verification confirms maxLength: 6 and lookup gating", () => {
  const stepPath = path.join(
    process.cwd(),
    "src/modules/gst/gst-registration/components/GstBusinessStep/GstBusinessStep.tsx"
  );
  const stepSource = fs.readFileSync(stepPath, "utf-8");

  assert.ok(
    stepSource.includes('renderInput("pinCode", "PIN Code *", "560001"'),
    "GstBusinessStep must render pinCode input"
  );
  assert.ok(
    stepSource.includes("maxLength: 6"),
    "GstBusinessStep must enforce maxLength: 6 on pinCode input"
  );
  assert.ok(
    stepSource.includes("GstValidators.isValidPinCode(pin)"),
    "GstBusinessStep must gate handlePinLookup behind GstValidators.isValidPinCode"
  );
});

test("PIN Code: whole-form validation (validateBusinessForm) enforces PIN code rules consistently", () => {
  const validBaseForm: Record<string, string> = {
    legalName: "Acme Enterprises",
    businessName: "Acme Trade",
    businessType: "Proprietorship",
    natureOfBusiness: "Retail",
    placeOfBusiness: "Owned",
    businessStartDate: "15-01-2024",
    reasonForRegistration: "Voluntary",
    compositionScheme: "No",
    businessAddress: "123 MG Road",
    city: "Bengaluru",
    district: "Bengaluru",
    state: "Karnataka",
    pinCode: "560001",
    hsnCode: "998311",
    accountHolderName: "Acme Enterprises",
    bankAccountNumber: "123456789012",
    confirmBankAccountNumber: "123456789012",
    ifscCode: "HDFC0001234",
    bankName: "HDFC Bank",
    branchName: "Indiranagar",
    accountType: "Current",
    signatoryName: "Bhargavi Rao",
    signatoryPan: "ABCPE1234F",
    signatoryDob: "12-05-1990",
    signatoryDesignation: "Proprietor",
    signatoryMobile: "9876543210",
    signatoryEmail: "bhargavi@gmail.com",
    aadhaarConsent: "true",
  };

  // Valid form passes with no pinCode error
  const validResult = GstValidators.validateBusinessForm(validBaseForm);
  assert.equal(validResult.pinCode, undefined);

  // Missing pinCode
  const missingResult = GstValidators.validateBusinessForm({ ...validBaseForm, pinCode: "" });
  assert.equal(missingResult.pinCode, "PIN code is required");

  // Leading zero pinCode
  const zeroResult = GstValidators.validateBusinessForm({ ...validBaseForm, pinCode: "056001" });
  assert.equal(zeroResult.pinCode, "PIN code cannot start with 0");

  // Too short pinCode
  const shortResult = GstValidators.validateBusinessForm({ ...validBaseForm, pinCode: "56000" });
  assert.equal(shortResult.pinCode, "PIN code must contain exactly 6 digits");

  // Too long pinCode
  const longResult = GstValidators.validateBusinessForm({ ...validBaseForm, pinCode: "5600012" });
  assert.equal(longResult.pinCode, "PIN code cannot exceed 6 digits");

  // Letters in pinCode
  const letterResult = GstValidators.validateBusinessForm({ ...validBaseForm, pinCode: "56000A" });
  assert.equal(letterResult.pinCode, "PIN code must contain digits only");

  // Special characters in pinCode
  const specialResult = GstValidators.validateBusinessForm({ ...validBaseForm, pinCode: "560-01" });
  assert.equal(specialResult.pinCode, "PIN code must contain digits only");

  // Whitespace in pinCode
  const spaceResult = GstValidators.validateBusinessForm({ ...validBaseForm, pinCode: " 560001" });
  assert.equal(spaceResult.pinCode, "PIN code must contain digits only");

  // Emoji in pinCode
  const emojiResult = GstValidators.validateBusinessForm({ ...validBaseForm, pinCode: "560001😊" });
  assert.equal(emojiResult.pinCode, "PIN code must contain digits only");
});
