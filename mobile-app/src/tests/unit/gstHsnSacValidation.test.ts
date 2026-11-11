/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { GstValidators } from "../../modules/gst/utils/gstValidators";
import { hsnSacPolicy } from "../../modules/gst/utils/hsnSacPolicy";

// ===============================================================================================
// Finsolz GST Registration — HSN/SAC Validation Unit Tests
// - Reject all-zero HSN codes (e.g. 0000, 000000, 00000000).
// - Reject invalid HSN lengths of 5 and 7 digits (HSN must be 4, 6, or 8 digits).
// - Enforce exactly 6 digits for SAC codes beginning with 99.
// - Reject empty, whitespace, and non-numeric inputs.
// - Shared rules across field input, blur, Continue, and whole-form validation.
// ===============================================================================================

test("HSN/SAC: accepts valid 6-digit SAC codes beginning with 99", () => {
  const validSacCodes = [
    "998311", // IT Consulting & Support
    "998231", // Legal Services
    "995411", // General Construction Services
    "998412", // Mobile Telecommunications
    "999999", // Boundary SAC
  ];

  validSacCodes.forEach((code) => {
    assert.equal(GstValidators.isValidHsnCode(code), true, `Expected valid for: ${code}`);
    assert.equal(GstValidators.validateHsnCode(code), "", `Expected no error for: ${code}`);
    assert.equal(
      GstValidators.validateBusinessField("hsnCode", code),
      "",
      `Expected field validation empty for: ${code}`
    );

    const classification = hsnSacPolicy.classify(code);
    assert.equal(classification.isValid, true);
    assert.equal(classification.type, "SAC");
    assert.equal(classification.label, "SAC (Services) — 6 digits");
    assert.equal(hsnSacPolicy.isServiceCode(code), true);
  });
});

test("HSN/SAC: rejects SAC codes beginning with 99 that do not have exactly 6 digits", () => {
  const invalidSacCodes = [
    "99", // 2 digits
    "998", // 3 digits
    "9983", // 4 digits
    "99831", // 5 digits
    "9983111", // 7 digits
    "99831112", // 8 digits
  ];

  invalidSacCodes.forEach((code) => {
    assert.equal(GstValidators.isValidHsnCode(code), false, `Expected invalid for: ${code}`);
    assert.equal(
      GstValidators.validateHsnCode(code),
      "SAC code must be exactly 6 digits",
      `Expected SAC error for: ${code}`
    );
    assert.equal(
      GstValidators.validateBusinessField("hsnCode", code),
      "SAC code must be exactly 6 digits"
    );

    const classification = hsnSacPolicy.classify(code);
    assert.equal(classification.isValid, false, `Classification must be invalid for: ${code}`);
    assert.equal(hsnSacPolicy.isServiceCode(code), false);
  });
});

test("HSN/SAC: accepts valid HSN codes for goods with lengths 4, 6, and 8 digits", () => {
  const validHsnCodes = [
    "0101", // 4 digits, Live horses (valid chapter 01)
    "0401", // 4 digits, Milk and cream (valid chapter 04)
    "1006", // 4 digits, Rice
    "080810", // 6 digits, Apples
    "847130", // 6 digits, Laptop computers
    "84713010", // 8 digits, Personal computers
    "61091000", // 8 digits, T-shirts
  ];

  validHsnCodes.forEach((code) => {
    assert.equal(GstValidators.isValidHsnCode(code), true, `Expected valid for: ${code}`);
    assert.equal(GstValidators.validateHsnCode(code), "", `Expected no error for: ${code}`);
    assert.equal(
      GstValidators.validateBusinessField("hsnCode", code),
      "",
      `Expected field validation empty for: ${code}`
    );

    const classification = hsnSacPolicy.classify(code);
    assert.equal(classification.isValid, true);
    assert.equal(classification.type, "HSN");
    assert.equal(classification.label, `HSN (Goods) — ${code.length} digits`);
    assert.equal(hsnSacPolicy.isServiceCode(code), false);
  });
});

test("HSN/SAC: strictly rejects invalid HSN lengths of 5 and 7 digits", () => {
  const invalidLengthHsn = [
    "12345", // 5 digits
    "84713", // 5 digits
    "01010", // 5 digits
    "1234567", // 7 digits
    "8471301", // 7 digits
    "0101010", // 7 digits
    "12", // 2 digits (< 4)
    "123", // 3 digits (< 4)
    "123456789", // 9 digits (> 8)
  ];

  invalidLengthHsn.forEach((code) => {
    assert.equal(GstValidators.isValidHsnCode(code), false, `Expected invalid for: ${code}`);
    assert.equal(
      GstValidators.validateHsnCode(code),
      "HSN code must be 4, 6, or 8 digits",
      `Expected length error for: ${code}`
    );
    assert.equal(
      GstValidators.validateBusinessField("hsnCode", code),
      "HSN code must be 4, 6, or 8 digits"
    );

    const classification = hsnSacPolicy.classify(code);
    assert.equal(classification.isValid, false);
  });
});

test("HSN/SAC: strictly rejects all-zero HSN codes of any length", () => {
  const allZeroCodes = [
    "0",
    "00",
    "000",
    "0000", // 4 zeros
    "00000", // 5 zeros
    "000000", // 6 zeros
    "0000000", // 7 zeros
    "00000000", // 8 zeros
  ];

  allZeroCodes.forEach((code) => {
    assert.equal(GstValidators.isValidHsnCode(code), false, `Expected invalid for: ${code}`);
    assert.equal(
      GstValidators.validateHsnCode(code),
      "HSN/SAC code cannot be all zeros",
      `Expected zero error for: ${code}`
    );
    assert.equal(
      GstValidators.validateBusinessField("hsnCode", code),
      "HSN/SAC code cannot be all zeros"
    );

    const classification = hsnSacPolicy.classify(code);
    assert.equal(classification.isValid, false, `All-zero classification must be invalid for: ${code}`);
  });
});

test("HSN/SAC: rejects empty, null, undefined, and non-numeric inputs", () => {
  const emptyCases = ["", "   ", " \t ", "\n", null, undefined];
  emptyCases.forEach((val) => {
    assert.equal(GstValidators.isValidHsnCode(val), false);
    assert.equal(GstValidators.validateHsnCode(val), "HSN/SAC code is required");
    assert.equal(
      GstValidators.validateBusinessField("hsnCode", (val ?? "") as string),
      "HSN/SAC code is required"
    );
  });

  const nonNumericCases = [
    "99AB11",
    "84713A",
    "99 8311",
    "99-8311",
    "99.8311",
    "998311😊",
    "😊",
    "+998311",
  ];
  nonNumericCases.forEach((code) => {
    assert.equal(GstValidators.isValidHsnCode(code), false, `Expected invalid for: ${code}`);
    assert.equal(
      GstValidators.validateHsnCode(code),
      "HSN/SAC code must contain digits only",
      `Expected digits-only error for: ${code}`
    );
    assert.equal(
      GstValidators.validateBusinessField("hsnCode", code),
      "HSN/SAC code must contain digits only"
    );
  });
});

test("HSN/SAC: whole-form validation (validateBusinessForm) enforces HSN/SAC rules consistently", () => {
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

  // 1. Valid form with 6-digit SAC passes
  const validSacResult = GstValidators.validateBusinessForm(validBaseForm);
  assert.equal(validSacResult.hsnCode, undefined);

  // 2. Valid form with 4-digit HSN passes
  const valid4HsnResult = GstValidators.validateBusinessForm({ ...validBaseForm, hsnCode: "0101" });
  assert.equal(valid4HsnResult.hsnCode, undefined);

  // 3. Valid form with 8-digit HSN passes
  const valid8HsnResult = GstValidators.validateBusinessForm({ ...validBaseForm, hsnCode: "84713010" });
  assert.equal(valid8HsnResult.hsnCode, undefined);

  // 4. Missing HSN code blocks
  const missingResult = GstValidators.validateBusinessForm({ ...validBaseForm, hsnCode: "" });
  assert.equal(missingResult.hsnCode, "HSN/SAC code is required");

  // 5. All-zero HSN code blocks
  const zeroResult = GstValidators.validateBusinessForm({ ...validBaseForm, hsnCode: "000000" });
  assert.equal(zeroResult.hsnCode, "HSN/SAC code cannot be all zeros");

  // 6. Invalid 5-digit HSN blocks
  const hsn5Result = GstValidators.validateBusinessForm({ ...validBaseForm, hsnCode: "12345" });
  assert.equal(hsn5Result.hsnCode, "HSN code must be 4, 6, or 8 digits");

  // 7. Invalid 7-digit HSN blocks
  const hsn7Result = GstValidators.validateBusinessForm({ ...validBaseForm, hsnCode: "1234567" });
  assert.equal(hsn7Result.hsnCode, "HSN code must be 4, 6, or 8 digits");

  // 8. Invalid SAC length blocks
  const sacShortResult = GstValidators.validateBusinessForm({ ...validBaseForm, hsnCode: "99831" });
  assert.equal(sacShortResult.hsnCode, "SAC code must be exactly 6 digits");

  const sacLongResult = GstValidators.validateBusinessForm({ ...validBaseForm, hsnCode: "9983111" });
  assert.equal(sacLongResult.hsnCode, "SAC code must be exactly 6 digits");

  // 9. Non-numeric characters block
  const nonNumResult = GstValidators.validateBusinessForm({ ...validBaseForm, hsnCode: "99AB11" });
  assert.equal(nonNumResult.hsnCode, "HSN/SAC code must contain digits only");
});

test("HSN/SAC: GstBusinessStep source verification confirms maxLength: 8 and keyboardType numeric", () => {
  const stepPath = path.join(
    process.cwd(),
    "src/modules/gst/gst-registration/components/GstBusinessStep/GstBusinessStep.tsx"
  );
  const stepSource = fs.readFileSync(stepPath, "utf-8");

  assert.ok(
    stepSource.includes('renderInput("hsnCode", "Primary HSN / SAC Code *", "e.g. 998311"'),
    "GstBusinessStep must render hsnCode input"
  );
  assert.ok(
    stepSource.includes('maxLength: 8'),
    "GstBusinessStep must enforce maxLength: 8 on hsnCode"
  );
  assert.ok(
    stepSource.includes('keyboardType: "numeric"'),
    "GstBusinessStep must enforce numeric keyboardType on hsnCode"
  );
});
