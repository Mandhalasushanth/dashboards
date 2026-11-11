/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { GstValidators } from "../../modules/gst/utils/gstValidators";

// ===============================================================================================
// Finsolz GST Registration — Authorised Signatory Strict Validation Tests
// Bug 1: Signatory Name strict spacing and character validation
// Bug 2: Signatory PAN individual category (4th char 'P') validation
// Bug 3: Date of Birth future date rejection
// Bug 4: Date of Birth today's date rejection (must be earlier than today)
// Bug 5: Designation character and spacing validation
// Bug 6: Signatory Mobile dummy/repeated number rejection
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
  signatoryDesignation: "Managing Director",
  signatoryMobile: "9876543210",
  signatoryEmail: "rajesh@acmeenterprises.com",
  aadhaarConsent: "true",
};

const formatDateDDMMYYYY = (date: Date): string => {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${d}-${m}-${date.getFullYear()}`;
};

// ─── BUG 1: Signatory Name ───────────────────────────────────────────────────────────────────

test("BUG 1: Signatory Name rejects empty and whitespace-only input", () => {
  ["", "   ", "\t", "\n"].forEach((input) => {
    assert.equal(GstValidators.isValidSignatoryName(input), false);
    assert.equal(GstValidators.validateSignatoryName(input), "Signatory name is required.");
    assert.equal(GstValidators.validateBusinessField("signatoryName", input), "Signatory name is required.");
  });
});

test("BUG 1: Signatory Name rejects leading, trailing, and consecutive spaces", () => {
  const badSpacing = [
    { val: " Rohit Sharma", label: "leading space" },
    { val: "Rohit Sharma ", label: "trailing space" },
    { val: "Rohit  Sharma", label: "consecutive spaces" },
    { val: "Rohit   Sharma", label: "multiple spaces" },
    { val: "Rohit\tSharma", label: "tab character" },
    { val: "Rohit\nSharma", label: "newline character" },
  ];

  badSpacing.forEach(({ val, label }) => {
    assert.equal(GstValidators.isValidSignatoryName(val), false, `Should reject ${label}: "${val}"`);
    assert.equal(GstValidators.validateSignatoryName(val), "Use a single space between name parts.");
    assert.equal(GstValidators.validateBusinessField("signatoryName", val), "Use a single space between name parts.");
  });
});

test("BUG 1: Signatory Name rejects emojis, numbers, and unsupported symbols", () => {
  const unsupported = [
    "Rohit 🌟 Sharma",
    "Rohit 123",
    "Rohit @ Sharma",
    "Rohit # Sharma",
    "Rohit (Director)",
    "🌟🌟🌟",
  ];

  unsupported.forEach((val) => {
    assert.equal(GstValidators.isValidSignatoryName(val), false, `Should reject unsupported chars: "${val}"`);
    assert.equal(GstValidators.validateSignatoryName(val), "Signatory name contains unsupported characters.");
    assert.equal(GstValidators.validateBusinessField("signatoryName", val), "Signatory name contains unsupported characters.");
  });
});

test("BUG 1: Signatory Name accepts valid multiword, punctuated, and Unicode names", () => {
  const validNames = [
    "Rohit Sharma",
    "A.P.J. Abdul Kalam",
    "K. Ramesh",
    "Ramesh K.",
    "D'Souza",
    "Mary-Ann",
    "రమేష్ కుమార్",
    "रमेश कुमार",
  ];

  validNames.forEach((val) => {
    assert.equal(GstValidators.isValidSignatoryName(val), true, `Should accept valid name: "${val}"`);
    assert.equal(GstValidators.validateSignatoryName(val), "");
    assert.equal(GstValidators.validateBusinessField("signatoryName", val), "");
  });
});

// ─── BUG 2: Signatory PAN ────────────────────────────────────────────────────────────────────

test("BUG 2: Signatory PAN accepts valid individual PAN format (4th char P)", () => {
  const validPans = [
    "ABCPE1234F",
    "XYZPK5678Z",
    "abcpe1234f", // lowercase normalized to uppercase
    "ZZZPA0001A",
  ];

  validPans.forEach((val) => {
    assert.equal(GstValidators.isValidSignatoryPan(val), true, `Should accept valid individual PAN: "${val}"`);
    assert.equal(GstValidators.validateSignatoryPan(val), "");
    assert.equal(GstValidators.validateBusinessField("signatoryPan", val), "");
  });
});

test("BUG 2: Signatory PAN strictly rejects non-individual 4th characters", () => {
  const nonIndividualPans = [
    { val: "ABCCE1234F", cat: "C (Company)" },
    { val: "ABCFE1234F", cat: "F (Firm)" },
    { val: "ABCHE1234F", cat: "H (HUF)" },
    { val: "ABCDE1234F", cat: "D (Discontinued/Other)" },
    { val: "ABCAE1234F", cat: "A (AOP)" },
    { val: "ABCTE1234F", cat: "T (Trust)" },
    { val: "ABCGE1234F", cat: "G (Government)" },
    { val: "ABC1E1234F", cat: "1 (Digit)" },
  ];

  nonIndividualPans.forEach(({ val, cat }) => {
    assert.equal(GstValidators.isValidSignatoryPan(val), false, `Should reject non-individual PAN ${cat}: "${val}"`);
    assert.equal(
      GstValidators.validateSignatoryPan(val),
      "For an individual signatory, the fourth PAN character must be P."
    );
    assert.equal(
      GstValidators.validateBusinessField("signatoryPan", val),
      "For an individual signatory, the fourth PAN character must be P."
    );
  });
});

test("BUG 2: Signatory PAN rejects incorrect length and malformed structures", () => {
  const malformed = [
    "",
    "ABCP", // too short
    "ABCPE1234", // 9 chars
    "ABCPE1234F5", // 11 chars
    "ABCPE123AF", // letter in digit position
    "ABCPE12345", // digit in final position
    "123PE1234F", // digits in prefix
    "ABCP E1234F", // embedded space
    "ABCP.1234F", // symbol
  ];

  malformed.forEach((val) => {
    assert.equal(GstValidators.isValidSignatoryPan(val), false, `Should reject malformed PAN: "${val}"`);
    assert.equal(GstValidators.validateSignatoryPan(val), "Enter a valid 10-character PAN.");
  });
});

// ─── BUG 3 & BUG 4: Date of Birth ────────────────────────────────────────────────────────────

test("BUG 3: Date of Birth rejects future dates immediately", () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const futureYear = new Date();
  futureYear.setFullYear(futureYear.getFullYear() + 2);

  const futureDates = [
    formatDateDDMMYYYY(tomorrow),
    formatDateDDMMYYYY(futureYear),
    "15-10-2099",
  ];

  futureDates.forEach((val) => {
    assert.equal(GstValidators.isValidSignatoryDob(val), false, `Should reject future date: "${val}"`);
    assert.equal(GstValidators.validateSignatoryDob(val), "Date of birth cannot be in the future.");
    assert.equal(GstValidators.validateBusinessField("signatoryDob", val), "Date of birth cannot be in the future.");
  });
});

test("BUG 4: Date of Birth rejects today's date and accepts yesterday or earlier", () => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const todayStr = formatDateDDMMYYYY(today);
  const yesterdayStr = formatDateDDMMYYYY(yesterday);

  // Today's date must be rejected
  assert.equal(GstValidators.isValidSignatoryDob(todayStr), false, `Should reject today: "${todayStr}"`);
  assert.equal(GstValidators.validateSignatoryDob(todayStr), "Date of birth must be earlier than today.");
  assert.equal(GstValidators.validateBusinessField("signatoryDob", todayStr), "Date of birth must be earlier than today.");

  // Yesterday must be accepted
  assert.equal(GstValidators.isValidSignatoryDob(yesterdayStr), true, `Should accept yesterday: "${yesterdayStr}"`);
  assert.equal(GstValidators.validateSignatoryDob(yesterdayStr), "");
  assert.equal(GstValidators.validateBusinessField("signatoryDob", yesterdayStr), "");

  // Past dates accepted
  ["15-08-1985", "01-01-2000", "28-02-1996"].forEach((val) => {
    assert.equal(GstValidators.isValidSignatoryDob(val), true);
    assert.equal(GstValidators.validateSignatoryDob(val), "");
  });
});

test("BUG 3 & 4: Date of Birth rejects empty, invalid formats, and impossible calendar dates", () => {
  assert.equal(GstValidators.validateSignatoryDob(""), "Date of birth is required");
  assert.equal(GstValidators.validateSignatoryDob("31-02-2023"), "Enter a valid date in DD-MM-YYYY format");
  assert.equal(GstValidators.validateSignatoryDob("invalid-date"), "Enter a valid date in DD-MM-YYYY format");
});

// ─── BUG 5: Designation ──────────────────────────────────────────────────────────────────────

test("BUG 5: Designation rejects empty, bad spacing, and unsupported characters", () => {
  // Empty
  assert.equal(GstValidators.validateSignatoryDesignation(""), "Designation is required.");
  assert.equal(GstValidators.validateSignatoryDesignation("   "), "Designation is required.");

  // Bad spacing
  [
    " Managing Director",
    "Managing Director ",
    "Managing  Director",
    "Director\tFinance",
    "Director\nFinance",
  ].forEach((val) => {
    assert.equal(GstValidators.isValidSignatoryDesignation(val), false, `Should reject bad spacing: "${val}"`);
    assert.equal(GstValidators.validateSignatoryDesignation(val), "Use a single space between words.");
  });

  // Unsupported symbols & emojis
  ["Director 💼", "Director #1", "@#$%", "Director 100", "CEO 🌟"].forEach((val) => {
    assert.equal(GstValidators.isValidSignatoryDesignation(val), false, `Should reject unsupported: "${val}"`);
    assert.equal(GstValidators.validateSignatoryDesignation(val), "Designation contains unsupported characters.");
  });

  // Length > 50
  assert.equal(
    GstValidators.validateSignatoryDesignation("A".repeat(51)),
    "Designation cannot exceed 50 characters"
  );
});

test("BUG 5: Designation accepts valid multiword, punctuated, and Unicode titles", () => {
  const validDesignations = [
    "Managing Director",
    "Proprietor / Director / Partner",
    "Co-Founder",
    "Vice President & CFO",
    "Director",
    "Partner",
    "దర్శకుడు",
    "निदेशक",
  ];

  validDesignations.forEach((val) => {
    assert.equal(GstValidators.isValidSignatoryDesignation(val), true, `Should accept valid designation: "${val}"`);
    assert.equal(GstValidators.validateSignatoryDesignation(val), "");
    assert.equal(GstValidators.validateBusinessField("signatoryDesignation", val), "");
  });
});

// ─── BUG 6: Signatory Mobile ─────────────────────────────────────────────────────────────────

test("BUG 6: Signatory Mobile accepts valid 10-digit mobile numbers with legitimate repetition", () => {
  const validMobiles = [
    "9876543210",
    "8765432109",
    "7654321098",
    "6543210987",
    "9888812345", // legitimate partial repetition
    "9123499990", // legitimate partial repetition
    "9898989898", // alternating sequence
  ];

  validMobiles.forEach((val) => {
    assert.equal(GstValidators.isValidSignatoryMobile(val), true, `Should accept valid mobile: "${val}"`);
    assert.equal(GstValidators.isValidMobile(val), true);
    assert.equal(GstValidators.validateSignatoryMobile(val), "");
    assert.equal(GstValidators.validateBusinessField("signatoryMobile", val), "");
  });
});

test("BUG 6: Signatory Mobile strictly rejects all-identical and dummy numbers", () => {
  const dummyNumbers = [
    "9999999999",
    "8888888888",
    "7777777777",
    "6666666666",
  ];

  dummyNumbers.forEach((val) => {
    assert.equal(GstValidators.isValidSignatoryMobile(val), false, `Should reject all-identical digits: "${val}"`);
    assert.equal(GstValidators.isValidMobile(val), false);
    assert.equal(
      GstValidators.validateSignatoryMobile(val),
      "This mobile number is not allowed. Enter a different number."
    );
    assert.equal(
      GstValidators.validateBusinessField("signatoryMobile", val),
      "This mobile number is not allowed. Enter a different number."
    );
  });
});

test("BUG 6: Signatory Mobile rejects invalid lengths, non-numeric chars, and invalid prefixes", () => {
  const invalidMobiles = [
    { val: "1111111111", msg: "Enter a valid mobile number." },
    { val: "0000000000", msg: "Enter a valid mobile number." },
    { val: "98765 43210", msg: "Enter a valid mobile number." },
    { val: "987654321A", msg: "Enter a valid mobile number." },
    { val: "987654321", msg: "Enter a valid 10-digit mobile number" }, // 9 digits
    { val: "98765432109", msg: "Enter a valid 10-digit mobile number" }, // 11 digits
    { val: "", msg: "Enter a valid 10-digit mobile number" },
  ];

  invalidMobiles.forEach(({ val, msg }) => {
    assert.equal(GstValidators.isValidSignatoryMobile(val), false, `Should reject invalid mobile: "${val}"`);
    assert.equal(GstValidators.validateSignatoryMobile(val), msg);
  });
});

// ─── Flow & Integration ──────────────────────────────────────────────────────────────────────

test("Integration: whole-form submission blocks progression on any invalid signatory field", () => {
  // 1. Valid form passes completely
  const validResult = GstValidators.validateBusinessForm(VALID_SAMPLE_FORM);
  assert.deepEqual(validResult, {});

  // 2. Signatory Name with double spaces blocks submission
  const badNameResult = GstValidators.validateBusinessForm({
    ...VALID_SAMPLE_FORM,
    signatoryName: "Rajesh  Kumar",
  });
  assert.equal(badNameResult.signatoryName, "Use a single space between name parts.");

  // 3. Signatory PAN with non-P 4th char blocks submission
  const badPanResult = GstValidators.validateBusinessForm({
    ...VALID_SAMPLE_FORM,
    signatoryPan: "ABCCE1234F",
  });
  assert.equal(badPanResult.signatoryPan, "For an individual signatory, the fourth PAN character must be P.");

  // 4. DOB with today's date blocks submission
  const todayStr = formatDateDDMMYYYY(new Date());
  const badDobResult = GstValidators.validateBusinessForm({
    ...VALID_SAMPLE_FORM,
    signatoryDob: todayStr,
  });
  assert.equal(badDobResult.signatoryDob, "Date of birth must be earlier than today.");

  // 5. Designation with trailing space blocks submission
  const badDesigResult = GstValidators.validateBusinessForm({
    ...VALID_SAMPLE_FORM,
    signatoryDesignation: "Director ",
  });
  assert.equal(badDesigResult.signatoryDesignation, "Use a single space between words.");

  // 6. Dummy mobile number blocks submission
  const badMobileResult = GstValidators.validateBusinessForm({
    ...VALID_SAMPLE_FORM,
    signatoryMobile: "9999999999",
  });
  assert.equal(badMobileResult.signatoryMobile, "This mobile number is not allowed. Enter a different number.");

  // 7. Correcting all values clears errors and allows progression
  const correctedResult = GstValidators.validateBusinessForm(VALID_SAMPLE_FORM);
  assert.deepEqual(correctedResult, {});
});

test("Code Architecture: component GstBusinessStep preserves raw input for all signatory fields", () => {
  const filePath = path.resolve(__dirname, "../../modules/gst/gst-registration/components/GstBusinessStep/GstBusinessStep.tsx");
  const content = fs.readFileSync(filePath, "utf-8");

  const signatoryBlock = content.slice(content.indexOf('"signatoryName"'), content.indexOf("renderConsentSection"));

  // Check raw inputs are preserved without silent trim on blur
  assert.doesNotMatch(signatoryBlock, /"signatoryName"[^)]*onBlurOverride/);
  assert.doesNotMatch(signatoryBlock, /"signatoryDesignation"[^)]*onBlurOverride/);

  // Check mobile does not silently sanitize digits on input
  assert.doesNotMatch(signatoryBlock, /"signatoryMobile"[\s\S]*?transform:\s*sanitizeDigits/);

  // Check DOB specifies maximumDate: getYesterdayDate()
  assert.match(signatoryBlock, /"signatoryDob"[\s\S]*?maximumDate:\s*getYesterdayDate\(\)/);
});
