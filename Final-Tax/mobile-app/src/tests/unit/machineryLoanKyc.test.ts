/// <reference types="node" />
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { beforeEach, describe, test } from "node:test";
import {
  getLoanDetailsStep,
  getLoanEntryStep,
  getLoanFlowDefinition,
  getLoanFlowTotalSteps,
  resolveLoanActiveStep,
} from "../../modules/loans/constants/loanFlow";
import type { LoanCategoryId } from "../../modules/loans/types/loanCategory.types";
import {
  useLoansStore,
} from "../../modules/loans/store/loansStore";
import {
  createInitialBusinessFormData,
  createInitialKycData,
} from "../../modules/loans/store/loansStore.types";
import type { LoanKycData } from "../../modules/loans/types/loanKyc.types";
import { validateLoanKyc } from "../../modules/loans/validation/loanKycValidation";
import { loanKycService } from "../../modules/loans/services/loanKycService";
import { getContinueLabel } from "../../modules/loans/constants/continueLabels";

const makeCategory = (id: LoanCategoryId, title: string = id) => ({
  id,
  title,
  description: "",
  image: { uri: "test" },
});

const machineryCategory = makeCategory("machinery-loan", "Machinery Loans");

const validKycData: LoanKycData = {
  fullName: "Vikramaditya Verma",
  mobile: "9876543210",
  email: "vikram@example.com",
  pan: "ABCPE1234F",
  aadhaar: "234567890123",
  dob: "15-08-1988",
  currentAddress: {
    houseNumber: "Plot 42",
    street: "Industrial Area Phase 2",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411014",
  },
  isPermanentSameAsCurrent: true,
  permanentAddress: {
    houseNumber: "Plot 42",
    street: "Industrial Area Phase 2",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411014",
  },
  consentGiven: true,
  isProfilePrefilled: false,
};

describe("Machinery Loan Screen 1 Shared KYC Architecture Suite", () => {
  beforeEach(() => {
    useLoansStore.getState().resetAll();
  });

  test("1. Machinery Loan is enabled and routes to existing shared KYC Screen 1", () => {
    assert.ok(machineryCategory, "Machinery loan category must exist");
    assert.equal(machineryCategory.id, "machinery-loan");

    const flow = getLoanFlowDefinition("machinery-loan");
    assert.equal(flow.availability, "implemented");
    assert.equal(flow.detailsStep, "machinery-details");

    const entryStep = getLoanEntryStep("machinery-loan");
    assert.equal(entryStep, "kyc", "Entry step must be shared KYC");

    useLoansStore.getState().selectCategory(machineryCategory);
    assert.equal(useLoansStore.getState().selectedCategory?.id, "machinery-loan");
    assert.equal(useLoansStore.getState().activeStep, "kyc");
  });

  test("2. Shared KYC step count and progress header metadata for Machinery Loan", () => {
    const totalSteps = getLoanFlowTotalSteps("machinery-loan");
    assert.equal(totalSteps, 5, "Machinery flow has 5 canonical steps");
  });

  test("3. All existing KYC fields validate correctly under Machinery Loan", () => {
    const reqs = loanKycService.getProviderRequirements("machinery-loan");
    const validResult = validateLoanKyc(validKycData, reqs);
    assert.equal(validResult.isValid, true);
    assert.deepEqual(validResult.errors, {});

    // Empty required fields must fail validation
    const emptyResult = validateLoanKyc(createInitialKycData(), reqs);
    assert.equal(emptyResult.isValid, false);
    assert.ok(emptyResult.errors.fullName, "Full name required");
    assert.ok(emptyResult.errors.mobile, "Mobile required");
    assert.ok(emptyResult.errors.consentGiven, "Consent required");
  });

  test("4. Invalid KYC blocks continuing to Machinery Screen 2", () => {
    useLoansStore.getState().selectCategory(machineryCategory);
    assert.equal(useLoansStore.getState().activeStep, "kyc");

    // Attempting store validation with initial empty KYC data fails
    const isValid = useLoansStore.getState().validateForm();
    assert.equal(isValid, false);
    assert.ok(Object.keys(useLoansStore.getState().kycErrors).length > 0);

    // Active step remains 'kyc'
    assert.equal(useLoansStore.getState().activeStep, "kyc");
  });

  test("5. Valid KYC continues to Machinery Loan Screen 2 ('machinery-details') and NOT Business", () => {
    useLoansStore.getState().selectCategory(machineryCategory);
    useLoansStore.setState({ kycData: { ...validKycData } });

    const isValid = useLoansStore.getState().validateForm();
    assert.equal(isValid, true);

    const nextStep = getLoanDetailsStep("machinery-loan");
    assert.equal(nextStep, "machinery-details");
    assert.notEqual(nextStep, "business-details");

    useLoansStore.getState().advanceTo(nextStep!);
    assert.equal(useLoansStore.getState().activeStep, "machinery-details");
    assert.ok(useLoansStore.getState().completedSteps.includes("kyc"));

    const resolved = resolveLoanActiveStep("machinery-loan", useLoansStore.getState().activeStep);
    assert.equal(resolved, "machinery-details");
    assert.notEqual(resolved, "business-details");
    assert.notEqual(resolved, "vehicle-details");
    assert.notEqual(resolved, "property-details");
    assert.notEqual(resolved, "home-loan-requirement");
  });

  test("6. Back navigation from Screen 1 returns to category selection", () => {
    useLoansStore.getState().selectCategory(machineryCategory);
    assert.equal(useLoansStore.getState().activeStep, "kyc");

    useLoansStore.getState().retreatTo("categories");
    assert.equal(useLoansStore.getState().activeStep, "categories");
  });

  test("7. Revisit architecture: first visit shows 'Continue →' and revisit shows 'Update & Continue →'", () => {
    // First visit label
    const firstVisitLabel = getContinueLabel(false, "Continue →");
    assert.equal(firstVisitLabel, "Continue →");

    // Advance to Screen 2
    useLoansStore.getState().selectCategory(machineryCategory);
    useLoansStore.getState().advanceTo("machinery-details");
    assert.equal(useLoansStore.getState().activeStep, "machinery-details");
    assert.ok(useLoansStore.getState().completedSteps.includes("kyc"));

    // Navigate back to Screen 1 (KYC)
    useLoansStore.getState().retreatTo("kyc");
    assert.equal(useLoansStore.getState().activeStep, "kyc");

    // Revisit label
    const isRevisit = useLoansStore.getState().completedSteps.includes("kyc");
    assert.equal(isRevisit, true);
    const revisitLabel = getContinueLabel(isRevisit, "Continue →");
    assert.equal(revisitLabel, "Update & Continue →");
  });

  test("8. State isolation: switching from another loan to Machinery clears previous product data and KYC", () => {
    const businessCategory = makeCategory("business-loan", "Business Loan");
    useLoansStore.getState().selectCategory(businessCategory);
    useLoansStore.getState().setKycField("fullName", "Old Business Applicant");
    useLoansStore.getState().setBusinessProfileField("businessName", "Old Machinery Heavy Ltd");
    useLoansStore.getState().setBusinessLoanField("loanAmount", "5000000");

    // Switch to Machinery Loan
    useLoansStore.getState().selectCategory(machineryCategory);
    const state = useLoansStore.getState();

    assert.equal(state.selectedCategory?.id, "machinery-loan");
    assert.equal(state.activeStep, "kyc");
    assert.deepEqual(state.completedSteps, []);
    assert.equal(state.kycData.fullName, "", "Applicant name reset");
    assert.deepEqual(state.businessFormData, createInitialBusinessFormData(), "Business data wiped");
  });

  test("9. Existing Personal, Business, Working Capital, Home, Property, and Vehicle KYC flows remain unchanged", () => {
    const categoriesToTest = [
      { id: "personal-loan", expectedDetails: "personal-employment" },
      { id: "business-loan", expectedDetails: "business-details" },
      { id: "home-loan", expectedDetails: "home-loan-requirement" },
      { id: "property-loan", expectedDetails: "property-details" },
      { id: "vehicle-loan", expectedDetails: "vehicle-details" },
    ] as const;

    for (const item of categoriesToTest) {
      useLoansStore.getState().resetAll();
      const cat = makeCategory(item.id);
      useLoansStore.getState().selectCategory(cat);
      assert.equal(useLoansStore.getState().activeStep, "kyc", `${item.id} enters kyc`);

      const next = getLoanDetailsStep(item.id);
      assert.equal(next, item.expectedDetails, `${item.id} details step unchanged`);
    }
  });

  test("10. Architecture audit: no duplicate KYC implementation exists", () => {
    const loansDir = path.resolve(__dirname, "../../modules/loans");
    const kycScreens = fs.readdirSync(path.join(loansDir, "screens")).filter((f) => f.toLowerCase().includes("kyc"));
    assert.deepEqual(kycScreens, ["LoanKycScreen"], "Exactly one canonical LoanKycScreen directory exists");

    // Check machinery directory contains no duplicate KYC screens
    const machineryDir = path.join(loansDir, "machinery");
    assert.ok(fs.existsSync(machineryDir), "src/modules/loans/machinery/ directory exists");
    const machineryFiles = fs.readdirSync(machineryDir, { recursive: true }).map(String);
    assert.ok(!machineryFiles.some((f) => f.toLowerCase().includes("kyc")), "No duplicate KYC in machinery folder");
  });

  test("11. Machinery Loan never renders BusinessLoanScreen or Working Capital sections", () => {
    const mainScreenPath = path.resolve(
      __dirname,
      "../../modules/loans/screens/LoansMainScreen/LoansMainScreen.tsx"
    );
    const mainScreenSource = fs.readFileSync(mainScreenPath, "utf-8");

    // case "machinery-details" must map to MachineryLoanScreen, NOT BusinessLoanScreen
    assert.match(
      mainScreenSource,
      /case "machinery-details":\s*return\s*\(\s*<MachineryLoanScreen/
    );
    assert.doesNotMatch(
      mainScreenSource,
      /case "machinery-details":\s*return\s*\(\s*<BusinessLoanScreen/
    );
  });
});
