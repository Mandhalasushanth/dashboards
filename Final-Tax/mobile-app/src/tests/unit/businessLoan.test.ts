/// <reference types="node" />
import assert from "node:assert/strict";
import { test, describe } from "node:test";
import {
  validateBusinessLoanForm,
  isProjectCostRequired,
  validateBusinessEstablishmentDate,
} from "../../modules/loans/businessWorkingCapital/validation/businessLoanValidation";
import { useLoansStore } from "../../modules/loans/store/loansStore";
import type { BusinessLoanFormData } from "../../modules/loans/businessWorkingCapital/types/businessLoan.types";

const mockValidBusinessFormData: BusinessLoanFormData = {
  loanType: "business-loan",
  businessProfile: {
    businessName: "Acme Industrial Technologies",
    constitution: "Private Limited Company",
    constitutionOther: "",
    businessActivity: "Manufacturing",
    activityOther: "",
    establishmentDate: "12-04-2018",
    businessAddress: "Plot 42, IDA Cherlapally, Phase 2",
    pincode: "500051",
    isGstRegistered: true,
    gstin: "36AABCA1234F1Z8",
    udyamRegistration: "UDYAM-TS-02-0012345",
  },
  businessLoan: {
    loanAmount: "1500000",
    purpose: "Equipment Purchase",
    purposeOther: "",
    purposeDescription: "Procurement of automated CNC milling equipment",
    projectCost: "2200000",
  },
  workingCapital: {
    loanAmount: "800000",
    purpose: "Inventory Purchase",
    purposeOther: "",
    purposeDescription: "Raw material bulk procurement for Q3 supply orders",
    monthlySales: "1200000",
    monthlyExpenses: "850000",
  },
};

describe("Screen 2: Business & Working Capital Loans Suite", () => {
  test("Valid Business Loan form passes validation without errors", () => {
    const res = validateBusinessLoanForm(mockValidBusinessFormData);
    assert.equal(res.isValid, true);
    assert.equal(Object.keys(res.errors).length, 0);
  });

  test("Valid Working Capital Loan form passes validation without errors", () => {
    const wcData: BusinessLoanFormData = {
      ...mockValidBusinessFormData,
      loanType: "working-capital",
    };
    const res = validateBusinessLoanForm(wcData);
    assert.equal(res.isValid, true);
    assert.equal(Object.keys(res.errors).length, 0);
  });

  test("Common Business Profile enforces mandatory fields", () => {
    const invalidProfile: BusinessLoanFormData = {
      ...mockValidBusinessFormData,
      businessProfile: {
        ...mockValidBusinessFormData.businessProfile,
        businessName: "",
        constitution: "",
        businessActivity: "",
        establishmentDate: "",
        businessAddress: "",
        pincode: "",
      },
    };
    const res = validateBusinessLoanForm(invalidProfile);
    assert.equal(res.isValid, false);
    assert.ok(res.errors.businessName);
    assert.ok(res.errors.constitution);
    assert.ok(res.errors.businessActivity);
    assert.ok(res.errors.establishmentDate);
    assert.ok(res.errors.businessAddress);
    assert.ok(res.errors.pincode);
  });

  test("Requires specification when Constitution or Activity is 'Other'", () => {
    const otherData: BusinessLoanFormData = {
      ...mockValidBusinessFormData,
      businessProfile: {
        ...mockValidBusinessFormData.businessProfile,
        constitution: "Other",
        constitutionOther: "",
        businessActivity: "Other",
        activityOther: "",
      },
    };
    const res = validateBusinessLoanForm(otherData);
    assert.equal(res.isValid, false);
    assert.ok(res.errors.constitutionOther);
    assert.ok(res.errors.activityOther);

    // When specified, errors are resolved
    otherData.businessProfile.constitutionOther = "Joint Venture";
    otherData.businessProfile.activityOther = "Bio-tech Engineering";
    const resResolved = validateBusinessLoanForm(otherData);
    assert.equal(resResolved.isValid, true);
  });

  test("Enforces GSTIN validation only when GST registered", () => {
    // When GST registered is false, GSTIN is optional
    const noGstData: BusinessLoanFormData = {
      ...mockValidBusinessFormData,
      businessProfile: {
        ...mockValidBusinessFormData.businessProfile,
        isGstRegistered: false,
        gstin: "",
      },
    };
    assert.equal(validateBusinessLoanForm(noGstData).isValid, true);

    // When GST registered is true, invalid GSTIN is rejected
    const invalidGstData: BusinessLoanFormData = {
      ...mockValidBusinessFormData,
      businessProfile: {
        ...mockValidBusinessFormData.businessProfile,
        isGstRegistered: true,
        gstin: "INVALIDGSTIN",
      },
    };
    const res = validateBusinessLoanForm(invalidGstData);
    assert.equal(res.isValid, false);
    assert.ok(res.errors.gstin);
  });

  test("Enforces establishment date cannot be in the future", () => {
    const futureDate = "25-12-2099";
    assert.equal(validateBusinessEstablishmentDate(futureDate), false);
    assert.equal(validateBusinessEstablishmentDate("15-08-2020"), true);
  });

  test("Project cost is conditionally required for Equipment Purchase, Renovation, and Setup", () => {
    assert.equal(isProjectCostRequired("Equipment Purchase"), true);
    assert.equal(isProjectCostRequired("Renovation"), true);
    assert.equal(isProjectCostRequired("Business Setup"), true);
    assert.equal(isProjectCostRequired("Business Expansion"), false);
    assert.equal(isProjectCostRequired("Inventory Purchase"), false);

    // Equipment Purchase with missing projectCost fails
    const missingCostData: BusinessLoanFormData = {
      ...mockValidBusinessFormData,
      businessLoan: {
        ...mockValidBusinessFormData.businessLoan,
        purpose: "Equipment Purchase",
        projectCost: "",
      },
    };
    const res = validateBusinessLoanForm(missingCostData);
    assert.equal(res.isValid, false);
    assert.ok(res.errors.businessLoanProjectCost);

    // Business Expansion with empty projectCost succeeds
    missingCostData.businessLoan.purpose = "Business Expansion";
    const resExpansion = validateBusinessLoanForm(missingCostData);
    assert.equal(resExpansion.isValid, true);
  });

  test("Working Capital Loan validates monthly sales and expenses", () => {
    const invalidWcData: BusinessLoanFormData = {
      ...mockValidBusinessFormData,
      loanType: "working-capital",
      workingCapital: {
        ...mockValidBusinessFormData.workingCapital,
        monthlySales: "0",
        monthlyExpenses: "",
      },
    };
    const res = validateBusinessLoanForm(invalidWcData);
    assert.equal(res.isValid, false);
    assert.ok(res.errors.monthlySales);
    assert.ok(res.errors.monthlyExpenses);
  });

  test("useLoansStore preserves data when toggling loan type", () => {
    useLoansStore.getState().resetAll();

    // Set common business profile
    useLoansStore
      .getState()
      .setBusinessProfileField("businessName", "Zenith Electronics");
    useLoansStore.getState().setBusinessProfileField("pincode", "560001");

    // Set Business Loan field
    useLoansStore.getState().setBusinessLoanField("loanAmount", "2500000");

    // Set Working Capital field
    useLoansStore.getState().setWorkingCapitalField("loanAmount", "1200000");

    // Toggle to working-capital
    useLoansStore.getState().setLoanType("working-capital");
    assert.equal(
      useLoansStore.getState().businessFormData.loanType,
      "working-capital"
    );
    assert.equal(
      useLoansStore.getState().businessFormData.businessProfile.businessName,
      "Zenith Electronics"
    );
    assert.equal(
      useLoansStore.getState().businessFormData.businessLoan.loanAmount,
      "2500000"
    );
    assert.equal(
      useLoansStore.getState().businessFormData.workingCapital.loanAmount,
      "1200000"
    );

    // Toggle back to business-loan
    useLoansStore.getState().setLoanType("business-loan");
    assert.equal(
      useLoansStore.getState().businessFormData.loanType,
      "business-loan"
    );
    assert.equal(
      useLoansStore.getState().businessFormData.businessProfile.businessName,
      "Zenith Electronics"
    );
    assert.equal(
      useLoansStore.getState().businessFormData.businessLoan.loanAmount,
      "2500000"
    );
  });

  test("useLoansStore transitions steps and preserves full KYC state", () => {
    useLoansStore.getState().resetAll();

    // Fill KYC
    useLoansStore.getState().setKycField("fullName", "Ananya Verma");
    useLoansStore.getState().setKycField("mobile", "9876543210");
    useLoansStore.getState().setActiveStep("kyc");

    // Transition to Screen 2
    useLoansStore.getState().setActiveStep("business-details");
    assert.equal(useLoansStore.getState().activeStep, "business-details");

    // Enter Business details
    useLoansStore
      .getState()
      .setBusinessProfileField("businessName", "Verma Textiles");

    // Transition backward to KYC
    useLoansStore.getState().setActiveStep("kyc");
    assert.equal(useLoansStore.getState().activeStep, "kyc");
    assert.equal(useLoansStore.getState().kycData.fullName, "Ananya Verma");

    // Re-advance to business-details
    useLoansStore.getState().setActiveStep("business-details");
    assert.equal(
      useLoansStore.getState().businessFormData.businessProfile.businessName,
      "Verma Textiles"
    );

    // Advance to review
    useLoansStore.getState().setActiveStep("review");
    assert.equal(useLoansStore.getState().activeStep, "review");
  });
});
