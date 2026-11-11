/// <reference types="node" />
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test, describe, beforeEach } from "node:test";
import { loanKycService } from "../../modules/loans/services/loanKycService";
import { validateLoanKyc } from "../../modules/loans/validation/loanKycValidation";
import { getLoanFlowTotalSteps } from "../../modules/loans/constants/loanFlow";
import { useLoansStore } from "../../modules/loans/store/loansStore";
import { createInitialKycData } from "../../modules/loans/store/loansStore.types";
import type { LoanKycData } from "../../modules/loans/types/loanKyc.types";

const address = {
  houseNumber: "12-3",
  street: "MG Road",
  city: "Hyderabad",
  state: "Telangana",
  pincode: "500001",
};

const personalKyc = (): LoanKycData => ({
  ...createInitialKycData(),
  fullName: "Anita Rao",
  mobile: "9876543210",
  dob: "15-08-1990",
  pan: "ABCPE1234F",
  currentAddress: address,
  consentGiven: true,
});

const personalCategory = {
  id: "personal-loan" as const,
  title: "Personal Loan",
  description: "Personal",
  image: { uri: "test" },
};

describe("common KYC for personal loans", () => {
  beforeEach(() => useLoansStore.getState().resetAll());

  test("personal loans require DOB and PAN, not Aadhaar or email", () => {
    const reqs = loanKycService.getProviderRequirements("personal-loan");
    assert.equal(reqs.requireDob, true);
    assert.equal(reqs.requirePan, true);
    assert.equal(reqs.requireAadhaar, false);
    assert.equal(reqs.showAadhaar, false);
    assert.equal(reqs.requireEmail, false);
  });

  test("business loan requirements are unchanged", () => {
    const reqs = loanKycService.getProviderRequirements("business-loan");
    assert.deepEqual(reqs, loanKycService.getProviderRequirements());
    assert.equal(reqs.requirePan, false);
    assert.equal(reqs.requireDob, false);
  });

  test("a complete personal KYC is valid without Aadhaar or email", () => {
    const reqs = loanKycService.getProviderRequirements("personal-loan");
    assert.equal(validateLoanKyc(personalKyc(), reqs).isValid, true);
  });

  test("PAN, date of birth and consent are enforced for personal loans", () => {
    const reqs = loanKycService.getProviderRequirements("personal-loan");
    const { errors } = validateLoanKyc(
      { ...personalKyc(), pan: "", dob: "", consentGiven: false },
      reqs
    );
    assert.ok(errors.pan);
    assert.ok(errors.dob);
    assert.ok(errors.consentGiven);
  });

  test("the store validates with the selected category's requirements", () => {
    const store = useLoansStore.getState();
    store.selectCategory(personalCategory);
    store.setKycField("fullName", "Anita Rao");
    store.setKycField("mobile", "9876543210");
    store.setCurrentAddressField("houseNumber", "12-3");
    store.setCurrentAddressField("street", "MG Road");
    store.setCurrentAddressField("city", "Hyderabad");
    store.setCurrentAddressField("state", "Telangana");
    store.setCurrentAddressField("pincode", "500001");
    store.setConsent(true);
    assert.equal(useLoansStore.getState().validateForm(), false);
    assert.ok(useLoansStore.getState().kycErrors.pan);
    assert.ok(useLoansStore.getState().kycErrors.dob);
  });

  test("personal flow continues to Employment & Income and edit returns to review", () => {
    const store = useLoansStore.getState();
    store.selectCategory(personalCategory);
    assert.equal(useLoansStore.getState().activeStep, "kyc");
    useLoansStore.getState().advanceTo("personal-employment");
    assert.equal(useLoansStore.getState().activeStep, "personal-employment");

    useLoansStore.getState().editFromReview("kyc");
    useLoansStore.getState().advanceTo("personal-employment");
    assert.equal(useLoansStore.getState().activeStep, "review");
    assert.equal(useLoansStore.getState().returnToReview, false);
  });

  test("flow length is 5 for personal and 5 for business", () => {
    assert.equal(getLoanFlowTotalSteps("personal-loan"), 5);
    assert.equal(getLoanFlowTotalSteps("business-loan"), 5);
  });

  test("one KYC screen serves both loans and asks nothing credit-related", () => {
    const root = path.join(process.cwd(), "src/modules/loans");
    const screens = fs.readdirSync(path.join(root, "screens"));
    assert.equal(screens.filter((name) => /kyc/i.test(name)).length, 1);
    const kycSources = [
      "screens/LoanKycScreen/LoanKycScreen.tsx",
      "components/CustomerIdentitySection/CustomerIdentitySection.tsx",
      "components/AddressSection/AddressSection.tsx",
    ]
      .map((file) => fs.readFileSync(path.join(root, file), "utf8"))
      .join(" ");
    assert.ok(!/cibil|credit score|existing loan|emi/i.test(kycSources));
  });

  test("submitting KYC returns truthful pending provider status and never fakes verified", async () => {
    const result = await loanKycService.submitKycVerification(personalKyc());
    assert.equal(result.success, true);
    assert.equal(result.status, "pending");
    assert.notEqual(result.status, "verified");
  });

  test("KYC screen uses the common first-visit label and Update & Continue on revisit", () => {
    const screenPath = path.join(
      process.cwd(),
      "src/modules/loans/screens/LoanKycScreen/LoanKycScreen.tsx"
    );
    const screenSource = fs.readFileSync(screenPath, "utf8");
    assert.ok(screenSource.includes('getContinueLabel(isUpdate, "Continue →")'));
    assert.ok(!screenSource.includes("Continue to Employment & Income"));
    assert.ok(!screenSource.includes("Continue to Business Details"));
    assert.ok(screenSource.includes("isEditMode || isRevisit"));
  });
});
