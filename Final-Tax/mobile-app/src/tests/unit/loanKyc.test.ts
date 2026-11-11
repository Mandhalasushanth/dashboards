/// <reference types="node" />
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test, describe } from "node:test";
import {
  validateLoanKyc,
  isApplicantAdult,
} from "../../modules/loans/validation/loanKycValidation";
import { useLoansStore } from "../../modules/loans/store/loansStore";
import { getLoanEntryStep } from "../../modules/loans/constants/loanFlow";
import type { LoanCategory } from "../../modules/loans/types/loanCategory.types";
import type { LoanKycData } from "../../modules/loans/types/loanKyc.types";

const TEST_CATEGORIES: LoanCategory[] = [
  {
    id: "business-loan",
    title: "Business & Working Capital Loans",
    description: "Grow your business with flexible financing options.",
    image: { uri: "mock-business-loan" } as any,
  },
  {
    id: "personal-loan",
    title: "Personal Loan",
    description: "Meet your personal needs with quick financial support.",
    image: { uri: "mock-personal-loan" } as any,
  },
  {
    id: "home-loan",
    title: "Home Loan",
    description: "Make your dream home a reality with flexible options.",
    image: { uri: "mock-home-loan" } as any,
  },
  {
    id: "property-loan",
    title: "Property Loan",
    description: "Unlock the value of your property for financial needs.",
    image: { uri: "mock-property-loan" } as any,
  },
  {
    id: "vehicle-loan",
    title: "Vehicle Loan",
    description: "Finance your vehicle with easy loan options.",
    image: { uri: "mock-vehicle-loan" } as any,
  },
  {
    id: "machinery-loan",
    title: "Machinery Loans",
    description: "Get loans for machinery and equipment.",
    image: { uri: "mock-machinery-loan" } as any,
  },
  {
    id: "msme-loan",
    title: "MSME Loans",
    description: "Support for small and medium enterprises.",
    image: { uri: "mock-msme-loan" } as any,
  },
  {
    id: "project-finance",
    title: "Project Finance",
    description: "Funding for large projects and infrastructure.",
    image: { uri: "mock-project-finance" } as any,
  },
];

describe("Loan KYC Common Verification Suite", () => {
  const validKycData: LoanKycData = {
    fullName: "Prakash Sharma",
    mobile: "9876543210",
    email: "prakash.sharma@example.com",
    pan: "ABCPE1234F",
    aadhaar: "234567890123",
    dob: "15-08-1990",
    currentAddress: {
      houseNumber: "Flat 204",
      street: "Road No 10, Banjara Hills",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500034",
    },
    isPermanentSameAsCurrent: true,
    permanentAddress: {
      houseNumber: "Flat 204",
      street: "Road No 10, Banjara Hills",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500034",
    },
    consentGiven: true,
    isProfilePrefilled: false,
  };


  test("implemented loan categories enter KYC and unimplemented products are unavailable", () => {
    assert.equal(TEST_CATEGORIES.length, 8);

    TEST_CATEGORIES.forEach((category) => {
      useLoansStore.getState().resetAll();
      useLoansStore.getState().selectCategory(category);

      assert.equal(useLoansStore.getState().selectedCategory?.id, category.id);
      assert.equal(
        useLoansStore.getState().activeStep,
        getLoanEntryStep(category.id)
      );
    });
  });

  test("Valid KYC data passes validation without any errors", () => {
    const result = validateLoanKyc(validKycData);
    assert.equal(result.isValid, true);
    assert.equal(Object.keys(result.errors).length, 0);
  });

  test("Rejects a state value that is not one of the offered Indian states or UTs", () => {
    const result = validateLoanKyc({
      ...validKycData,
      currentAddress: { ...validKycData.currentAddress, state: "Atlantis" },
    });
    assert.equal(result.isValid, false);
    assert.match(result.errors["currentAddress.state"] ?? "", /valid state/);
  });

  test("Requires 18+ age validation for applicants", () => {
    assert.equal(isApplicantAdult("15-08-1990"), true);
    assert.equal(isApplicantAdult("01-01-2015"), false);

    const minorData: LoanKycData = {
      ...validKycData,
      dob: "01-01-2015",
    };
    const result = validateLoanKyc(minorData);
    assert.equal(result.isValid, false);
    assert.ok(result.errors.dob?.includes("18 years"));
  });

  test("Validates PAN format strictly", () => {
    const invalidPanData: LoanKycData = {
      ...validKycData,
      pan: "INVALIDPAN",
    };
    const result = validateLoanKyc(invalidPanData);
    assert.equal(result.isValid, false);
    assert.ok(result.errors.pan);
  });

  test("Validates 10-digit mobile number", () => {
    const invalidPhoneData: LoanKycData = {
      ...validKycData,
      mobile: "12345",
    };
    const result = validateLoanKyc(invalidPhoneData);
    assert.equal(result.isValid, false);
    assert.ok(result.errors.mobile);
  });

  test("Validates PIN code format", () => {
    const invalidPinData: LoanKycData = {
      ...validKycData,
      currentAddress: {
        ...validKycData.currentAddress,
        pincode: "123",
      },
    };
    const result = validateLoanKyc(invalidPinData);
    assert.equal(result.isValid, false);
    assert.ok(result.errors["currentAddress.pincode"]);
  });

  test("Enforces permanent address validation when isPermanentSameAsCurrent is false", () => {
    const differentAddressData: LoanKycData = {
      ...validKycData,
      isPermanentSameAsCurrent: false,
      permanentAddress: {
        houseNumber: "",
        street: "",
        city: "",
        state: "",
        pincode: "",
      },
    };
    const result = validateLoanKyc(differentAddressData);
    assert.equal(result.isValid, false);
    assert.ok(result.errors["permanentAddress.houseNumber"]);
    assert.ok(result.errors["permanentAddress.street"]);
    assert.ok(result.errors["permanentAddress.city"]);
    assert.ok(result.errors["permanentAddress.state"]);
    assert.ok(result.errors["permanentAddress.pincode"]);
  });

  test("Enforces DPDP & KYC consent requirement", () => {
    const noConsentData: LoanKycData = {
      ...validKycData,
      consentGiven: false,
    };
    const result = validateLoanKyc(noConsentData);
    assert.equal(result.isValid, false);
    assert.ok(result.errors.consentGiven);
  });

  test("useLoansStore preserves selectedCategory and kycData across step transitions", () => {
    const businessCategory = TEST_CATEGORIES[0];
    useLoansStore.getState().resetAll();

    // Select category
    useLoansStore.getState().selectCategory(businessCategory);
    assert.equal(useLoansStore.getState().selectedCategory?.id, "business-loan");
    assert.equal(useLoansStore.getState().activeStep, "kyc");

    // Populate data
    useLoansStore.getState().setKycField("fullName", "Srinivas Rao");
    useLoansStore.getState().setKycField("pan", "ABCPE1234F");
    useLoansStore.getState().setCurrentAddressField("city", "Bengaluru");

    assert.equal(useLoansStore.getState().kycData.fullName, "Srinivas Rao");
    assert.equal(useLoansStore.getState().kycData.pan, "ABCPE1234F");
    assert.equal(useLoansStore.getState().kycData.currentAddress.city, "Bengaluru");

    // Navigate back to categories
    useLoansStore.getState().setActiveStep("categories");
    assert.equal(useLoansStore.getState().activeStep, "categories");

    // Category and entered data remain preserved
    assert.equal(useLoansStore.getState().selectedCategory?.id, "business-loan");
    assert.equal(useLoansStore.getState().kycData.fullName, "Srinivas Rao");

    // Re-enter KYC
    useLoansStore.getState().setActiveStep("kyc");
    assert.equal(useLoansStore.getState().kycData.currentAddress.city, "Bengaluru");
  });

  test("Profile data is prefilled but never automatically treated as verified identity", () => {
    useLoansStore.getState().resetAll();
    assert.equal(useLoansStore.getState().kycStatus, "not_connected");

    // Run populateFromUserProfile
    useLoansStore.getState().populateFromUserProfile();

    // Verification status must remain not_connected/pending, NEVER verified
    assert.notEqual(useLoansStore.getState().kycStatus, "verified");
    assert.equal(useLoansStore.getState().kycStatus, "not_connected");
  });

  test("Supports conditional requirements for PAN, DOB, and Email", () => {
    // When fields are not required by provider
    const minimalData: LoanKycData = {
      fullName: "Prakash Sharma",
      mobile: "9876543210",
      email: "",
      pan: "",
      aadhaar: "",
      dob: "",
      currentAddress: {
        houseNumber: "Flat 204",
        street: "Road No 10, Banjara Hills",
        city: "Hyderabad",
        state: "Telangana",
        pincode: "500034",
      },
      isPermanentSameAsCurrent: true,
      permanentAddress: {
        houseNumber: "Flat 204",
        street: "Road No 10, Banjara Hills",
        city: "Hyderabad",
        state: "Telangana",
        pincode: "500034",
      },
      consentGiven: true,
    };

    // With no provider mandates, passes without PAN, DOB, Email
    const resultUnconditional = validateLoanKyc(minimalData, {
      requirePan: false,
      requireDob: false,
      requireEmail: false,
    });
    assert.equal(resultUnconditional.isValid, true);

    // With provider mandates, flags missing fields
    const resultConditional = validateLoanKyc(minimalData, {
      requirePan: true,
      requireDob: true,
      requireEmail: true,
    });
    assert.equal(resultConditional.isValid, false);
    assert.ok(resultConditional.errors.pan);
    assert.ok(resultConditional.errors.dob);
    assert.ok(resultConditional.errors.email);
  });

  test("Normal Business Loan KYC advances to business-details and not documents or review", () => {
    const businessCategory = TEST_CATEGORIES[0];
    useLoansStore.getState().resetAll();
    useLoansStore.getState().selectCategory(businessCategory);

    assert.equal(useLoansStore.getState().activeStep, "kyc");
    assert.equal(useLoansStore.getState().returnToReview, false);

    // Normal forward advance
    useLoansStore.getState().advanceTo("business-details");

    assert.equal(useLoansStore.getState().activeStep, "business-details");
    assert.notEqual(useLoansStore.getState().activeStep, "documents");
    assert.notEqual(useLoansStore.getState().activeStep, "review");
  });

  test("Edit from Review returns directly to Review on continue", () => {
    const businessCategory = TEST_CATEGORIES[0];
    useLoansStore.getState().resetAll();
    useLoansStore.getState().selectCategory(businessCategory);

    // Enter edit mode from Review
    useLoansStore.getState().editFromReview("kyc");
    assert.equal(useLoansStore.getState().activeStep, "kyc");
    assert.equal(useLoansStore.getState().returnToReview, true);

    // Advancing in edit mode must jump straight back to review
    useLoansStore.getState().advanceTo("business-details");
    assert.equal(useLoansStore.getState().activeStep, "review");
    assert.equal(useLoansStore.getState().returnToReview, false);
  });

  test("Selecting category resets any stale returnToReview state", () => {
    const businessCategory = TEST_CATEGORIES[0];
    useLoansStore.getState().resetAll();
    useLoansStore.getState().editFromReview("kyc");
    assert.equal(useLoansStore.getState().returnToReview, true);

    useLoansStore.getState().selectCategory(businessCategory);
    assert.equal(useLoansStore.getState().activeStep, "kyc");
    assert.equal(useLoansStore.getState().returnToReview, false);
  });

  test("isApplicantAdult accepts both ISO YYYY-MM-DD and Indian DD-MM-YYYY formats", () => {
    assert.equal(isApplicantAdult("15-08-1990"), true);
    assert.equal(isApplicantAdult("1990-08-15"), true);
    assert.equal(isApplicantAdult("2015-01-01"), false);
    assert.equal(isApplicantAdult("01-01-2015"), false);
  });

  test("KYC screen uses the common first-visit label and Update & Continue on revisit", () => {
    const screenPath = path.join(
      process.cwd(),
      "src/modules/loans/screens/LoanKycScreen/LoanKycScreen.tsx"
    );
    const screenSource = fs.readFileSync(screenPath, "utf8");
    assert.ok(screenSource.includes('getContinueLabel(isUpdate, "Continue →")'));
    assert.ok(!screenSource.includes("Continue to Business Details"));
    assert.ok(screenSource.includes("isEditMode || isRevisit"));
  });

  test("mobile, PAN, Aadhaar, and PIN inputs do not truncate invalid pasted values", () => {
    const identitySource = fs.readFileSync(
      path.join(
        process.cwd(),
        "src/modules/loans/components/CustomerIdentitySection/CustomerIdentitySection.tsx"
      ),
      "utf8"
    );
    const addressSource = fs.readFileSync(
      path.join(
        process.cwd(),
        "src/modules/loans/components/AddressSection/AddressSection.tsx"
      ),
      "utf8"
    );
    assert.ok(!identitySource.includes("maxLength={10}"));
    assert.ok(!identitySource.includes("maxLength={12}"));
    assert.ok(!identitySource.includes(".slice(0, 10)"));
    assert.ok(!identitySource.includes(".slice(0, 12)"));
    assert.ok(!addressSource.includes("maxLength={6}"));
    assert.ok(!addressSource.includes(".slice(0, 6)"));
  });
});
