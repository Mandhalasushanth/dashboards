/// <reference types="node" />
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test, describe, beforeEach } from "node:test";
import { useLoansStore } from "../../modules/loans/store/loansStore";
import {
  getSubmittedLoanSummary,
  LOAN_CATEGORY_LABELS,
} from "../../modules/loans/utils/loanReviewSummary";
import { formatCurrencyINR } from "../../shared/formatters/currencyFormatter";
import {
  localLoanSubmissionService,
  setLoanSubmissionService,
  type LoanSubmissionPayload,
} from "../../modules/loans/services/loanSubmissionService";
import { normalizeMoneyInput } from "../../modules/loans/utils/moneyInput";
import { getPersonalLoanDocuments } from "../../modules/loans/constants/loanDocuments";
import type { LoanDocumentUpload } from "../../modules/loans/types/loanReview.types";

const mockDoc = (id: string): LoanDocumentUpload => ({
  id: `${id}_1`,
  documentId: id,
  fileName: `${id}.pdf`,
  fileUri: `file:///${id}.pdf`,
  fileSize: 1024,
  mimeType: "application/pdf",
  status: "selected",
});

const personalCategory = {
  id: "personal-loan" as const,
  title: "Personal Loan",
  description: "Meet your personal needs",
  image: { uri: "test" },
};

const businessCategory = {
  id: "business-loan" as const,
  title: "Business & Working Capital Loans",
  description: "Business Credit",
  image: { uri: "test" },
};

describe("Global Loan Under Review Screen", () => {
  beforeEach(() => {
    useLoansStore.getState().resetAll();
    setLoanSubmissionService(localLoanSubmissionService);
  });

  test("Personal Loan full flow completes to Under Review with correct dynamic data", async () => {
    const store = useLoansStore.getState();

    // 1. Category selection
    store.selectCategory(personalCategory);
    assert.equal(useLoansStore.getState().activeStep, "kyc");

    // 2. Step 1: KYC
    store.setKycField("fullName", "Ananya Sharma");
    store.setKycField("mobile", "9876543210");
    store.setKycField("pan", "ABCPE1234F");
    store.setKycField("dob", "15-08-1992");
    store.setCurrentAddressField("houseNumber", "12");
    store.setCurrentAddressField("street", "MG Road");
    store.setCurrentAddressField("city", "Bengaluru");
    store.setCurrentAddressField("state", "Karnataka");
    store.setCurrentAddressField("pincode", "560001");
    store.setKycField("consentGiven", true);

    // Continue to Step 2: Employment & Income
    store.advanceTo("personal-employment");
    assert.equal(useLoansStore.getState().activeStep, "personal-employment");

    // 3. Step 2: Employment & Income
    store.setPersonalEmploymentType("salaried");
    store.setPersonalLoanField("employerName", "Tech Corp India");
    store.setPersonalLoanField("jobType", "Private");
    store.setPersonalLoanField("monthlyNetSalary", "85000");
    store.setPersonalLoanField("workExperience", "3 - 5 years");
    store.setPersonalLoanField("salaryCreditMethod", "Bank Account");
    store.setPersonalLoanField("loanAmount", "250000");

    // Continue to Step 3: Documents
    store.advanceTo("documents");
    assert.equal(useLoansStore.getState().activeStep, "documents");

    // 4. Step 3: Documents (mandatory: pan_card and bank_statement for salaried bank credit)
    store.setDocumentAttachment("pan_card", mockDoc("pan_card"));
    store.setDocumentAttachment("bank_statement", mockDoc("bank_statement"));

    // Continue to Step 4: Review
    store.advanceTo("review");
    assert.equal(useLoansStore.getState().activeStep, "review");

    // 5. Step 4: Consent & Submit Application
    store.setReviewConsent(true);
    let capturedPayload: LoanSubmissionPayload | null = null;
    setLoanSubmissionService({
      submit: async (payload) => {
        capturedPayload = payload;
        return {
          applicationId: "TXE-LN-889900",
          submittedAt: "2026-10-14T10:30:00.000Z",
          isSyncedToServer: false,
        };
      },
    });

    const isSubmitted = await store.submitLoanApplication();
    assert.equal(isSubmitted, true);

    // 6. Step 5: Submitted -> Under Review state
    const submittedState = useLoansStore.getState();
    assert.equal(submittedState.activeStep, "submitted");
    assert.equal(submittedState.submittedApplicationId, "TXE-LN-889900");
    assert.equal(submittedState.submittedAt, "2026-10-14T10:30:00.000Z");
    assert.equal(submittedState.isSubmissionSynced, false);

    // Verify dynamic loan summary resolution
    const summary = getSubmittedLoanSummary(
      submittedState.selectedCategory?.id,
      submittedState.businessFormData,
      submittedState.personalFormData.loanAmount
    );
    assert.equal(summary.label, "Personal Loan");
    assert.equal(summary.amountRaw, "250000");
    assert.equal(formatCurrencyINR(summary.amountRaw), "₹2,50,000");

    // Verify payload captured personal loan details
    assert.ok(capturedPayload);
    const payload = capturedPayload as LoanSubmissionPayload;
    assert.equal(payload.categoryId, "personal-loan");
    assert.equal(
      payload.personalFormData?.employerName,
      "Tech Corp India"
    );
  });

  test("Business Loan resolves correct label and amount on Under Review", () => {
    const store = useLoansStore.getState();
    store.selectCategory(businessCategory);
    store.setLoanType("business-loan");
    store.setBusinessLoanField("loanAmount", "500000");

    const summary = getSubmittedLoanSummary(
      "business-loan",
      useLoansStore.getState().businessFormData,
      useLoansStore.getState().personalFormData.loanAmount
    );
    assert.equal(summary.label, "Business Loan");
    assert.equal(summary.amountRaw, "500000");
    assert.equal(formatCurrencyINR(summary.amountRaw), "₹5,00,000");
  });

  test("Working Capital Loan resolves correct label and amount on Under Review", () => {
    const store = useLoansStore.getState();
    store.selectCategory(businessCategory);
    store.setLoanType("working-capital");
    store.setWorkingCapitalField("loanAmount", "750000");

    const summary = getSubmittedLoanSummary(
      "business-loan",
      useLoansStore.getState().businessFormData,
      useLoansStore.getState().personalFormData.loanAmount
    );
    assert.equal(summary.label, "Working Capital Loan");
    assert.equal(summary.amountRaw, "750000");
    assert.equal(formatCurrencyINR(summary.amountRaw), "₹7,50,000");
  });

  test("Vehicle Under Review uses the vehicle amount rather than another loan amount", () => {
    const form = useLoansStore.getState().businessFormData;
    const homeLoan = getSubmittedLoanSummary(
      "home-loan",
      form,
      undefined,
      undefined,
      "5000000"
    );
    assert.equal(homeLoan.label, "Home Loan");
    assert.equal(homeLoan.amountRaw, "5000000");

    const vehicleLoan = getSubmittedLoanSummary(
      "vehicle-loan",
      form,
      undefined,
      undefined,
      undefined,
      "800000"
    );
    assert.equal(vehicleLoan.label, "Vehicle Loan");
    assert.equal(vehicleLoan.amountRaw, "800000");

    assert.equal(
      LOAN_CATEGORY_LABELS["home-loan"],
      "Home Loan"
    );
  });

  test("Architecture check: Single canonical Under Review screen with zero duplicates", () => {
    const loansScreenDir = path.join(
      process.cwd(),
      "src/modules/loans/screens"
    );
    const screenDirs = fs.readdirSync(loansScreenDir);

    // Must NOT contain PersonalLoanUnderReviewScreen
    assert.equal(
      screenDirs.includes("PersonalLoanUnderReviewScreen"),
      false
    );

    // Exactly one LoanUnderReviewScreen exists
    assert.equal(screenDirs.includes("LoanUnderReviewScreen"), true);

    // Verify LoanUnderReviewScreen reuses ApplicationUnderReview directly
    const loanUnderReviewCode = fs.readFileSync(
      path.join(
        loansScreenDir,
        "LoanUnderReviewScreen",
        "LoanUnderReviewScreen.tsx"
      ),
      "utf8"
    );
    assert.ok(
      loanUnderReviewCode.includes("@/shared/components/ApplicationUnderReview")
    );
    assert.ok(loanUnderReviewCode.includes("status=\"under_review\""));
    assert.ok(!/StyleSheet|<View|<Text/.test(loanUnderReviewCode));

    // Verify LoansMainScreen routes "submitted" step to LoanUnderReviewScreen
    const mainScreenCode = fs.readFileSync(
      path.join(loansScreenDir, "LoansMainScreen", "LoansMainScreen.tsx"),
      "utf8"
    );
    assert.ok(
      mainScreenCode.includes(
        "case \"submitted\":\n          return (\n            <LoanUnderReviewScreen"
      )
    );
    assert.ok(!mainScreenCode.includes("PersonalLoanUnderReviewScreen"));
  });

  test("Personal Loan Review -> Edit flow returns directly to Review with documents intact", () => {
    const store = useLoansStore.getState();
    store.selectCategory(personalCategory);
    store.setKycField("fullName", "Pooja Reddy");
    store.setPersonalEmploymentType("salaried");
    store.setPersonalLoanField("employerName", "Reddy Enterprises");
    store.setDocumentAttachment("pan_card", mockDoc("pan_card"));

    // Step into review
    store.setActiveStep("review");
    assert.equal(useLoansStore.getState().activeStep, "review");

    // Edit KYC from review
    store.editFromReview("kyc");
    assert.equal(useLoansStore.getState().activeStep, "kyc");
    assert.equal(useLoansStore.getState().returnToReview, true);

    // Update name and continue: returns directly to review
    store.setKycField("fullName", "Pooja K Reddy");
    store.advanceTo("personal-employment");
    assert.equal(useLoansStore.getState().activeStep, "review");
    assert.equal(useLoansStore.getState().returnToReview, false);
    assert.equal(useLoansStore.getState().kycData.fullName, "Pooja K Reddy");
    assert.ok(useLoansStore.getState().uploadedDocuments.pan_card);

    // Edit Employment from review
    store.editFromReview("personal-employment");
    assert.equal(useLoansStore.getState().activeStep, "personal-employment");
    assert.equal(useLoansStore.getState().returnToReview, true);
    store.setPersonalLoanField("monthlyNetSalary", "95000");
    store.advanceTo("documents");
    assert.equal(useLoansStore.getState().activeStep, "review");
    assert.equal(useLoansStore.getState().personalFormData.monthlyNetSalary, "95000");

    // Edit Documents from review
    store.editFromReview("documents");
    assert.equal(useLoansStore.getState().activeStep, "documents");
    assert.equal(useLoansStore.getState().returnToReview, true);
    store.advanceTo("review");
    assert.equal(useLoansStore.getState().activeStep, "review");
    assert.ok(useLoansStore.getState().uploadedDocuments.pan_card);
  });

  test("Input robustness: Unicode, emoji, scripts, and special characters validate without crashing", () => {
    const unicodeStrings = [
      "😀 😃 👍 🚀 💰 🏢 📈 🔥",
      "தமிழ் நிறுவனம்",
      "नमस्ते एंटरप्राइजेज",
      "తెలుగు వ్యాపారం",
      "北京科技有限公司",
      "O'Connor & Sons",
      "A&B Traders",
      "ABC @#$%",
    ];

    for (const str of unicodeStrings) {
      useLoansStore.getState().resetAll();
      const store = useLoansStore.getState();
      store.selectCategory(personalCategory);
      store.setPersonalEmploymentType("salaried");
      store.setPersonalLoanField("loanAmount", "250000");
      store.setPersonalLoanField("employerName", str);
      store.setPersonalLoanField("jobType", "Private");
      store.setPersonalLoanField("monthlyNetSalary", "60000");
      store.setPersonalLoanField("workExperience", "1 - 3 years");
      store.setPersonalLoanField("salaryCreditMethod", "Bank Account");

      const valid = store.validatePersonalForm();
      assert.equal(valid, true, `Expected "${str}" to be valid in Personal Loan employer`);
      assert.equal(useLoansStore.getState().personalFormData.employerName, str);
    }
  });

  test("Money input safety: comma, decimal paste, and currency symbols sanitize cleanly", () => {
    assert.equal(normalizeMoneyInput("₹25,00,000"), "2500000");
    assert.equal(normalizeMoneyInput("50,000"), "50000");
    assert.equal(normalizeMoneyInput("50,000.75"), "50,000.75");
    assert.equal(normalizeMoneyInput("1,00,000"), "100000");
    assert.equal(normalizeMoneyInput("0"), "0");
    assert.equal(normalizeMoneyInput("-25000"), "-25000");
    assert.equal(normalizeMoneyInput("9999999999"), "9999999999");
    assert.equal(normalizeMoneyInput("abc"), "abc");
  });

  test("Personal Loan Bank Statement restricts uploadSources to Files only, while PAN keeps Camera", () => {
    const docs = getPersonalLoanDocuments({
      loanAmount: "500000",
      employmentType: "salaried",
      employerName: "Acme",
      companyName: "Acme",
      jobType: "Private",
      monthlyNetSalary: "50000",
      monthlySalary: "50000",
      workExperience: "1 - 3 years",
      salaryCreditMethod: "Bank Account",
      businessOrProfessionName: "",
      professionName: "",
      natureOfBusiness: "",
      averageMonthlyIncome: "",
      monthlyIncome: "",
      yearsInBusiness: "",
    });

    const bankDoc = docs.find((d: any) => d.id === "bank_statement");
    assert.ok(bankDoc);
    assert.deepEqual(bankDoc.uploadSources, ["files"]);
    assert.ok(!bankDoc.uploadSources.includes("camera"));
    assert.deepEqual(bankDoc.allowedMimeTypes, ["application/pdf"]);

    const panDoc = docs.find((d: any) => d.id === "pan_card");
    assert.ok(panDoc);
    assert.ok(panDoc.uploadSources.includes("camera"));
    assert.ok(panDoc.uploadSources.includes("files"));
  });

  test("Reset after Under Review leaves clean state with zero lingering application data", () => {
    const store = useLoansStore.getState();
    store.selectCategory(personalCategory);
    store.setKycField("fullName", "Anita");
    store.setDocumentAttachment("pan_card", mockDoc("pan_card"));
    store.setActiveStep("submitted");

    store.resetAll();
    const clean = useLoansStore.getState();
    assert.equal(clean.selectedCategory, null);
    assert.equal(clean.activeStep, "categories");
    assert.equal(clean.kycData.fullName, "");
    assert.deepEqual(clean.uploadedDocuments, {});
    assert.equal(clean.submittedApplicationId, null);
    assert.equal(clean.submittedAt, null);
    assert.equal(clean.returnToReview, false);
  });
});
