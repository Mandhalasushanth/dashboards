/// <reference types="node" />
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test, describe, beforeEach } from "node:test";
import { useLoansStore } from "../../modules/loans/store/loansStore";
import {
  createInitialKycData,
  createInitialBusinessFormData,
} from "../../modules/loans/store/loansStore.types";
import {
  validatePersonalLoanForm,
} from "../../modules/loans/personalLoan/validation/personalLoanValidation";
import { getPersonalLoanDocuments } from "../../modules/loans/constants/loanDocuments";
import { buildReviewSections } from "../../modules/loans/utils/loanReviewSummary";
import {
  setLoanSubmissionService,
  type LoanSubmissionPayload,
} from "../../modules/loans/services/loanSubmissionService";
import type { PersonalLoanFormData } from "../../modules/loans/personalLoan/types/personalLoan.types";
import { authStorage } from "@/modules/authentication/services/authStorage";

const validSalariedForm: PersonalLoanFormData = {
  loanAmount: "250000", requestedAmount: "250000", employmentType: "salaried",
  employerName: "Tata Consultancy Services", companyName: "Tata Consultancy Services",
  jobType: "Private", monthlyNetSalary: "75000", monthlySalary: "75000",
  workExperience: "3 - 5 years", salaryCreditMethod: "Bank Account",
  businessOrProfessionName: "", professionName: "", natureOfBusiness: "",
  averageMonthlyIncome: "", monthlyIncome: "", yearsInBusiness: "",
};

const validSelfEmployedForm: PersonalLoanFormData = {
  loanAmount: "250000", requestedAmount: "250000", employmentType: "self-employed",
  employerName: "", companyName: "", jobType: "", monthlyNetSalary: "", monthlySalary: "",
  workExperience: "", salaryCreditMethod: "",
  businessOrProfessionName: "Rohit Enterprises", professionName: "Rohit Enterprises",
  natureOfBusiness: "Trading", averageMonthlyIncome: "60000", monthlyIncome: "60000",
  yearsInBusiness: "3 - 5 years",
};

describe("Personal Loan Screen 2: Employment & Income Suite", () => {
  beforeEach(() => {
    useLoansStore.getState().resetAll();
  });

  test("valid salaried application passes validation with zero errors", () => {
    const result = validatePersonalLoanForm(validSalariedForm);
    assert.equal(result.isValid, true);
    assert.equal(Object.keys(result.errors).length, 0);
  });

  test("valid self-employed application passes validation and ignores salaried fields", () => {
    const result = validatePersonalLoanForm(validSelfEmployedForm);
    assert.equal(result.isValid, true);
    assert.equal(Object.keys(result.errors).length, 0);
  });

  test("salaried requires employer, job type, minimum salary (₹10,000), work experience, and credit method", () => {
    const invalidSalaried = validatePersonalLoanForm({
      ...validSalariedForm,
      employerName: "", companyName: "", jobType: "",
      monthlyNetSalary: "4000", monthlySalary: "4000",
      workExperience: "", salaryCreditMethod: "",
    });
    assert.equal(invalidSalaried.isValid, false);
    assert.equal(invalidSalaried.errors.employerName, "Enter your employer name");
    assert.equal(invalidSalaried.errors.jobType, "Please select your job type");
    assert.equal(invalidSalaried.errors.monthlyNetSalary, "Monthly net salary must be at least ₹10,000");
    assert.equal(invalidSalaried.errors.workExperience, "Please select your work experience");
    assert.equal(invalidSalaried.errors.salaryCreditMethod, "Please select how you receive your salary");
  });

  test("self-employed requires business name, nature of business, minimum income (₹10,000), and years in business", () => {
    const invalidSelf = validatePersonalLoanForm({
      ...validSelfEmployedForm,
      businessOrProfessionName: "", professionName: "", natureOfBusiness: "",
      averageMonthlyIncome: "0", monthlyIncome: "0", yearsInBusiness: "",
    });
    assert.equal(invalidSelf.isValid, false);
    assert.equal(invalidSelf.errors.businessOrProfessionName, "Enter your business or profession name");
    assert.equal(invalidSelf.errors.natureOfBusiness, "Please select nature of business");
    assert.equal(invalidSelf.errors.averageMonthlyIncome, "Average monthly income must be at least ₹10,000");
    assert.equal(invalidSelf.errors.yearsInBusiness, "Please select years in business");
  });

  test("bank statement is mandatory ONLY when salaried salary is credited to Bank Account", () => {
    // Bank Account -> Bank statement mandatory
    const bankDocs = getPersonalLoanDocuments({
      ...validSalariedForm,
      salaryCreditMethod: "Bank Account",
    });
    const bankStatementRule = bankDocs.find((d) => d.id === "bank_statement");
    assert.ok(bankStatementRule);
    assert.equal(bankStatementRule?.isMandatory, true);
    assert.deepEqual(bankStatementRule?.allowedMimeTypes, ["application/pdf"]);
    assert.deepEqual(bankStatementRule?.uploadSources, ["files"]);

    // Cash -> Bank statement NOT mandatory
    const cashDocs = getPersonalLoanDocuments({
      ...validSalariedForm,
      salaryCreditMethod: "Cash",
    });
    const cashStatementRule = cashDocs.find((d) => d.id === "bank_statement");
    assert.ok(cashStatementRule);
    assert.equal(cashStatementRule?.isMandatory, false);
    assert.deepEqual(cashStatementRule?.allowedMimeTypes, ["application/pdf"]);
    assert.deepEqual(cashStatementRule?.uploadSources, ["files"]);

    // Cheque -> Bank statement NOT mandatory
    const chequeDocs = getPersonalLoanDocuments({
      ...validSalariedForm,
      salaryCreditMethod: "Cheque",
    });
    const chequeStatementRule = chequeDocs.find((d) => d.id === "bank_statement");
    assert.ok(chequeStatementRule);
    assert.equal(chequeStatementRule?.isMandatory, false);
    assert.deepEqual(chequeStatementRule?.allowedMimeTypes, ["application/pdf"]);
    assert.deepEqual(chequeStatementRule?.uploadSources, ["files"]);
  });

  test("ITR and bank statement remain OPTIONAL for self-employed applicants", () => {
    const selfDocs = getPersonalLoanDocuments(validSelfEmployedForm);
    const itrRule = selfDocs.find((d) => d.id === "itr_acknowledgment");
    const statementRule = selfDocs.find((d) => d.id === "bank_statement");

    assert.ok(itrRule);
    assert.equal(itrRule?.isMandatory, false);
    assert.ok(statementRule);
    assert.equal(statementRule?.isMandatory, false);
    assert.deepEqual(statementRule?.allowedMimeTypes, ["application/pdf"]);
    assert.deepEqual(statementRule?.uploadSources, ["files"]);
  });

  test("store manages personal loan state transitions and preserves data", () => {
    useLoansStore.getState().selectCategory({
      id: "personal-loan",
      title: "Personal Loan",
      description: "Quick finance",
      image: { uri: "mock" } as any,
    });
    assert.equal(useLoansStore.getState().activeStep, "kyc");

    // Advance to Screen 2
    useLoansStore.getState().advanceTo("personal-employment");
    assert.equal(useLoansStore.getState().activeStep, "personal-employment");

    // Update fields
    useLoansStore.getState().setPersonalEmploymentType("salaried");
    useLoansStore.getState().setPersonalLoanField("employerName", "Wipro Limited");
    useLoansStore.getState().setPersonalLoanField("jobType", "Private");
    assert.equal(
      useLoansStore.getState().personalFormData.employerName,
      "Wipro Limited"
    );
    assert.equal(
      useLoansStore.getState().personalFormData.companyName,
      "Wipro Limited"
    );

    // Navigate back to KYC and forward again: data preserved
    useLoansStore.getState().retreatTo("kyc");
    assert.equal(useLoansStore.getState().activeStep, "kyc");
    useLoansStore.getState().advanceTo("personal-employment");
    assert.equal(
      useLoansStore.getState().personalFormData.employerName,
      "Wipro Limited"
    );
  });

  test("switching employment type preserves previously entered values across Salaried and Self-Employed", () => {
    const store = useLoansStore.getState();
    store.setPersonalEmploymentType("salaried");
    store.setPersonalLoanField("employerName", "Infosys Limited");
    store.setPersonalLoanField("monthlyNetSalary", "85000");

    // Switch to self-employed
    store.setPersonalEmploymentType("self-employed");
    store.setPersonalLoanField("businessOrProfessionName", "Apex Studio");
    store.setPersonalLoanField("averageMonthlyIncome", "95000");

    // Switch back to salaried: salaried values preserved
    store.setPersonalEmploymentType("salaried");
    const current = useLoansStore.getState().personalFormData;
    assert.equal(current.employerName, "Infosys Limited");
    assert.equal(current.monthlyNetSalary, "85000");
    // self-employed values also still in store
    assert.equal(current.businessOrProfessionName, "Apex Studio");
    assert.equal(current.averageMonthlyIncome, "95000");
  });

  test("Review -> Edit mode for Personal Loan returns directly to Review on save", () => {
    useLoansStore.getState().selectCategory({
      id: "personal-loan",
      title: "Personal Loan",
      description: "Quick finance",
      image: { uri: "mock" } as any,
    });

    // Simulate editing from review
    useLoansStore.getState().editFromReview("personal-employment");
    assert.equal(useLoansStore.getState().activeStep, "personal-employment");
    assert.equal(useLoansStore.getState().returnToReview, true);

    // Updating returns directly to review
    useLoansStore.getState().setPersonalLoanField("monthlyNetSalary", "90000");
    useLoansStore.getState().advanceTo("documents");
    assert.equal(useLoansStore.getState().activeStep, "review");
    assert.equal(useLoansStore.getState().returnToReview, false);
    assert.equal(
      useLoansStore.getState().personalFormData.monthlyNetSalary,
      "90000"
    );
  });

  test("requested amount is required, validates valid values, and rejects zero/invalid/decimal amounts", () => {
    // Empty -> error
    const emptyResult = validatePersonalLoanForm({
      ...validSalariedForm,
      loanAmount: "",
      requestedAmount: "",
    });
    assert.equal(emptyResult.isValid, false);
    assert.equal(emptyResult.errors.loanAmount, "Enter the loan amount you need.");

    // Valid amount -> passes
    const validResult = validatePersonalLoanForm({
      ...validSalariedForm,
      loanAmount: "250000",
    });
    assert.equal(validResult.isValid, true);
    assert.equal(validResult.errors.loanAmount, undefined);

    // Zero / non-numeric -> error
    const zeroResult = validatePersonalLoanForm({
      ...validSalariedForm,
      loanAmount: "0",
    });
    assert.equal(zeroResult.isValid, false);
    assert.match(zeroResult.errors.loanAmount ?? "", /Minimum personal loan amount/);

    // Decimal amount -> whole rupees error
    const decimalResult = validatePersonalLoanForm({
      ...validSalariedForm,
      loanAmount: "250000.50",
    });
    assert.equal(decimalResult.isValid, false);
    assert.equal(decimalResult.errors.loanAmount, "Enter whole rupees without paise.");
  });

  test("requested amount is preserved across employment type toggle and Review -> Edit", () => {
    const store = useLoansStore.getState();
    store.selectCategory({
      id: "personal-loan",
      title: "Personal Loan",
      description: "Quick finance",
      image: { uri: "mock" } as any,
    });
    store.setPersonalEmploymentType("salaried");
    store.setPersonalLoanField("loanAmount", "350000");
    assert.equal(useLoansStore.getState().personalFormData.loanAmount, "350000");

    // Switching employment type preserves amount
    store.setPersonalEmploymentType("self-employed");
    assert.equal(useLoansStore.getState().personalFormData.loanAmount, "350000");
    store.setPersonalEmploymentType("salaried");
    assert.equal(useLoansStore.getState().personalFormData.loanAmount, "350000");

    // Review -> Edit preserves amount
    store.editFromReview("personal-employment");
    assert.equal(useLoansStore.getState().personalFormData.loanAmount, "350000");
    store.advanceTo("documents");
    assert.equal(useLoansStore.getState().activeStep, "review");
    assert.equal(useLoansStore.getState().personalFormData.loanAmount, "350000");
  });

  test("requested amount is displayed correctly on Review and included in submission payload", async () => {
    // Review summary display
    const kyc = createInitialKycData();
    const bForm = createInitialBusinessFormData();
    const pForm = { ...validSalariedForm, loanAmount: "250000" };
    const sections = buildReviewSections(kyc, bForm, pForm, "personal-loan");
    const loanSec = sections.find((s) => s.id === "loan");
    assert.ok(loanSec);
    const amountRow = loanSec?.rows.find((r) => r.label === "Requested Loan Amount");
    assert.ok(amountRow);
    assert.equal(amountRow?.value, "₹2,50,000");

    // Submission payload inclusion
    let capturedPayload: LoanSubmissionPayload | null = null;
    setLoanSubmissionService({
      submit: async (payload) => {
        capturedPayload = payload;
        return {
          applicationId: "TXE-LN-PL1",
          submittedAt: new Date().toISOString(),
          isSyncedToServer: false,
        };
      },
    });

    const store = useLoansStore.getState();
    store.selectCategory({
      id: "personal-loan",
      title: "Personal Loan",
      description: "Quick finance",
      image: { uri: "" } as any,
    });
    store.setKycField("fullName", "Rohan Verma");
    store.setKycField("mobile", "9876543210");
    store.setKycField("pan", "ABCPE1234F");
    store.setKycField("aadhaar", "123456789012");
    store.setKycField("dob", "1990-01-01");
    store.setCurrentAddressField("houseNumber", "12-3");
    store.setCurrentAddressField("street", "MG Road");
    store.setCurrentAddressField("city", "Hyderabad");
    store.setCurrentAddressField("state", "Telangana");
    store.setCurrentAddressField("pincode", "500001");
    store.setConsent(true);
    store.setPersonalEmploymentType("salaried");
    store.setPersonalLoanField("loanAmount", "250000");
    store.setPersonalLoanField("employerName", "Infosys");
    store.setPersonalLoanField("jobType", "Private");
    store.setPersonalLoanField("monthlyNetSalary", "80000");
    store.setPersonalLoanField("workExperience", "3 - 5 years");
    store.setPersonalLoanField("salaryCreditMethod", "Cash");
    store.setDocumentAttachment("pan_card", {
      id: "pan_1", documentId: "pan_card", fileName: "pan.pdf",
      fileUri: "file:///pan.pdf", fileSize: 100, mimeType: "application/pdf", status: "selected",
    });
    store.setReviewConsent(true);

    const ok = await store.submitLoanApplication();
    assert.equal(ok, true);
    assert.ok(capturedPayload);
    const payload: LoanSubmissionPayload = capturedPayload;
    assert.equal(payload.personalFormData?.loanAmount, "250000");
    assert.equal(payload.categoryId, "personal-loan");
  });

  test("Screen 2 source asks zero questions regarding CIBIL, credit score, existing loans or EMI", () => {
    const screenPath = path.join(
      process.cwd(),
      "src/modules/loans/personalLoan/screens/PersonalLoanScreen/PersonalLoanScreen.tsx"
    );
    const screenCode = fs.readFileSync(screenPath, "utf8");
    assert.ok(
      !/cibil|credit score|existing loan|turnover|gstin|udyam/i.test(screenCode)
    );
    assert.ok(screenCode.includes("Tell us about your income"));
    assert.ok(screenCode.includes("Employment & Income"));
    assert.ok(screenCode.includes("Update & Continue"));
  });

  test("unverified profile data stays editable across Business, Working Capital, and Personal Loans", () => {
    authStorage.saveUser({
      name: "Anita Rao", mobileNumber: "9876543210", pan: "ABCPE1234F", dob: "15-08-1990",
    } as any);
    authStorage.saveSession({
      isLoggedIn: true, activeMobile: "9876543210", lastLoginAt: new Date().toISOString(),
    });

    const testCases: { id: "business-loan" | "personal-loan"; loanType?: "business-loan" | "working-capital" }[] = [
      { id: "business-loan", loanType: "business-loan" },
      { id: "business-loan", loanType: "working-capital" },
      { id: "personal-loan" },
    ];

    testCases.forEach((tc) => {
      useLoansStore.getState().resetAll();
      useLoansStore.getState().selectCategory({ id: tc.id, title: tc.id, description: "", image: { uri: "" } as any });
      if (tc.loanType) useLoansStore.getState().setLoanType(tc.loanType);
      useLoansStore.getState().populateFromUserProfile();
      const state = useLoansStore.getState();
      assert.equal(state.kycData.isProfilePrefilled, true);
    });

    const kycComponentPath = path.join(
      process.cwd(),
      "src/modules/loans/components/CustomerIdentitySection/CustomerIdentitySection.tsx"
    );
    const kycComponentCode = fs.readFileSync(kycComponentPath, "utf8");
    assert.ok(kycComponentCode.includes("const isLocked = propIsLocked === true;"));
    assert.ok(kycComponentCode.includes("Pre-filled from Profile"));
    assert.ok(!kycComponentCode.includes("data.fullName?.trim() && data.mobile?.trim()"));
    assert.ok(kycComponentCode.includes("Verified Customer Details"));
    assert.ok(kycComponentCode.includes("lock-closed"));
  });
});
