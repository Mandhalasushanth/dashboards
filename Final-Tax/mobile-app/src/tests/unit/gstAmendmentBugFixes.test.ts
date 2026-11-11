/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  validatePanNumber,
  validateAmendmentFieldValue,
  validateSectionForm,
} from "../../modules/gst/gst-amendment/utils/gstAmendmentValidation";
import { buildComparisonSummaries, buildDbReviewSummaries } from "../../modules/gst/gst-amendment/utils/gstAmendmentHelpers";
import { INITIAL_AMENDMENT_FORM_DATA } from "../../modules/gst/gst-amendment/types/gstAmendmentTypes";
import type { AmendmentFormData } from "../../modules/gst/gst-amendment/types/gstAmendmentTypes";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const blankForm = (): AmendmentFormData => ({ ...INITIAL_AMENDMENT_FORM_DATA });

const dobOffsetYears = (years: number): string => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + years);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}-${mm}-${d.getFullYear()}`;
};

// ─── TEST 1: Premises Proof not rendered in portal baseline card ──────────────

test("Test 1: GstCoreAmendmentEdit does not render Premises Proof in portal baseline card", () => {
  const filePath = path.resolve(
    __dirname,
    "../../modules/gst/gst-amendment/components/GstCoreAmendmentEdit/GstCoreAmendmentEdit.tsx"
  );
  const content = fs.readFileSync(filePath, "utf-8");

  // The "Premises Proof" label must not appear inside the currentRegisteredCard block
  const cardBlock = content.slice(
    content.indexOf("currentRegisteredCard"),
    content.indexOf("amendedDetailsCard")
  );
  assert.doesNotMatch(cardBlock, /Premises Proof/, "Premises Proof label must not appear in the portal baseline card");
  assert.doesNotMatch(cardBlock, /principalProofType/, "principalProofType must not be rendered in the portal baseline card");
});

// ─── TEST 2: Valid PAN is accepted ───────────────────────────────────────────

test("Test 2: Valid PAN is accepted", () => {
  const validPans = ["ABCPE1234F", "XYZPK5678Z", "AAAPA0001A", "ZZZPB9999Z"];
  validPans.forEach((pan) => {
    assert.equal(validatePanNumber(pan), null, `Expected valid PAN "${pan}" to pass`);
    assert.equal(validateAmendmentFieldValue("newSignatoryPan", pan, blankForm()), null);
  });
});

// ─── TEST 3: Invalid PAN is rejected ─────────────────────────────────────────

test("Test 3: Invalid PAN is rejected", () => {
  assert.ok(validatePanNumber("ABCPE123") !== null, "9-char PAN rejected");
  assert.ok(validatePanNumber("ABCPE1234FF") !== null, "11-char PAN rejected");
  assert.ok(validatePanNumber("ABCPE123AF") !== null, "letter in digit position rejected");
  assert.ok(validatePanNumber("ABCPE12345") !== null, "digit in final position rejected");
  assert.ok(validatePanNumber("123PE1234F") !== null, "digits in prefix rejected");
  assert.ok(validatePanNumber("ABCDE1234F") !== null, "invalid 4th char D rejected");
});

// ─── TEST 4: Emojis in PAN are rejected ──────────────────────────────────────

test("Test 4: Emojis in PAN are rejected", () => {
  const emojiPans = ["ABC🙂E1234F", "ABCPE12🎉4F", "😀BCPE1234F"];
  emojiPans.forEach((pan) => {
    const err = validateAmendmentFieldValue("newSignatoryPan", pan, blankForm());
    assert.ok(err !== null, `Expected emoji PAN "${pan}" to fail`);
    assert.match(err as string, /PAN/i);
  });
});

// ─── TEST 5: Special characters and spaces in PAN are rejected ───────────────

test("Test 5: Special characters and spaces in PAN are rejected", () => {
  const specialPans = ["ABCP E1234F", "ABCP.1234F ", "ABC@E1234F", "ABCPE 1234F"];
  specialPans.forEach((pan) => {
    const err = validatePanNumber(pan);
    assert.ok(err !== null, `Expected special-char PAN "${pan}" to fail`);
  });
});

// ─── TEST 6: PAN keyboard uses normal default keyboard ────────────────────────

test("Test 6: PAN keyboard uses consistent standard keyboard format", () => {
  const filePath = path.resolve(
    __dirname,
    "../../modules/gst/gst-amendment/components/GstNonCoreAmendmentEdit/GstNonCoreAmendmentEdit.tsx"
  );
  const content = fs.readFileSync(filePath, "utf-8");

  // Consistent keyboardType="default" and autoCapitalize="characters"
  assert.match(content, /keyboardType="default"/, "PAN input must use standard default keyboard");
  assert.match(content, /autoCapitalize="characters"/, "PAN input must auto-capitalize");
});

// ─── TEST 8: Valid 18+ DOB is accepted ───────────────────────────────────────

test("Test 8: Valid 18+ DOB is accepted", () => {
  const validDobs = ["15-08-1985", "01-01-1990", "28-02-2000", "31-03-1970"];
  validDobs.forEach((dob) => {
    const err = validateAmendmentFieldValue("newSignatoryDob", dob, blankForm());
    assert.equal(err, null, `Expected valid DOB "${dob}" to pass`);
  });
});

// ─── TEST 9: Under-18 DOB is rejected with user-friendly message ─────────────

test("Test 9: Under-18 DOB is rejected with user-friendly message", () => {
  const under18Dob = dobOffsetYears(-17);
  const err = validateAmendmentFieldValue("newSignatoryDob", under18Dob, blankForm());
  assert.ok(err !== null, "Under-18 DOB must be rejected");
  assert.equal(err, "You must be at least 18 years old.");
});

// ─── TEST 10: Future DOB is rejected ─────────────────────────────────────────

test("Test 10: Future DOB is rejected", () => {
  const futureDob = dobOffsetYears(1);
  const err = validateAmendmentFieldValue("newSignatoryDob", futureDob, blankForm());
  assert.ok(err !== null, "Future DOB must be rejected");
  assert.match(err as string, /future/i);
});

// ─── TEST 11: Invalid / impossible DOB is rejected ───────────────────────────

test("Test 11: Invalid / impossible DOB formats are rejected", () => {
  const invalidDobs = [
    "31-02-1990",   // impossible date
    "00-01-1990",   // day 0
    "01-13-1990",   // month 13
    "not-a-date",   // garbage
    "01011990",     // missing separators
    "2990-01-01",   // wrong order (YYYY-MM-DD not DD-MM-YYYY)
  ];
  invalidDobs.forEach((dob) => {
    const err = validateAmendmentFieldValue("newSignatoryDob", dob, blankForm());
    assert.ok(err !== null, `Expected invalid DOB "${dob}" to fail`);
  });
});

// ─── TEST 12: User-friendly PAN and DOB messages are returned ────────────────

test("Test 12: PAN and DOB errors are user-friendly (no regex, no internal names)", () => {
  // PAN empty
  const panEmpty = validateAmendmentFieldValue("newSignatoryPan", "", blankForm());
  assert.ok(panEmpty !== null && !/regex|field|undefined|TypeError/i.test(panEmpty));

  // PAN wrong length
  const panShort = validateAmendmentFieldValue("newSignatoryPan", "ABCPE123", blankForm());
  assert.ok(panShort !== null && !/regex|field|undefined|TypeError/i.test(panShort as string));
  assert.match(panShort as string, /10 characters/i);

  // PAN bad format
  const panBad = validateAmendmentFieldValue("newSignatoryPan", "ABCDE1234F", blankForm());
  assert.ok(panBad !== null && !/regex|field|undefined|TypeError/i.test(panBad as string));

  // DOB under-18
  const under18Dob = dobOffsetYears(-17);
  const dobUnder18 = validateAmendmentFieldValue("newSignatoryDob", under18Dob, blankForm());
  assert.equal(dobUnder18, "You must be at least 18 years old.");

  // DOB empty
  const dobEmpty = validateAmendmentFieldValue("newSignatoryDob", "", blankForm());
  assert.ok(dobEmpty !== null && !/regex|field|undefined|TypeError/i.test(dobEmpty as string));
});

// ─── TEST 13: DOB appears in review summary ──────────────────────────────────

test("Test 13: Authorised signatory DOB appears in comparison review summary", () => {
  const formData: AmendmentFormData = {
    ...blankForm(),
    newSignatoryName: "Rajesh Kumar",
    newSignatoryPan: "ABCPE1234F",
    newSignatoryDob: "15-08-1985",
    newSignatoryDesignation: "Director",
    newSignatoryMobile: "9876543210",
    newSignatoryEmail: "rajesh@example.com",
  };

  const registeredDetails = {
    legalBusinessName: "",
    principalAddress: "",
    principalCity: "",
    principalDistrict: "",
    principalState: "",
    principalPincode: "",
    principalProofType: "",
    additionalAddress: "",
    additionalCity: "",
    additionalPincode: "",
    additionalNatureOfPremises: "",
    bankName: "",
    bankAccountNumber: "",
    ifscCode: "",
    accountType: "",
    signatoryName: "",
    signatoryPan: "",
    signatoryDesignation: "",
    signatoryMobile: "",
    signatoryEmail: "",
    contactMobile: "",
    contactEmail: "",
  };

  const { requestedValDict } = buildComparisonSummaries("authorised-signatories", registeredDetails, formData);
  assert.ok("Date of Birth" in requestedValDict, "Date of Birth key must be present in requestedValDict");
  assert.equal(requestedValDict["Date of Birth"], "15-08-1985");
});

// ─── TEST 14: DOB survives Back → Edit → Review (db review path) ─────────────

test("Test 14: DOB survives Back→Edit→Review via dbReviewSummaries", () => {
  const formData: AmendmentFormData = {
    ...blankForm(),
    newSignatoryDob: "10-05-1990",
  };

  const dbData = {
    newSignatoryName: "Updated Name",
    newSignatoryPan: "XYZPK5678Z",
    newSignatoryDob: "10-05-1990",
    newDesignation: "Manager",
    newSignatoryMobile: "9123456789",
    newSignatoryEmail: "updated@example.com",
  };

  const dict = buildDbReviewSummaries("authorised-signatories", {} as any, dbData, formData);
  assert.ok("Date of Birth" in dict, "Date of Birth must appear in db review summary");
  assert.equal(dict["Date of Birth"], "10-05-1990");

  // When db data is missing DOB, falls back to formData
  const dbDataNoDob = { ...dbData, newSignatoryDob: undefined };
  const dictFallback = buildDbReviewSummaries("authorised-signatories", {} as any, dbDataNoDob, formData);
  assert.equal(dictFallback["Date of Birth"], "10-05-1990", "Should fall back to formData.newSignatoryDob");
});

// ─── TEST 15: Other GST Amendment sections remain unaffected ─────────────────

test("Test 15: GST Amendment sections other than authorised-signatories are unaffected", () => {
  const formData: AmendmentFormData = {
    ...blankForm(),
    newPrincipalAddress: "123 Main Street",
    newPrincipalCity: "Mumbai",
    newPrincipalDistrict: "Mumbai Suburban",
    newPrincipalState: "Maharashtra",
    newPrincipalPincode: "400001",
    newPrincipalNatureOfPremises: "Own",
  };

  const registeredDetails = {
    legalBusinessName: "Test Co",
    principalAddress: "Old Address",
    principalCity: "Delhi",
    principalDistrict: "Central Delhi",
    principalState: "Delhi",
    principalPincode: "110001",
    principalProofType: "Electricity Bill",
    additionalAddress: "",
    additionalCity: "",
    additionalPincode: "",
    additionalNatureOfPremises: "",
    bankName: "",
    bankAccountNumber: "",
    ifscCode: "",
    accountType: "",
    signatoryName: "",
    signatoryPan: "",
    signatoryDesignation: "",
    signatoryMobile: "",
    signatoryEmail: "",
    contactMobile: "",
    contactEmail: "",
  };

  const { requestedValDict } = buildComparisonSummaries("principal-place", registeredDetails, formData);

  // Principal place summary must not include Premises Proof from registered card
  assert.ok("Business Address" in requestedValDict, "Business Address must be in principal-place summary");
  // The NEW form still has Nature of Premises field (this is in the amended form, not the registered card)
  assert.ok("Nature of Premises" in requestedValDict, "Nature of Premises must be in principal-place requested summary");

  // Bank accounts section not affected
  const bankForm: AmendmentFormData = {
    ...blankForm(),
    newBankName: "HDFC Bank",
    newBankAccountNumber: "123456789012",
    confirmBankAccountNumber: "123456789012",
    newIfscCode: "HDFC0001234",
    newAccountType: "Current",
  };
  const { requestedValDict: bankDict } = buildComparisonSummaries("bank-accounts", registeredDetails, bankForm);
  assert.ok("Bank Name" in bankDict, "Bank Name must appear in bank-accounts summary");
  assert.ok("Account Number" in bankDict);
});

