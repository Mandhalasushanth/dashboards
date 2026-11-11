/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";

import { getInitialDraft } from "../../modules/company-registration/store/initialDraft";
import {
  isOpcCompanyType,
  isPublicCompanyType,
  getMinRequiredPromoters,
} from "../../modules/company-registration/validation/companySchema";
import { validateRegistrationStep } from "../../modules/company-registration/validation/companyStepValidation";
import type { DirectorInfo, OpcNomineeInfo } from "../../modules/company-registration/types/director.types";

const createValidDirector = (id = "dir-1"): DirectorInfo => ({
  id,
  name: "Vikram Malhotra",
  pan: "ABCPE1234F",
  dob: "15-08-1985",
  fatherName: "Rajesh Malhotra",
  gender: "Male",
  nationality: "Indian",
  occupation: "Business",
  educationalQualification: "Post Graduate",
  designation: "Director",
  category: "General",
  email: "vikram@example.com",
  phone: "9876543210",
  isResidentInIndia: true,
  sameAsPermanentAddress: true,
  numberOfShares: 1000,
  amountSubscribed: 10000,
});

const createValidNominee = (): OpcNomineeInfo => ({
  name: "Pooja Malhotra",
  pan: "BCDPF2345G",
  relationship: "Spouse",
  email: "pooja@example.com",
  phone: "9876543211",
  aadhaar: "123456789012",
});

test("OPC company type identification recognizes standard and variant strings", () => {
  assert.equal(isOpcCompanyType("One Person Company (OPC)"), true);
  assert.equal(isOpcCompanyType("One Person Company"), true);
  assert.equal(isOpcCompanyType("OPC"), true);
  assert.equal(isOpcCompanyType("one person company (opc)"), true);
  assert.equal(isOpcCompanyType("One Person Company (OPC) "), true);

  assert.equal(isOpcCompanyType("Private Limited"), false);
  assert.equal(isOpcCompanyType("Public Limited"), false);
  assert.equal(isOpcCompanyType("Limited Liability Partnership (LLP)"), false);
  assert.equal(isOpcCompanyType("Section 8 (NGO)"), false);
  assert.equal(isOpcCompanyType(""), false);
  assert.equal(isOpcCompanyType(undefined), false);
});

test("getMinRequiredPromoters returns verified statutory minimums", () => {
  assert.equal(getMinRequiredPromoters("One Person Company (OPC)"), 1);
  assert.equal(getMinRequiredPromoters("One Person Company"), 1);
  assert.equal(getMinRequiredPromoters("OPC"), 1);
  assert.equal(getMinRequiredPromoters("Private Limited"), 2);
  assert.equal(getMinRequiredPromoters("Limited Liability Partnership (LLP)"), 2);
  assert.equal(getMinRequiredPromoters("Section 8 (NGO)"), 2);
  assert.equal(getMinRequiredPromoters("Public Limited"), 3);
  assert.equal(getMinRequiredPromoters(undefined), 2);
});

test("OPC flow: valid nominee proceeds without requiring a promoter/director entry", () => {
  const opcVariants = [
    "One Person Company (OPC)",
    "One Person Company",
    "OPC",
  ] as const;

  opcVariants.forEach((variant) => {
    const draft = getInitialDraft();
    draft.company.companyType = variant as any;
    draft.directors = [];
    draft.opcNominee = createValidNominee();

    const result = validateRegistrationStep(3, draft);
    assert.equal(result.valid, true, `Variant "${variant}" must be valid with 0 promoters and 1 nominee`);
    assert.deepEqual(result.fieldErrors, {}, `Variant "${variant}" must not have validation errors`);
    assert.equal(result.fieldErrors.directorsCount, undefined, "Must not demand a promoter");
  });
});

test("OPC flow: 0 promoters does not trigger promoter count error when nominee is valid", () => {
  const draft = getInitialDraft();
  draft.company.companyType = "One Person Company (OPC)";
  draft.directors = [];
  draft.opcNominee = createValidNominee();

  const result = validateRegistrationStep(3, draft);
  assert.equal(result.valid, true);
  assert.equal(result.fieldErrors.directorsCount, undefined);
});

test("OPC flow: missing or invalid nominee mandatory data triggers field-level errors without demanding promoters", () => {
  const baseDraft = getInitialDraft();
  baseDraft.company.companyType = "One Person Company (OPC)";
  baseDraft.directors = [];

  // Missing Nominee Name
  const missingName = { ...baseDraft, opcNominee: { ...createValidNominee(), name: "" } };
  const rName = validateRegistrationStep(3, missingName);
  assert.equal(rName.valid, false);
  assert.ok(rName.fieldErrors.nominee_name, "Nominee name error expected");
  assert.equal(rName.fieldErrors.directorsCount, undefined);

  // Invalid Nominee PAN
  const invalidPan = { ...baseDraft, opcNominee: { ...createValidNominee(), pan: "INVALIDPAN" } };
  const rPan = validateRegistrationStep(3, invalidPan);
  assert.equal(rPan.valid, false);
  assert.ok(rPan.fieldErrors.nominee_pan, "Nominee PAN error expected");
  assert.equal(rPan.fieldErrors.directorsCount, undefined);

  // Invalid Nominee Email
  const invalidEmail = { ...baseDraft, opcNominee: { ...createValidNominee(), email: "invalid-email" } };
  const rEmail = validateRegistrationStep(3, invalidEmail);
  assert.equal(rEmail.valid, false);
  assert.ok(rEmail.fieldErrors.nominee_email, "Nominee email error expected");
  assert.equal(rEmail.fieldErrors.directorsCount, undefined);

  // Invalid Nominee Mobile
  const invalidMobile = { ...baseDraft, opcNominee: { ...createValidNominee(), phone: "12345" } };
  const rPhone = validateRegistrationStep(3, invalidMobile);
  assert.equal(rPhone.valid, false);
  assert.ok(rPhone.fieldErrors.nominee_phone, "Nominee phone error expected");
  assert.equal(rPhone.fieldErrors.directorsCount, undefined);
});

test("OPC flow: optional nominee Aadhaar remains optional", () => {
  const draft = getInitialDraft();
  draft.company.companyType = "One Person Company (OPC)";
  draft.directors = [];
  const noAadhaar = createValidNominee();
  delete (noAadhaar as any).aadhaar;
  draft.opcNominee = noAadhaar;

  const result = validateRegistrationStep(3, draft);
  assert.equal(result.valid, true);
  assert.deepEqual(result.fieldErrors, {});

  // Invalid Aadhaar (wrong length) triggers error
  const invalidAadhaarDraft = {
    ...draft,
    opcNominee: { ...createValidNominee(), aadhaar: "1234" },
  };
  const rInvalidAadhaar = validateRegistrationStep(3, invalidAadhaarDraft);
  assert.equal(rInvalidAadhaar.valid, false);
  assert.ok(rInvalidAadhaar.fieldErrors.nominee_aadhaar);
});

test("OPC state: exactly one nominee is configured, nominee remains separate and preserved across step navigation", () => {
  const draft = getInitialDraft();
  draft.company.companyType = "One Person Company (OPC)";
  const nomineeData = createValidNominee();

  draft.directors = [];
  draft.opcNominee = nomineeData;
  draft.currentStep = 3;

  // Exactly one nominee section data exists and no promoters fabricated
  assert.equal(draft.directors.length, 0);
  assert.deepEqual(draft.opcNominee, nomineeData);

  // Navigate forward to Step 4
  const step4Draft = { ...draft, currentStep: 4, company: { ...draft.company, authorizedCapital: 100000, faceValuePerShare: 10 } };
  assert.equal(step4Draft.currentStep, 4);
  assert.deepEqual(step4Draft.opcNominee, nomineeData);
  assert.equal(step4Draft.directors.length, 0);

  // Step 4 (Capital & Shareholding) validates without crashing on 0 directors
  const step4Result = validateRegistrationStep(4, step4Draft);
  assert.equal(step4Result.valid, true);

  // Navigate backward to Step 3
  const step3Draft = { ...step4Draft, currentStep: 3 };
  assert.equal(step3Draft.currentStep, 3);
  assert.deepEqual(step3Draft.opcNominee, nomineeData);
  assert.equal(step3Draft.directors.length, 0);

  // Step 3 remains valid with the single nominee and 0 promoters
  const result = validateRegistrationStep(3, step3Draft);
  assert.equal(result.valid, true);
  assert.deepEqual(result.fieldErrors, {});
});

test("Private Limited: retains existing minimum 2 promoters requirement", () => {
  const draft = getInitialDraft();
  draft.company.companyType = "Private Limited";

  // 0 promoters
  draft.directors = [];
  const r0 = validateRegistrationStep(3, draft);
  assert.equal(r0.valid, false);
  assert.match(r0.fieldErrors.directorsCount, /At least 2 promoter/);

  // 1 promoter
  draft.directors = [createValidDirector("dir-1")];
  const r1 = validateRegistrationStep(3, draft);
  assert.equal(r1.valid, false);
  assert.match(r1.fieldErrors.directorsCount, /At least 2 promoter/);

  // 2 valid promoters
  draft.directors = [
    createValidDirector("dir-1"),
    createValidDirector("dir-2"),
  ];
  const r2 = validateRegistrationStep(3, draft);
  assert.equal(r2.valid, true);
  assert.deepEqual(r2.fieldErrors, {});
});

test("Public Limited and LLP: retain existing promoter/partner requirements", () => {
  const draft = getInitialDraft();

  // Public Limited requires at least 3
  draft.company.companyType = "Public Limited";
  draft.directors = [createValidDirector("dir-1"), createValidDirector("dir-2")];
  const rPub = validateRegistrationStep(3, draft);
  assert.equal(rPub.valid, false);
  assert.match(rPub.fieldErrors.directorsCount, /At least 3 promoter/);

  draft.directors.push(createValidDirector("dir-3"));
  const rPubValid = validateRegistrationStep(3, draft);
  assert.equal(rPubValid.valid, true);

  // LLP requires at least 2
  draft.company.companyType = "Limited Liability Partnership (LLP)";
  draft.directors = [createValidDirector("dir-1")];
  const rLlp = validateRegistrationStep(3, draft);
  assert.equal(rLlp.valid, false);
  assert.match(rLlp.fieldErrors.directorsCount, /At least 2 promoter/);
});
