/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";

import { GstValidators, isValidGstEmail } from "../../modules/gst/utils/gstValidators";

// ===============================================================================================
// Finsolz GST Registration — Email Validation Regression Tests
// ===============================================================================================

test("common and standard TLDs are accepted", () => {
  const commonCases = [
    "bhargavi@gmail.com",
    "user@company.in",
    "support@charity.org",
    "admin@network.net",
    "student@university.edu",
    "officer@agency.gov",
    "user.name+tag@gmail.com",
    "  bhargavi@gmail.com  ",
  ];

  commonCases.forEach((email) => {
    assert.equal(isValidGstEmail(email), true, `Expected valid: ${email}`);
    assert.equal(GstValidators.isValidEmail(email), true, `Expected GstValidators.isValidEmail: ${email}`);
    assert.equal(
      GstValidators.validateBusinessField("signatoryEmail", email),
      "",
      `Expected no error for signatoryEmail: ${email}`
    );
  });
});

test("multi-part domain TLDs (ccTLDs + SLDs) are accepted", () => {
  const multiPartCases = [
    "contact@finsolz.in",
    "officer@gst.gov.in",
    "info@sub.domain.co.uk",
    "support@bank.com.au",
    "help@service.org.uk",
    "admin@portal.net.in",
  ];

  multiPartCases.forEach((email) => {
    assert.equal(isValidGstEmail(email), true, `Expected valid multi-part domain: ${email}`);
    assert.equal(
      GstValidators.validateBusinessField("signatoryEmail", email),
      "",
      `Expected no error for multi-part: ${email}`
    );
  });
});

test("legitimate uncommon TLDs including .marketing, .ventures, .solutions, .company are accepted", () => {
  const uncommonCases = [
    "growth@agency.marketing",
    "partner@fund.ventures",
    "devops@infra.solutions",
    "info@enterprise.company",
    "founder@techcorp.io",
    "developer@startup.tech",
    "admin@aws.cloud",
    "mobile@product.app",
    "hello@brand.global",
    "consultant@tax.expert",
  ];

  uncommonCases.forEach((email) => {
    assert.equal(isValidGstEmail(email), true, `Expected valid uncommon TLD: ${email}`);
    assert.equal(
      GstValidators.validateBusinessField("signatoryEmail", email),
      "",
      `Expected no error for uncommon TLD: ${email}`
    );
  });
});

test("malformed suffixes (.comabc, .com123, .orgxyz, etc.) are strictly rejected", () => {
  const malformedSuffixCases: [string, string][] = [
    ["bhargavi@gmail.comabc", "Appended letters after .com"],
    ["bhargavi@gmail.com123", "Appended digits after .com"],
    ["admin@firm.orgxyz", "Appended letters after .org"],
    ["user@domain.netxyz", "Appended letters after .net"],
    ["user@domain.inabc", "Appended letters after .in"],
    ["bhargavi@gmail.comm", "Repeated final letter"],
    ["bhargavi@gmail.c", "Single-letter TLD"],
    ["bhargavi@gmail.co1", "Alphanumeric malformed TLD"],
  ];

  malformedSuffixCases.forEach(([email, reason]) => {
    assert.equal(isValidGstEmail(email), false, `Expected invalid (${reason}): ${email}`);
    assert.equal(GstValidators.isValidEmail(email), false, `Expected GstValidators invalid (${reason}): ${email}`);
    assert.equal(
      GstValidators.validateBusinessField("signatoryEmail", email),
      "Enter a valid email address",
      `Expected error message for reason: ${reason} (${email})`
    );
  });
});

test("undelegated 2-letter codes are strictly rejected", () => {
  const undelegatedCcTldCases = [
    "user@domain.zz",
    "user@domain.aa",
    "user@domain.ab",
    "user@domain.qq",
    "user@domain.an", // retired Netherlands Antilles
    "user@domain.cs", // retired Czechoslovakia
    "user@domain.tp", // retired East Timor
    "user@domain.yu", // retired Yugoslavia
  ];

  undelegatedCcTldCases.forEach((email) => {
    assert.equal(isValidGstEmail(email), false, `Expected undelegated ccTLD to fail: ${email}`);
    assert.equal(
      GstValidators.validateBusinessField("signatoryEmail", email),
      "Enter a valid email address",
      `Expected error for undelegated ccTLD: ${email}`
    );
  });
});

test("delegated Punycode TLDs are accepted while undelegated/bogus Punycode TLDs are rejected", () => {
  // Delegated IANA IDN root TLDs
  const validPunycode = [
    "user@domain.xn--h2brj9c", // .भारत (India - Devanagari)
    "user@domain.xn--mgbaam7a8h", // .امارات (UAE - Arabic)
    "user@domain.xn--clchc0ea0b2g2a9gcd", // .新加坡 (Singapore - Chinese)
  ];

  validPunycode.forEach((email) => {
    assert.equal(isValidGstEmail(email), true, `Expected delegated Punycode to pass: ${email}`);
  });

  // Undelegated or bogus Punycode TLDs that merely match /^xn--/ regex
  const invalidPunycode = [
    "user@domain.xn--boguspunycode",
    "user@domain.xn--randomtld",
    "user@domain.xn--12345",
    "user@domain.xn--abc",
  ];

  invalidPunycode.forEach((email) => {
    assert.equal(isValidGstEmail(email), false, `Expected undelegated Punycode to fail: ${email}`);
    assert.equal(
      GstValidators.validateBusinessField("signatoryEmail", email),
      "Enter a valid email address"
    );
  });
});

test("syntax boundaries and RFC 5322 malformations are strictly rejected", () => {
  const syntaxCases: [string, string][] = [
    ["", "Empty string"],
    ["   ", "Whitespace only"],
    ["plainaddress", "Missing @ and domain"],
    ["@gmail.com", "Missing local part"],
    ["bhargavi@", "Missing domain part"],
    ["bhargavi@@gmail.com", "Duplicate @"],
    ["bhargavi@gmail", "Missing domain dot"],
    ["bhargavi@.com", "Leading dot in domain"],
    ["bhargavi@gmail..com", "Consecutive dots in domain"],
    ["bhar..gavi@gmail.com", "Consecutive dots in local part"],
    [".bhargavi@gmail.com", "Leading dot in local part"],
    ["bhargavi.@gmail.com", "Trailing dot in local part"],
    ["bhargavi @gmail.com", "Space before @"],
    ["bhargavi@ gmail.com", "Space after @"],
    ["user name@gmail.com", "Space inside local part"],
    ["user@gm ail.com", "Space inside domain"],
  ];

  syntaxCases.forEach(([email, reason]) => {
    assert.equal(isValidGstEmail(email), false, `Expected invalid (${reason}): ${email}`);
  });
});

test("signatoryEmail validation during typing and blur correctly flags invalid values", () => {
  assert.equal(GstValidators.validateBusinessField("signatoryEmail", ""), "Enter a valid email address");
  assert.equal(GstValidators.validateBusinessField("signatoryEmail", "bhargavi@gmail"), "Enter a valid email address");
  assert.equal(GstValidators.validateBusinessField("signatoryEmail", "bhargavi@gmail.com"), "");
  assert.equal(GstValidators.validateBusinessField("signatoryEmail", "bhargavi@gmail.comabc"), "Enter a valid email address");
  assert.equal(GstValidators.validateBusinessField("signatoryEmail", "bhargavi@gmail.com"), "");
});

test("whole-form validation blocks progression when signatoryEmail is invalid and allows when valid", () => {
  const baseForm: Record<string, string> = {
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
    signatoryPan: "ABCDE1234F",
    signatoryDob: "12-05-1990",
    signatoryDesignation: "Proprietor",
    signatoryMobile: "9876543210",
    signatoryEmail: "bhargavi@gmail.comabc", // INVALID
    aadhaarConsent: "true",
  };

  const invalidErrors = GstValidators.validateBusinessForm(baseForm);
  assert.equal(
    invalidErrors.signatoryEmail,
    "Enter a valid email address",
    "Form progression must be blocked when email has invalid suffix"
  );

  const validForm = { ...baseForm, signatoryEmail: "bhargavi@gmail.com" };
  const validErrors = GstValidators.validateBusinessForm(validForm);
  assert.equal(validErrors.signatoryEmail, undefined, "Form progression must be permitted for valid email");

  const coInForm = { ...baseForm, signatoryEmail: "bhargavi@company.co.in" };
  const coInErrors = GstValidators.validateBusinessForm(coInForm);
  assert.equal(coInErrors.signatoryEmail, undefined, "Form progression must be permitted for .co.in email");
});

// ===============================================================================================
// Finsolz GST Registration — BUG-GST-REG-001 (Legal Name) & BUG-GST-REG-002 (Trade Name) Tests
// ===============================================================================================

test("Legal Name and Trade Name reject empty and whitespace-only input", () => {
  const whitespaceInputs = ["", "   ", "\t", "\n"];

  whitespaceInputs.forEach((input) => {
    assert.equal(GstValidators.isValidBusinessName(input), false);
    assert.equal(GstValidators.validateBusinessField("legalName", input), "Legal Name is required");
    assert.equal(GstValidators.validateBusinessField("businessName", input), "Business / Trade Name is required");
    assert.equal(GstValidators.validateBusinessField("registeredBusinessName", input), "Business / Trade Name is required");
  });
});

test("Legal Name and Trade Name reject single-character inputs (A, 1)", () => {
  const singleCharInputs = ["A", "Z", "1", "9", "a"];

  singleCharInputs.forEach((input) => {
    assert.equal(GstValidators.isValidBusinessName(input), false);
    assert.equal(GstValidators.validateBusinessField("legalName", input), "Legal Name must be at least 2 characters");
    assert.equal(GstValidators.validateBusinessField("businessName", input), "Trade Name must be at least 2 characters");
  });
});

test("Legal Name and Trade Name reject numeric-only inputs", () => {
  const numericOnlyInputs = ["12", "123", "12345", "999999", "00000"];

  numericOnlyInputs.forEach((input) => {
    assert.equal(GstValidators.isValidBusinessName(input), false);
    assert.equal(GstValidators.validateBusinessField("legalName", input), "Legal Name cannot contain numbers");
    assert.equal(GstValidators.validateBusinessField("businessName", input), "Trade Name cannot be purely numeric");
  });
});

test("Legal Name and Trade Name reject inputs exceeding 100 characters", () => {
  const valid100 = "A".repeat(100);
  const invalid101 = "A".repeat(101);

  assert.equal(GstValidators.isValidBusinessName(valid100), true);
  assert.equal(GstValidators.validateBusinessField("legalName", valid100), "");
  assert.equal(GstValidators.validateBusinessField("businessName", valid100), "");

  assert.equal(GstValidators.isValidBusinessName(invalid101), false);
  assert.equal(GstValidators.validateBusinessField("legalName", invalid101), "Legal Name cannot exceed 100 characters");
  assert.equal(GstValidators.validateBusinessField("businessName", invalid101), "Trade Name cannot exceed 100 characters");
});

test("Legal Name and Trade Name preserve legitimate short names such as HP, EY, and L&T", () => {
  const shortValidNames = ["HP", "EY"];

  shortValidNames.forEach((name) => {
    assert.equal(GstValidators.isValidBusinessName(name), true, `Expected valid: ${name}`);
    assert.equal(GstValidators.validateBusinessField("legalName", name), "", `Expected no error for legalName: ${name}`);
    assert.equal(GstValidators.validateBusinessField("businessName", name), "", `Expected no error for businessName: ${name}`);
  });

  // L&T contains & which Trade Name permits
  assert.equal(GstValidators.isValidBusinessName("L&T"), true);
  assert.equal(GstValidators.validateBusinessField("businessName", "L&T"), "");
});

test("Legal Name and Trade Name preserve legitimate multiword, alphanumeric, and punctuated names", () => {
  const legitimateNames = [
    "ABC Private Limited",
    "Shree Krishna Enterprises",
    "Café Coffee Day",
    "भारत Enterprises",
    "Apex Tech Solutions Pvt. Ltd.",
  ];

  legitimateNames.forEach((name) => {
    assert.equal(GstValidators.isValidBusinessName(name), true, `Expected valid: ${name}`);
    assert.equal(GstValidators.validateBusinessField("legalName", name), "", `Expected no error for legalName: ${name}`);
    assert.equal(GstValidators.validateBusinessField("businessName", name), "", `Expected no error for businessName: ${name}`);
  });

  // Trade Name preserves legitimate alphanumeric names; Legal Name rejects numbers
  const alphanumericNames = ["3M India Limited", "7-Eleven Stores"];
  alphanumericNames.forEach((name) => {
    assert.equal(GstValidators.isValidBusinessName(name), true);
    assert.equal(GstValidators.validateBusinessField("businessName", name), "");
    assert.equal(GstValidators.validateBusinessField("legalName", name), "Legal Name cannot contain numbers");
  });
});

test("Legal Name and Trade Name reject invalid formatting, emojis, and unsupported symbols", () => {
  const invalidCases = [
    " Acme",
    "Acme ",
    "Acme  Enterprises",
    "Acme @ Corp",
    "ABC 🚀 Corp",
  ];

  invalidCases.forEach((val) => {
    assert.equal(GstValidators.isValidBusinessName(val), false, `Expected invalid: ${val}`);
    assert.equal(GstValidators.validateBusinessField("legalName", val), "Enter a valid legal business name");
    assert.equal(GstValidators.validateBusinessField("businessName", val), "Enter a valid business or trade name");
  });

  // Symbol with number: Legal Name specifically rejects digits; Trade Name rejects invalid format
  assert.equal(GstValidators.validateBusinessField("businessName", "Acme #1"), "Enter a valid business or trade name");
  assert.equal(GstValidators.validateBusinessField("legalName", "Acme #1"), "Legal Name cannot contain numbers");
});

test("whole-form validation enforces Legal Name and Trade Name rules consistently", () => {
  const baseForm: Record<string, string> = {
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
    signatoryPan: "ABCDE1234F",
    signatoryDob: "12-05-1990",
    signatoryDesignation: "Proprietor",
    signatoryMobile: "9876543210",
    signatoryEmail: "bhargavi@gmail.com",
    aadhaarConsent: "true",
  };

  // Rejects single-character Legal Name
  const singleAlphaLegal = GstValidators.validateBusinessForm({ ...baseForm, legalName: "A" });
  assert.equal(singleAlphaLegal.legalName, "Legal Name must be at least 2 characters");

  // Rejects numeric-only Trade Name
  const numericTrade = GstValidators.validateBusinessForm({ ...baseForm, businessName: "12345" });
  assert.equal(numericTrade.businessName, "Trade Name cannot be purely numeric");

  // Rejects >100 character Legal Name
  const longLegal = GstValidators.validateBusinessForm({ ...baseForm, legalName: "A".repeat(101) });
  assert.equal(longLegal.legalName, "Legal Name cannot exceed 100 characters");

  // Allows legitimate short names in both fields
  const shortNamesForm = GstValidators.validateBusinessForm({
    ...baseForm,
    legalName: "HP",
    businessName: "L&T",
  });
  assert.equal(shortNamesForm.legalName, undefined);
  assert.equal(shortNamesForm.businessName, undefined);
});

