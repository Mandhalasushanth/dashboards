/// <reference types="node" />
import assert from "node:assert/strict";
import { test, describe } from "node:test";
import { getRequiredDocuments } from "../../modules/loans/constants/loanDocuments";
import { validateReviewSubmission } from "../../modules/loans/validation/loanReviewValidation";
import { useLoansStore } from "../../modules/loans/store/loansStore";
import type { BusinessLoanFormData } from "../../modules/loans/businessWorkingCapital/types/businessLoan.types";
import type { LoanKycData } from "../../modules/loans/types/loanKyc.types";
import type { LoanDocumentUpload } from "../../modules/loans/types/loanReview.types";

const mockKycData: LoanKycData = {
  fullName: "Rajesh Sharma",
  mobile: "9876543210",
  email: "rajesh.sharma@example.com",
  pan: "ABCPE1234F",
  aadhaar: "234567890123",
  dob: "15-08-1985",
  currentAddress: {
    houseNumber: "Flat 402, Sai Residency",
    street: "MG Road",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500001",
  },
  isPermanentSameAsCurrent: true,
  permanentAddress: {
    houseNumber: "Flat 402, Sai Residency",
    street: "MG Road",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500001",
  },
  consentGiven: true,
  isProfilePrefilled: false,
};

const mockBusinessFormData: BusinessLoanFormData = {
  loanType: "business-loan",
  businessProfile: {
    businessName: "Sharma Enterprises Pvt Ltd",
    constitution: "Private Limited Company",
    constitutionOther: "",
    businessActivity: "Manufacturing",
    activityOther: "",
    establishmentDate: "10-05-2019",
    businessAddress: "Plot 12, Industrial Area",
    pincode: "500051",
    isGstRegistered: true,
    gstin: "36ABCDE1234F1Z5",
    udyamRegistration: "UDYAM-TS-01-0001234",
  },
  businessLoan: {
    loanAmount: "2500000",
    purpose: "Equipment Purchase",
    purposeOther: "",
    purposeDescription: "Procurement of high precision CNC cutting tools",
    projectCost: "3200000",
  },
  workingCapital: {
    loanAmount: "1500000",
    purpose: "Inventory Purchase",
    purposeOther: "",
    purposeDescription: "Seasonal raw material stock buildup",
    monthlySales: "2000000",
    monthlyExpenses: "1400000",
  },
};

const createMockUpload = (docId: string, name: string): LoanDocumentUpload => ({
  id: `${docId}_123`,
  documentId: docId,
  fileName: name,
  fileUri: `file:///storage/docs/${name}`,
  fileSize: 1.5 * 1024 * 1024,
  mimeType: "application/pdf",
  status: "selected",
});

describe("Screen 3: Review & Document Submission Suite", () => {
  test("getRequiredDocuments configures dynamic documents for Business Loan", () => {
    const docs = getRequiredDocuments("business-loan", mockBusinessFormData);
    const docIds = docs.map((d) => d.id);

    assert.ok(docIds.includes("pan_card"));
    assert.ok(docIds.includes("business_proof"));
    assert.ok(docIds.includes("project_quotation"));
    assert.ok(docIds.includes("bank_statement"));

    // For Equipment Purchase, project_quotation is mandatory
    const quotation = docs.find((d) => d.id === "project_quotation");
    assert.equal(quotation?.isMandatory, true);

    // Bank statement is optional for business-loan
    const bankDoc = docs.find((d) => d.id === "bank_statement");
    assert.equal(bankDoc?.isMandatory, false);
  });

  test("getRequiredDocuments configures dynamic documents for Working Capital Loan", () => {
    const wcFormData: BusinessLoanFormData = {
      ...mockBusinessFormData,
      loanType: "working-capital",
    };
    const docs = getRequiredDocuments("working-capital", wcFormData);
    const docIds = docs.map((d) => d.id);

    assert.ok(docIds.includes("pan_card"));
    assert.ok(docIds.includes("bank_statement"));
    assert.ok(docIds.includes("gst_certificate"));

    // Bank statement is mandatory for working capital
    const bankDoc = docs.find((d) => d.id === "bank_statement");
    assert.equal(bankDoc?.isMandatory, true);

    // GST certificate is mandatory when registered
    const gstDoc = docs.find((d) => d.id === "gst_certificate");
    assert.equal(gstDoc?.isMandatory, true);
  });

  test("validateReviewSubmission fails when mandatory documents are missing", () => {
    const emptyDocs: Record<string, LoanDocumentUpload> = {};
    const res = validateReviewSubmission(
      mockKycData,
      mockBusinessFormData,
      emptyDocs,
      true
    );

    assert.equal(res.isValid, false);
    assert.ok(res.errors.documents?.pan_card);
    assert.ok(res.errors.documents?.business_proof);
  });

  test("review rejects invalid KYC for Business, Vehicle and Machinery", () => {
    const invalidKyc = {
      ...mockKycData,
      consentGiven: false,
      currentAddress: { ...mockKycData.currentAddress, state: "Atlantis" },
    };
    const categoryIds = ["business-loan", "vehicle-loan", "machinery-loan"] as const;
    categoryIds.forEach((categoryId) => {
      const result = validateReviewSubmission(
        invalidKyc,
        mockBusinessFormData,
        {},
        true,
        undefined,
        categoryId
      );
      assert.equal(result.isValid, false, categoryId);
      assert.ok(result.errors.applicant, categoryId);
    });
  });

  test("review treats zero-byte mandatory document uploads as missing", () => {
    const uploads: Record<string, LoanDocumentUpload> = {
      pan_card: { ...createMockUpload("pan_card", "PAN.pdf"), fileSize: 0 },
      business_proof: createMockUpload("business_proof", "Business.pdf"),
      project_quotation: createMockUpload("project_quotation", "Quote.pdf"),
    };
    const result = validateReviewSubmission(
      mockKycData,
      mockBusinessFormData,
      uploads,
      true
    );
    assert.equal(result.isValid, false);
    assert.match(result.errors.documents?.pan_card ?? "", /empty/);
  });

  test("validateReviewSubmission fails when confirmation consent is missing", () => {
    const completeDocs: Record<string, LoanDocumentUpload> = {
      pan_card: createMockUpload("pan_card", "PAN_Card.pdf"),
      business_proof: createMockUpload("business_proof", "Udyam.pdf"),
      project_quotation: createMockUpload("project_quotation", "Invoice.pdf"),
    };

    const res = validateReviewSubmission(
      mockKycData,
      mockBusinessFormData,
      completeDocs,
      false // consent not given
    );

    assert.equal(res.isValid, false);
    assert.ok(res.errors.consent);
    assert.match(res.errors.consent, /accurate/i);
  });

  test("validateReviewSubmission passes with all mandatory documents and consent", () => {
    const completeDocs: Record<string, LoanDocumentUpload> = {
      pan_card: createMockUpload("pan_card", "PAN_Card.pdf"),
      business_proof: createMockUpload("business_proof", "Udyam.pdf"),
      project_quotation: createMockUpload("project_quotation", "Invoice.pdf"),
    };

    const res = validateReviewSubmission(
      mockKycData,
      mockBusinessFormData,
      completeDocs,
      true
    );

    assert.equal(res.isValid, true, JSON.stringify(res.errors));
    assert.equal(Object.keys(res.errors.documents || {}).length, 0);
    assert.equal(res.errors.consent, undefined);
  });

  test("useLoansStore maintains full application state across step navigation and edits", async () => {
    const store = useLoansStore.getState();
    store.resetAll();

    // Step 1: Set KYC data
    store.selectCategory({
      id: "business-loan",
      title: "Business & Working Capital",
      description: "Business Credit",
      image: { uri: "test" },
    });
    useLoansStore.setState({ kycData: mockKycData });

    // Advance to Step 2
    store.setActiveStep("business-details");
    store.setLoanType("business-loan");
    store.setBusinessProfileField("businessName", "Sharma Enterprises Pvt Ltd");
    store.setBusinessProfileField("constitution", "Private Limited Company");
    store.setBusinessProfileField("pincode", "500051");
    store.setBusinessLoanField("loanAmount", "2500000");
    store.setBusinessLoanField("purpose", "Equipment Purchase");

    // Advance to Step 3: Review & Document Submission
    store.setActiveStep("review");
    assert.equal(useLoansStore.getState().activeStep, "review");

    // Attach documents
    store.setDocumentAttachment("pan_card", createMockUpload("pan_card", "PAN.pdf"));
    store.setDocumentAttachment("business_proof", createMockUpload("business_proof", "Inc.pdf"));
    store.setDocumentAttachment("project_quotation", createMockUpload("project_quotation", "Quote.pdf"));
    store.setReviewConsent(true);

    // Navigate back to Step 1: Edit KYC
    store.setActiveStep("kyc");
    assert.equal(useLoansStore.getState().activeStep, "kyc");
    assert.equal(useLoansStore.getState().kycData.fullName, "Rajesh Sharma");

    // Update KYC name during edit
    store.setKycField("fullName", "Rajesh Kumar Sharma");

    // Return directly to Step 3: Review
    store.setActiveStep("review");
    assert.equal(useLoansStore.getState().activeStep, "review");
    // Updated KYC name is reflected
    assert.equal(useLoansStore.getState().kycData.fullName, "Rajesh Kumar Sharma");
    // Uploaded documents are completely intact
    assert.ok(useLoansStore.getState().uploadedDocuments.pan_card);
    assert.ok(useLoansStore.getState().uploadedDocuments.business_proof);
    assert.ok(useLoansStore.getState().uploadedDocuments.project_quotation);
    assert.equal(useLoansStore.getState().isReviewConsentGiven, true);

    // Submit application
    const submitted = await store.submitLoanApplication();
    assert.equal(submitted, true, JSON.stringify(useLoansStore.getState().reviewErrors));
    assert.equal(useLoansStore.getState().activeStep, "submitted");
    assert.ok(useLoansStore.getState().submittedApplicationId?.startsWith("TXE-LN-"));
  });
});
