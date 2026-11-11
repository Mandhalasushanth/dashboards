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
import { LOAN_CATEGORIES, resolveLoanCategory } from "../../modules/loans/constants/loanCategories";
import { useLoansStore } from "../../modules/loans/store/loansStore";
import { createInitialKycData, createInitialBusinessFormData } from "../../modules/loans/store/loansStore.types";
import type { LoanKycData } from "../../modules/loans/types/loanKyc.types";
import { validateLoanKyc } from "../../modules/loans/validation/loanKycValidation";
import { loanKycService } from "../../modules/loans/services/loanKycService";
import { getContinueLabel, UPDATE_AND_CONTINUE_LABEL } from "../../modules/loans/constants/continueLabels";
import { useAuthStore } from "../../modules/authentication/store/authStore";

const msmeCategory = LOAN_CATEGORIES.find((c) => c.id === "msme-loan")!;

const validKycData: LoanKycData = {
  fullName: "Pooja Reddy",
  mobile: "9876543210",
  email: "pooja.reddy@example.com",
  pan: "ABCDE1234F",
  aadhaar: "123456789012",
  dob: "1992-04-18",
  currentAddress: {
    houseNumber: "Plot 88",
    street: "HITEC City Main Road",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500081",
  },
  isPermanentSameAsCurrent: true,
  permanentAddress: {
    houseNumber: "Plot 88",
    street: "HITEC City Main Road",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500081",
  },
  consentGiven: true,
  isProfilePrefilled: true,
  isProfileLocked: true,
};

describe("MSME Loan Screen 1 Implementation & KYC Verification Suite", () => {
  beforeEach(() => {
    useLoansStore.getState().resetAll();
    useAuthStore.setState({
      isLoggedIn: true,
      profileCompleted: true,
      isExistingUser: true,
      customerExists: true,
      customer: {
        customerId: "cust-msme-1",
        customerType: "Individual",
        name: "Pooja Reddy",
        mobile: "9876543210",
        email: "pooja.reddy@example.com",
        pan: "ABCDE1234F",
        aadhaar: "123456789012",
        dob: "1992-04-18",
        address: "Plot 88, HITEC City Main Road, Hyderabad, Telangana - 500081",
        profileCompleted: true,
      },
    });
  });

  test("1. Header: Title is 'MSME Loan', Step indicator is 'Step 1 of 5 • KYC Verification'", () => {
    assert.ok(msmeCategory, "MSME category must exist in LOAN_CATEGORIES");
    assert.equal(msmeCategory.title, "MSME Loan", "Category title must be 'MSME Loan'");

    const totalSteps = getLoanFlowTotalSteps("msme-loan");
    assert.equal(totalSteps, 5, "Total steps must be 5");

    const currentStep = 1;
    const subtitle = "KYC Verification";
    const stepIndicator = `Step ${currentStep} of ${totalSteps} • ${subtitle}`;
    assert.equal(stepIndicator, "Step 1 of 5 • KYC Verification");

    // Verify progress calculation is consistent (20%)
    const progressPercent = (currentStep / totalSteps) * 100;
    assert.equal(progressPercent, 20);
  });

  test("2. Entry routing: MSME Loan selects successfully and opens shared KYC Screen 1", () => {
    const resolved = resolveLoanCategory("msme-loan");
    assert.ok(resolved, "resolveLoanCategory must resolve 'msme-loan'");
    assert.equal(resolved?.category.id, "msme-loan");
    assert.equal(resolved?.category.title, "MSME Loan");

    const entryStep = getLoanEntryStep("msme-loan");
    assert.equal(entryStep, "kyc", "Entry step must be 'kyc'");

    const allowed = useLoansStore.getState().selectLoanProduct("msme-loan");
    assert.equal(allowed, true, "selectLoanProduct should succeed for complete profile");
    assert.equal(useLoansStore.getState().selectedCategory?.id, "msme-loan");
    assert.equal(useLoansStore.getState().activeStep, "kyc");
  });

  test("3. Profile Locking: Customer identity & address are locked and cannot be modified through store actions", () => {
    useLoansStore.getState().selectLoanProduct("msme-loan");
    useLoansStore.setState({
      kycData: { ...validKycData },
      isProfileLocked: true,
    });

    const stateBefore = useLoansStore.getState();
    assert.equal(stateBefore.isProfileLocked, true);
    assert.equal(stateBefore.kycData.fullName, "Pooja Reddy");
    assert.equal(stateBefore.kycData.currentAddress.city, "Hyderabad");

    // Attempt modification of customer details
    useLoansStore.getState().setKycField("fullName", "Hacked Name");
    useLoansStore.getState().setKycField("mobile", "9999999999");
    useLoansStore.getState().setKycField("email", "hacker@evil.com");
    useLoansStore.getState().setKycField("pan", "XYZPE9999Z");
    useLoansStore.getState().setKycField("dob", "2000-01-01");

    // Values must remain locked and unchanged
    const stateAfterKyc = useLoansStore.getState();
    assert.equal(stateAfterKyc.kycData.fullName, "Pooja Reddy");
    assert.equal(stateAfterKyc.kycData.mobile, "9876543210");
    assert.equal(stateAfterKyc.kycData.email, "pooja.reddy@example.com");
    assert.equal(stateAfterKyc.kycData.pan, "ABCDE1234F");
    assert.equal(stateAfterKyc.kycData.dob, "1992-04-18");

    // Attempt modification of address details
    useLoansStore.getState().setCurrentAddressField("city", "Mumbai");
    useLoansStore.getState().setCurrentAddressField("pincode", "400001");
    useLoansStore.getState().setCurrentAddressField("houseNumber", "New House");
    useLoansStore.getState().setCurrentAddressField("street", "New Street");
    useLoansStore.getState().setCurrentAddressField("state", "Maharashtra");

    const stateAfterAddr = useLoansStore.getState();
    assert.equal(stateAfterAddr.kycData.currentAddress.city, "Hyderabad");
    assert.equal(stateAfterAddr.kycData.currentAddress.pincode, "500081");
    assert.equal(stateAfterAddr.kycData.currentAddress.houseNumber, "Plot 88");
    assert.equal(stateAfterAddr.kycData.currentAddress.street, "HITEC City Main Road");
    assert.equal(stateAfterAddr.kycData.currentAddress.state, "Telangana");
  });

  test("4. IMPORTANT UI CHANGE: Green 'Details fetched from KYC' badge is absent from shared KYC components", () => {
    const modulesDir = path.resolve(__dirname, "../../modules/loans");
    const customerIdentityPath = path.join(modulesDir, "components/CustomerIdentitySection/CustomerIdentitySection.tsx");
    const customerIdentitySource = fs.readFileSync(customerIdentityPath, "utf-8");

    assert.doesNotMatch(customerIdentitySource, /Details fetched from KYC/i);
    assert.doesNotMatch(customerIdentitySource, /fetched from KYC/i);
    assert.doesNotMatch(customerIdentitySource, /kycBadge/);

    const addressSectionPath = path.join(modulesDir, "components/AddressSection/AddressSection.tsx");
    const addressSectionSource = fs.readFileSync(addressSectionPath, "utf-8");

    assert.doesNotMatch(addressSectionSource, /Details fetched from KYC/i);
    assert.doesNotMatch(addressSectionSource, /fetched from KYC/i);
    assert.doesNotMatch(addressSectionSource, /kycBadge/);

    // Lock icons and cards remain present
    assert.match(customerIdentitySource, /lock-closed/);
    assert.match(customerIdentitySource, /Verified Customer Details/);
    assert.match(addressSectionSource, /lock-closed/);
    assert.match(addressSectionSource, /Verified Address Details/);
  });

  test("5. Consent validation works: missing consent blocks continue, valid consent succeeds", () => {
    useLoansStore.getState().selectCategory(msmeCategory);
    useLoansStore.setState({
      kycData: {
        ...validKycData,
        consentGiven: false,
      },
    });

    const reqs = loanKycService.getProviderRequirements("msme-loan");
    const checkWithoutConsent = validateLoanKyc(useLoansStore.getState().kycData, reqs);
    assert.equal(checkWithoutConsent.isValid, false);
    assert.ok(checkWithoutConsent.errors.consentGiven, "Consent required");

    // Toggle consent on
    useLoansStore.getState().setConsent(true);
    assert.equal(useLoansStore.getState().kycData.consentGiven, true);

    const checkWithConsent = validateLoanKyc(useLoansStore.getState().kycData, reqs);
    assert.equal(checkWithConsent.isValid, true);
    assert.deepEqual(checkWithConsent.errors, {});
  });

  test("6. Continue advances specifically to MSME Screen 2 ('msme-details') and NOT Business or other loans", () => {
    useLoansStore.getState().selectCategory(msmeCategory);
    assert.equal(useLoansStore.getState().activeStep, "kyc");

    const flowDef = getLoanFlowDefinition("msme-loan");
    assert.equal(flowDef.availability, "implemented");
    assert.equal(flowDef.detailsStep, "msme-details");

    const nextStep = getLoanDetailsStep("msme-loan");
    assert.equal(nextStep, "msme-details");
    assert.notEqual(nextStep, "business-details");
    assert.notEqual(nextStep, "personal-employment");
    assert.notEqual(nextStep, "vehicle-details");
    assert.notEqual(nextStep, "machinery-details");

    useLoansStore.getState().advanceTo(nextStep!);
    assert.equal(useLoansStore.getState().activeStep, "msme-details");
    assert.ok(useLoansStore.getState().completedSteps.includes("kyc"));

    // Active step resolution under MSME category
    const resolved = resolveLoanActiveStep("msme-loan", useLoansStore.getState().activeStep);
    assert.equal(resolved, "msme-details");
  });

  test("7. Back navigation returns from Screen 1 to categories", () => {
    useLoansStore.getState().selectCategory(msmeCategory);
    assert.equal(useLoansStore.getState().activeStep, "kyc");

    useLoansStore.getState().retreatTo("categories");
    assert.equal(useLoansStore.getState().activeStep, "categories");
  });

  test("8. Revisit shows 'Update & Continue →' on return from Screen 2, first visit shows 'Continue →'", () => {
    // First visit
    useLoansStore.getState().selectCategory(msmeCategory);
    assert.equal(useLoansStore.getState().activeStep, "kyc");

    const isFirstVisitRevisit = useLoansStore.getState().completedSteps.includes("kyc");
    assert.equal(isFirstVisitRevisit, false);
    const firstVisitLabel = getContinueLabel(isFirstVisitRevisit, "Continue →");
    assert.equal(firstVisitLabel, "Continue →");

    // Advance to Screen 2
    useLoansStore.getState().advanceTo("msme-details");
    assert.equal(useLoansStore.getState().activeStep, "msme-details");
    assert.ok(useLoansStore.getState().completedSteps.includes("kyc"));

    // Retreat back to Screen 1 (KYC)
    useLoansStore.getState().retreatTo("kyc");
    assert.equal(useLoansStore.getState().activeStep, "kyc");

    // Revisit label
    const isRevisit = useLoansStore.getState().completedSteps.includes("kyc");
    assert.equal(isRevisit, true);
    const revisitLabel = getContinueLabel(isRevisit, "Continue →");
    assert.equal(revisitLabel, UPDATE_AND_CONTINUE_LABEL);
    assert.equal(revisitLabel, "Update & Continue →");
  });

  test("9. Switching from another loan to MSME clears previous product data and isolates steps", () => {
    const businessCategory = LOAN_CATEGORIES.find((c) => c.id === "business-loan")!;
    useLoansStore.getState().selectCategory(businessCategory);
    useLoansStore.getState().setKycField("fullName", "Old Business Applicant");
    useLoansStore.getState().setBusinessProfileField("businessName", "Old Enterprise Ltd");
    useLoansStore.getState().setBusinessLoanField("loanAmount", "5000000");
    useLoansStore.getState().advanceTo("business-details");

    assert.equal(useLoansStore.getState().activeStep, "business-details");
    assert.equal(useLoansStore.getState().selectedCategory?.id, "business-loan");

    // Switch to MSME Loan
    useLoansStore.getState().selectCategory(msmeCategory);
    const state = useLoansStore.getState();

    assert.equal(state.selectedCategory?.id, "msme-loan");
    assert.equal(state.activeStep, "kyc", "MSME must start at kyc, not stale business-details");
    assert.deepEqual(state.completedSteps, []);
    assert.deepEqual(state.businessFormData, createInitialBusinessFormData(), "Business data wiped");

    // Stale steps resolution check
    const staleBusiness = resolveLoanActiveStep("msme-loan", "business-details");
    assert.equal(staleBusiness, "kyc", "Stale business-details under MSME must resolve to kyc");

    const stalePersonal = resolveLoanActiveStep("msme-loan", "personal-employment");
    assert.equal(stalePersonal, "kyc", "Stale personal-employment under MSME must resolve to kyc");

    const staleVehicle = resolveLoanActiveStep("msme-loan", "vehicle-details");
    assert.equal(staleVehicle, "kyc", "Stale vehicle-details under MSME must resolve to kyc");

    const staleMachinery = resolveLoanActiveStep("msme-loan", "machinery-details");
    assert.equal(staleMachinery, "kyc", "Stale machinery-details under MSME must resolve to kyc");

    const staleProperty = resolveLoanActiveStep("msme-loan", "property-details");
    assert.equal(staleProperty, "kyc", "Stale property-details under MSME must resolve to kyc");

    const staleHome = resolveLoanActiveStep("msme-loan", "home-loan-requirement");
    assert.equal(staleHome, "kyc", "Stale home-loan-requirement under MSME must resolve to kyc");
  });

  test("10. Architecture audit: no duplicate KYC implementation exists", () => {
    const loansDir = path.resolve(__dirname, "../../modules/loans");
    const kycScreens = fs.readdirSync(path.join(loansDir, "screens")).filter((f) => f.toLowerCase().includes("kyc"));
    assert.deepEqual(kycScreens, ["LoanKycScreen"], "Exactly one canonical LoanKycScreen directory exists");

    // LoansMainScreen contains explicit msme-details step mapping and no fallback
    const mainScreenPath = path.join(loansDir, "screens/LoansMainScreen/LoansMainScreen.tsx");
    const mainScreenSource = fs.readFileSync(mainScreenPath, "utf-8");

    assert.match(
      mainScreenSource,
      /case "msme-details":\s*return\s*\(\s*<MsmeLoanScreen/
    );
    assert.doesNotMatch(
      mainScreenSource,
      /case "msme-details":\s*return\s*\(\s*<BusinessLoanScreen/
    );
  });
});
