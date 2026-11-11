/// <reference types="node" />
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test, describe, beforeEach } from "node:test";
import { useLoansStore } from "../../modules/loans/store/loansStore";
import {
  createInitialKycData,
  createInitialBusinessFormData,
  createInitialPersonalFormData,
} from "../../modules/loans/store/loansStore.types";
import {
  validateHomeLoanRequirementForm,
  isHomeLoanRequirementFormFilled,
} from "../../modules/loans/homeLoan/validation/homeLoanValidation";
import {
  HOME_LOAN_PURPOSE_OPTIONS,
  HOME_LOAN_PROPERTY_STATUS_OPTIONS,
  type HomeLoanRequirementFormData,
} from "../../modules/loans/homeLoan/types/homeLoan.types";
import { buildReviewSections } from "../../modules/loans/utils/loanReviewSummary";
import type { LoanDocumentUpload } from "../../modules/loans/types/loanReview.types";

const validHomeLoanForm: HomeLoanRequirementFormData = {
  loanAmount: "2500000",
  requestedAmount: "2500000",
  purpose: "Purchase a New Home",
  propertyStatus: "Ready to Move",
  approximatePropertyValue: "4000000",
  propertyValue: "4000000",
};

const homeLoanCategory = {
  id: "home-loan" as const,
  title: "Home Loan",
  description: "Make your dream home a reality",
  image: { uri: "home_loan" },
};

describe("Home Loan Screen 2: Home Loan Requirement Suite", () => {
  beforeEach(() => {
    useLoansStore.getState().resetAll();
  });

  test("1. Screen component and source files render with canonical architecture and zero underwriting fluff", () => {
    const screenPath = path.join(
      process.cwd(),
      "src/modules/loans/homeLoan/screens/HomeLoanRequirementScreen/HomeLoanRequirementScreen.tsx"
    );
    assert.ok(fs.existsSync(screenPath), "HomeLoanRequirementScreen file exists");
    const code = fs.readFileSync(screenPath, "utf8");

    // Header requirements
    assert.ok(code.includes("Tell us about your home loan"));
    assert.ok(code.includes("Home Loan Requirement"));
    assert.ok(code.includes("LoanFlowHeader"));

    // Canonical components
    assert.ok(code.includes("MoneyInputField"));
    assert.ok(code.includes("Dropdown"));
    assert.ok(code.includes("KeyboardStickyFooter"));
    assert.ok(code.includes("KeyboardAwareScrollView"));

    // No underwriting / property clutter questions
    assert.ok(
      !/cibil|credit score|survey number|carpet area|builder name|registration number|sale agreement|bank account/i.test(
        code
      )
    );
  });

  test("2. Requested amount is stored correctly in Zustand store and synchronized", () => {
    const store = useLoansStore.getState();
    store.selectCategory(homeLoanCategory);
    store.setHomeLoanField("loanAmount", "3500000");

    const state = useLoansStore.getState();
    assert.equal(state.homeLoanFormData.loanAmount, "3500000");
    assert.equal(state.homeLoanFormData.requestedAmount, "3500000");
  });

  test("3. Purpose selection works across all 5 canonical options", () => {
    const store = useLoansStore.getState();
    assert.equal(HOME_LOAN_PURPOSE_OPTIONS.length, 5);

    HOME_LOAN_PURPOSE_OPTIONS.forEach((option) => {
      store.setHomeLoanField("purpose", option);
      assert.equal(useLoansStore.getState().homeLoanFormData.purpose, option);
    });
  });

  test("4. Property status selection works across all 4 canonical options", () => {
    const store = useLoansStore.getState();
    assert.equal(HOME_LOAN_PROPERTY_STATUS_OPTIONS.length, 4);

    HOME_LOAN_PROPERTY_STATUS_OPTIONS.forEach((option) => {
      store.setHomeLoanField("propertyStatus", option);
      assert.equal(useLoansStore.getState().homeLoanFormData.propertyStatus, option);
    });
  });

  test("5. Property value is stored correctly in Zustand store and synchronized", () => {
    const store = useLoansStore.getState();
    store.selectCategory(homeLoanCategory);
    store.setHomeLoanField("approximatePropertyValue", "5500000");

    const state = useLoansStore.getState();
    assert.equal(state.homeLoanFormData.approximatePropertyValue, "5500000");
    assert.equal(state.homeLoanFormData.propertyValue, "5500000");
  });

  test("6. Empty required fields fail validation with exact human-readable messages", () => {
    const emptyForm: HomeLoanRequirementFormData = {
      loanAmount: "",
      requestedAmount: "",
      purpose: "",
      propertyStatus: "",
      approximatePropertyValue: "",
    };

    const result = validateHomeLoanRequirementForm(emptyForm);
    assert.equal(result.isValid, false);
    assert.equal(result.errors.loanAmount, "Enter the requested loan amount");
    assert.equal(result.errors.purpose, "Select the purpose of the home loan");
    assert.equal(result.errors.propertyStatus, "Select the property status");
    assert.equal(
      result.errors.approximatePropertyValue,
      "Enter the approximate property value"
    );

    // Also test decimal amounts rejected as whole rupees
    const decimalForm = validateHomeLoanRequirementForm({
      ...validHomeLoanForm,
      loanAmount: "2500000.50",
      approximatePropertyValue: "4000000.75",
    });
    assert.equal(decimalForm.isValid, false);
    assert.equal(decimalForm.errors.loanAmount, "Enter whole rupees without paise.");
    assert.equal(
      decimalForm.errors.approximatePropertyValue,
      "Enter whole rupees without paise."
    );
  });

  test("7. Valid Home Loan Requirement passes validation with zero errors", () => {
    const result = validateHomeLoanRequirementForm(validHomeLoanForm);
    assert.equal(result.isValid, true);
    assert.equal(Object.keys(result.errors).length, 0);

    const isFilled = isHomeLoanRequirementFormFilled(validHomeLoanForm);
    assert.equal(isFilled, true);
  });

  test("8. Review -> Edit enters edit mode", () => {
    const store = useLoansStore.getState();
    store.selectCategory(homeLoanCategory);
    store.editFromReview("home-loan-requirement");

    const state = useLoansStore.getState();
    assert.equal(state.activeStep, "home-loan-requirement");
    assert.equal(state.returnToReview, true);
  });

  test("9. Back button is hidden in edit mode via LoanFlowHeader architecture", () => {
    const headerPath = path.join(
      process.cwd(),
      "src/modules/loans/components/LoanFlowHeader/LoanFlowHeader.tsx"
    );
    const headerCode = fs.readFileSync(headerPath, "utf8");
    assert.ok(headerCode.includes("isEditMode"));
    assert.ok(headerCode.includes("onBack: undefined"));
    assert.ok(headerCode.includes('stepLabel: "Editing from Review"'));
  });

  test("10. Footer changes to 'Update & Continue' in edit mode and 'Continue' in normal mode", () => {
    const screenPath = path.join(
      process.cwd(),
      "src/modules/loans/homeLoan/screens/HomeLoanRequirementScreen/HomeLoanRequirementScreen.tsx"
    );
    const code = fs.readFileSync(screenPath, "utf8");
    assert.ok(code.includes('getContinueLabel(isEditMode || isRevisit, "Continue →")'));
  });

  test("11. Update & Continue returns directly to Review", () => {
    const store = useLoansStore.getState();
    store.selectCategory(homeLoanCategory);
    store.setHomeLoanField("loanAmount", "2500000");
    store.setHomeLoanField("purpose", "Purchase a New Home");
    store.setHomeLoanField("propertyStatus", "Ready to Move");
    store.setHomeLoanField("approximatePropertyValue", "4000000");

    // Enter edit mode from Review
    store.editFromReview("home-loan-requirement");
    assert.equal(useLoansStore.getState().returnToReview, true);

    // Save and advance
    store.setHomeLoanField("approximatePropertyValue", "4500000");
    const valid = store.validateHomeLoanForm();
    assert.equal(valid, true);

    // Advance to next step while returnToReview is true returns directly to Review
    store.advanceTo("home-employment-income");
    const afterSave = useLoansStore.getState();
    assert.equal(afterSave.activeStep, "review");
    assert.equal(afterSave.returnToReview, false);
    assert.equal(afterSave.homeLoanFormData.approximatePropertyValue, "4500000");
  });

  test("12. Existing KYC state remains intact during Home Loan operations", () => {
    const store = useLoansStore.getState();
    store.selectCategory(homeLoanCategory);
    store.setKycField("fullName", "Vikram Malhotra");
    store.setKycField("mobile", "9988776655");
    store.setKycField("pan", "ABCDE1234F");

    // Operate on Home Loan fields
    store.setHomeLoanField("loanAmount", "3000000");
    store.setHomeLoanField("purpose", "Construct a House");
    store.setHomeLoanField("propertyStatus", "Property Identified");
    store.setHomeLoanField("approximatePropertyValue", "5000000");

    const state = useLoansStore.getState();
    assert.equal(state.kycData.fullName, "Vikram Malhotra");
    assert.equal(state.kycData.mobile, "9988776655");
    assert.equal(state.kycData.pan, "ABCDE1234F");
    assert.equal(state.homeLoanFormData.loanAmount, "3000000");
  });

  test("13. Existing documents remain intact during Home Loan operations", () => {
    const store = useLoansStore.getState();
    store.selectCategory(homeLoanCategory);

    const sampleDoc: LoanDocumentUpload = {
      id: "pan_1",
      documentId: "pan_card",
      fileName: "pan.pdf",
      fileUri: "file:///pan.pdf",
      fileSize: 1024,
      mimeType: "application/pdf",
      status: "selected",
    };
    store.setDocumentAttachment("pan_card", sampleDoc);

    store.setHomeLoanField("loanAmount", "2000000");
    store.setHomeLoanField("purpose", "Home Renovation");

    const state = useLoansStore.getState();
    assert.deepEqual(state.uploadedDocuments["pan_card"], sampleDoc);
    assert.equal(state.homeLoanFormData.loanAmount, "2000000");
  });

  test("14. Home Loan values remain intact after Review -> Edit cycle", () => {
    const store = useLoansStore.getState();
    store.selectCategory(homeLoanCategory);
    store.setHomeLoanField("loanAmount", "2500000");
    store.setHomeLoanField("purpose", "Balance Transfer");
    store.setHomeLoanField("propertyStatus", "Ready to Move");
    store.setHomeLoanField("approximatePropertyValue", "3500000");

    // Enter review
    store.setActiveStep("review");
    assert.equal(useLoansStore.getState().activeStep, "review");

    // Edit from review
    store.editFromReview("home-loan-requirement");
    assert.equal(useLoansStore.getState().activeStep, "home-loan-requirement");
    assert.equal(useLoansStore.getState().homeLoanFormData.loanAmount, "2500000");
    assert.equal(useLoansStore.getState().homeLoanFormData.purpose, "Balance Transfer");

    // Modify a field and save
    store.setHomeLoanField("loanAmount", "2800000");
    store.advanceTo("home-employment-income");

    const finalState = useLoansStore.getState();
    assert.equal(finalState.activeStep, "review");
    assert.equal(finalState.homeLoanFormData.loanAmount, "2800000");
    assert.equal(finalState.homeLoanFormData.purpose, "Balance Transfer");
    assert.equal(finalState.homeLoanFormData.propertyStatus, "Ready to Move");
    assert.equal(finalState.homeLoanFormData.approximatePropertyValue, "3500000");
  });

  test("15. Switching loan products clears state from the previous product", () => {
    const store = useLoansStore.getState();

    // Populate business and personal forms
    store.setBusinessProfileField("businessName", "Acme Corp");
    store.setPersonalLoanField("employerName", "Google");

    // Initialize Home Loan
    store.selectCategory(homeLoanCategory);
    store.setHomeLoanField("loanAmount", "5000000");
    store.setHomeLoanField("purpose", "Purchase a New Home");
    store.setHomeLoanField("propertyStatus", "Under Construction");
    store.setHomeLoanField("approximatePropertyValue", "7500000");

    const state = useLoansStore.getState();
    // Home Loan values are independent
    assert.equal(state.homeLoanFormData.loanAmount, "5000000");
    assert.equal(state.homeLoanFormData.purpose, "Purchase a New Home");
    assert.equal(state.homeLoanFormData.propertyStatus, "Under Construction");
    assert.equal(state.homeLoanFormData.approximatePropertyValue, "7500000");

    // State from other products is cleared instead of being retained across applications.
    assert.equal(state.businessFormData.businessProfile.businessName, "");
    assert.equal(state.personalFormData.employerName, "");

    // Review section for home-loan builds home-requirement section
    const kyc = createInitialKycData();
    const bForm = createInitialBusinessFormData();
    const pForm = createInitialPersonalFormData();
    const sections = buildReviewSections(
      kyc,
      bForm,
      pForm,
      "home-loan",
      state.homeLoanFormData
    );
    assert.equal(sections.length, 2);
    assert.equal(sections[0].id, "applicant");
    assert.equal(sections[1].id, "home-requirement");
    assert.equal(sections[1].title, "Home Loan Requirement");
    assert.equal(sections[1].editTarget, "home-loan-requirement");
    const amountRow = sections[1].rows.find((r) => r.label === "Requested Loan Amount");
    assert.equal(amountRow?.value, "₹50,00,000");
    const valRow = sections[1].rows.find((r) => r.label === "Approximate Property Value");
    assert.equal(valRow?.value, "₹75,00,000");
  });
});
