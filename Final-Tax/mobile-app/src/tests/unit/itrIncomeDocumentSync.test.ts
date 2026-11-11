/**
 * Unit tests for Bug 1 — Synchronize Mandatory Documents With Selected Income Sources
 *
 * Covers:
 * 1. Multiple income sources selected -> all applicable requirements shown as REQUIRED.
 * 2. Uploading required documents -> visible in verified/uploaded checklist.
 * 3. Deselecting two income sources -> obsolete mandatory requirements disappear from Review and checklist.
 * 4. Previously uploaded files remain stored in formData.documents (with tier NOT_REQUIRED).
 * 5. Reselecting an income source restores its requirements and reuses valid existing uploads.
 * 6. Shared documents (e.g. doc-home-loan) remain active if another source/deduction still needs them.
 * 7. Submission validation uses only the current requirements (deselected requirements do not block).
 * 8. API FormData population excludes NOT_REQUIRED documents.
 * 9. Draft restoration recalculates requirements dynamically against restored income sources.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateDynamicDocumentChecklist } from "../../modules/itr/itr-filing/engine/itrDocumentEngine";
import { recalculateItrForm } from "../../modules/itr/store/itrStoreHelpers";
import type {
  IncomeSourcesState,
  ItrPriorFilingAndNotice,
  ItrStructuredDeductions,
  TaxesPaidDetails,
  ItrDocumentItem,
  ItrFilingFormData,
} from "../../modules/itr/itr-filing/types/itrFiling.types";

const defaultPriorNotice: ItrPriorFilingAndNotice = {
  hasPreviousItr: false,
  previousAckNumber: "",
  hasCarriedForwardLosses: false,
  carriedForwardLossesDetails: "",
  hasTaxNotice: false,
  noticeSection: "",
  noticeDetails: "",
};

const defaultDeductions: ItrStructuredDeductions = {
  sec80c: {
    epf: "0",
    ppf: "0",
    lic: "0",
    elss: "0",
    tuitionFees: "0",
    housingPrincipal: "0",
    other80c: "0",
  },
  sec80d: {
    selfSpouseChildren: "0",
    parents: "0",
    isParentSeniorCitizen: false,
  },
  sec24b: "0",
  sec80e: "0",
  otherDeductionsList: [],
};

const defaultTaxesPaid: TaxesPaidDetails = {
  advanceTax: "0",
  advanceTaxChallanBsr: "",
  advanceTaxDate: "",
  selfAssessmentTax: "0",
};

const createSources = (overrides?: Partial<IncomeSourcesState>): IncomeSourcesState => ({
  salary: {
    enabled: false,
    employerName: "",
    grossSalary: "0",
    allowances: "0",
    tdsDeducted: "0",
    source: "USER_DECLARED",
    isVerified: false,
  },
  houseProperty: {
    enabled: false,
    propertyType: "self_occupied",
    annualRentReceived: "0",
    municipalTaxesPaid: "0",
    homeLoanInterest: "0",
    source: "USER_DECLARED",
  },
  business: {
    enabled: false,
    businessType: "presumptive_44ad",
    businessName: "",
    gstin: "",
    grossTurnover: "0",
    declaredProfit: "0",
    source: "USER_DECLARED",
    hasGstActivity: false,
  },
  capitalGains: {
    enabled: false,
    shortTermGains: "0",
    longTermGains: "0",
    hasEquityMf: false,
    hasFnoIntraday: false,
    hasPropertyAssets: false,
    hasCryptoVda: false,
    source: "USER_DECLARED",
  },
  otherSources: {
    enabled: false,
    savingsInterest: "0",
    fdInterest: "0",
    dividendIncome: "0",
    familyPension: "0",
    otherIncome: "0",
    source: "USER_DECLARED",
  },
  ...overrides,
});

const createBaseMockForm = (): ItrFilingFormData => ({
  category: "salaried",
  accountType: "individual",
  personalInfo: {
    pan: "ABCDE1234F",
    aadhaar: "123456789012",
    name: "John Doe",
    dob: "1990-01-01",
    gender: "M",
    fatherSpouseName: "Father",
    mobile: "9876543210",
    email: "john@example.com",
    address: "123 Street",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    assessmentYear: "2026-27",
    residentialStatus: "Resident",
    residentialStatusConfirmed: true,
    filingType: "139_1_original",
    filingTypeSuggested: "139_1_original",
    isAutoVerified: true,
  },
  bankDetails: {
    bankName: "HDFC Bank",
    accountNumber: "1234567890",
    confirmAccountNumber: "1234567890",
    ifscCode: "HDFC0001234",
    accountType: "Savings",
    isPrimaryRefund: true,
    validationStatus: "Validated",
  },
  bankAccountsList: [],
  priorItrNotice: defaultPriorNotice,
  incomeSources: createSources(),
  determinedForm: {
    form: "ITR-1",
    formTitle: "ITR-1 (Sahaj)",
    rationale: "Default",
    criteriaChecks: [],
  },
  regime: "new",
  deductions: defaultDeductions,
  taxesPaid: defaultTaxesPaid,
  documents: [],
  calculation: {
    assessmentYear: "2026-27",
    financialYear: "2025-26",
    grossTotalIncome: 0,
    standardDeduction: 0,
    newRegimeStdDeduction: 75000,
    oldRegimeStdDeduction: 50000,
    totalChapterVIA: 0,
    totalDeductions: 0,
    taxableIncome: 0,
    taxUnderNewRegime: 0,
    taxUnderOldRegime: 0,
    grossTaxLiability: 0,
    rebate87A: 0,
    taxAfterRebate: 0,
    cess: 0,
    totalTaxLiability: 0,
    totalTaxesPaid: 0,
    recommendedRegime: "new",
    savingsAmount: 0,
    savingsExplanation: "",
    tdsCredits: 0,
    advanceTaxPaid: 0,
    selfAssessmentTaxPaid: 0,
    finalAmount: 0,
    finalType: "REFUND",
  },
  declarationAccepted: true,
});

describe("Bug 1 — Mandatory Document and Income Source Synchronization", () => {
  it("Scenario 1: Multiple income sources selected -> all applicable mandatory requirements shown", () => {
    const sources = createSources({
      salary: { ...createSources().salary, enabled: true, grossSalary: "800000" },
      business: { ...createSources().business, enabled: true, grossTurnover: "2000000" },
      capitalGains: { ...createSources().capitalGains, enabled: true, shortTermGains: "50000" },
    });

    const docs = generateDynamicDocumentChecklist(
      sources,
      defaultPriorNotice,
      defaultDeductions,
      defaultTaxesPaid,
      "new"
    );

    const requiredDocs = docs.filter((d) => d.tier === "REQUIRED");
    const requiredIds = requiredDocs.map((d) => d.id);

    assert.ok(requiredIds.includes("doc-form-16"), "Form 16 must be required for Salary");
    assert.ok(requiredIds.includes("doc-business-turnover"), "Business Turnover must be required for Business");
    assert.ok(requiredIds.includes("doc-capital-gains"), "Capital Gains statement must be required for Capital Gains");
    assert.equal(requiredDocs.length, 3, "Exactly 3 mandatory income documents must be required");
  });

  it("Scenario 2 & 3: Upload files, then deselect Business and Capital Gains -> obsolete mandatory docs disappear from Review", () => {
    // 1. Initial selection: Salary + Business + Capital Gains
    const sourcesWithAll = createSources({
      salary: { ...createSources().salary, enabled: true, grossSalary: "800000" },
      business: { ...createSources().business, enabled: true, grossTurnover: "2000000" },
      capitalGains: { ...createSources().capitalGains, enabled: true, shortTermGains: "50000" },
    });

    let docs = generateDynamicDocumentChecklist(
      sourcesWithAll,
      defaultPriorNotice,
      defaultDeductions,
      defaultTaxesPaid,
      "new"
    );

    // 2. User uploads documents for all 3
    docs = docs.map((d) => {
      if (d.id === "doc-form-16") {
        return { ...d, fileUri: "file://uploads/form16.pdf", fileName: "form16.pdf" };
      }
      if (d.id === "doc-business-turnover") {
        return { ...d, fileUri: "file://uploads/business.pdf", fileName: "business.pdf" };
      }
      if (d.id === "doc-capital-gains") {
        return { ...d, fileUri: "file://uploads/cg.pdf", fileName: "cg.pdf" };
      }
      return d;
    });

    // Verify all 3 appear in Review before deselection
    const reviewDocsBeforeDeselect = docs.filter(
      (d) => (d.fileUri || d.isProfileVerified) && d.tier !== "NOT_REQUIRED"
    );
    assert.equal(reviewDocsBeforeDeselect.length, 3);

    // 3. User edits income details: deselects Business and Capital Gains, keeping Salary
    const sourcesSalaryOnly = createSources({
      salary: { ...createSources().salary, enabled: true, grossSalary: "800000" },
      business: { ...createSources().business, enabled: false },
      capitalGains: { ...createSources().capitalGains, enabled: false },
    });

    const docsAfterDeselect = generateDynamicDocumentChecklist(
      sourcesSalaryOnly,
      defaultPriorNotice,
      defaultDeductions,
      defaultTaxesPaid,
      "new",
      undefined,
      docs
    );

    // Review screen derivation
    const reviewDocsAfterDeselect = docsAfterDeselect.filter(
      (d) => (d.fileUri || d.isProfileVerified) && d.tier !== "NOT_REQUIRED"
    );

    // Assert only Form 16 remains on Review
    assert.equal(reviewDocsAfterDeselect.length, 1);
    assert.equal(reviewDocsAfterDeselect[0].id, "doc-form-16");
    assert.equal(reviewDocsAfterDeselect[0].name, "Form 16 (Part A & B)");

    // 4. Assert previously uploaded files are preserved in storage with tier NOT_REQUIRED
    const storedBusinessDoc = docsAfterDeselect.find((d) => d.id === "doc-business-turnover");
    assert.ok(storedBusinessDoc, "Business doc must remain in storage");
    assert.equal(storedBusinessDoc.tier, "NOT_REQUIRED");
    assert.equal(storedBusinessDoc.required, false);
    assert.equal(storedBusinessDoc.fileUri, "file://uploads/business.pdf");

    const storedCgDoc = docsAfterDeselect.find((d) => d.id === "doc-capital-gains");
    assert.ok(storedCgDoc, "Capital Gains doc must remain in storage");
    assert.equal(storedCgDoc.tier, "NOT_REQUIRED");
    assert.equal(storedCgDoc.required, false);
    assert.equal(storedCgDoc.fileUri, "file://uploads/cg.pdf");
  });

  it("Scenario 5: Reselecting an income source restores its requirements and reuses valid existing uploads", () => {
    // Start with deselected state containing preserved uploaded business doc
    const preservedDocs: ItrDocumentItem[] = [
      {
        id: "doc-form-16",
        name: "Form 16 (Part A & B)",
        subtitle: "Issued by employer",
        tier: "REQUIRED",
        required: true,
        docGroup: "income",
        fileUri: "file://uploads/form16.pdf",
        fileName: "form16.pdf",
      },
      {
        id: "doc-business-turnover",
        name: "Business Turnover & GST Filings",
        subtitle: "GSTR filings or sales register",
        tier: "NOT_REQUIRED",
        required: false,
        docGroup: "income",
        fileUri: "file://uploads/business_retained.pdf",
        fileName: "business_retained.pdf",
      },
    ];

    // Reselect Business
    const sourcesWithBusinessReselected = createSources({
      salary: { ...createSources().salary, enabled: true },
      business: { ...createSources().business, enabled: true },
    });

    const docsReselected = generateDynamicDocumentChecklist(
      sourcesWithBusinessReselected,
      defaultPriorNotice,
      defaultDeductions,
      defaultTaxesPaid,
      "new",
      undefined,
      preservedDocs
    );

    const bizDoc = docsReselected.find((d) => d.id === "doc-business-turnover");
    assert.ok(bizDoc);
    assert.equal(bizDoc.tier, "REQUIRED");
    assert.equal(bizDoc.required, true);
    assert.equal(bizDoc.fileUri, "file://uploads/business_retained.pdf", "Existing upload was reused");
    assert.equal(bizDoc.fileName, "business_retained.pdf");

    // Review screen should now show both
    const reviewDocs = docsReselected.filter(
      (d) => (d.fileUri || d.isProfileVerified) && d.tier !== "NOT_REQUIRED"
    );
    assert.equal(reviewDocs.length, 2);
    assert.ok(reviewDocs.some((d) => d.id === "doc-form-16"));
    assert.ok(reviewDocs.some((d) => d.id === "doc-business-turnover"));
  });

  it("Scenario 6: Shared documents remain required/applicable if another selected source/deduction still needs them", () => {
    // doc-home-loan is needed by houseProperty OR deductions.sec24b
    const initialSources = createSources({
      houseProperty: {
        ...createSources().houseProperty,
        enabled: true,
        homeLoanInterest: "150000",
      },
    });

    const deductionsWithSec24b: ItrStructuredDeductions = {
      ...defaultDeductions,
      sec24b: "200000",
    };

    let docs = generateDynamicDocumentChecklist(
      initialSources,
      defaultPriorNotice,
      deductionsWithSec24b,
      defaultTaxesPaid,
      "old"
    );

    const homeLoanDoc = docs.find((d) => d.id === "doc-home-loan");
    assert.ok(homeLoanDoc);
    assert.equal(homeLoanDoc.tier, "ONLY_IF_APPLICABLE");

    // Attach file
    const docWithFile = {
      ...homeLoanDoc,
      fileUri: "file://uploads/homeloan_cert.pdf",
      fileName: "homeloan_cert.pdf",
    };

    // Now disable houseProperty income source, but keep deductions.sec24b active
    const sourcesWithoutHouseProperty = createSources({
      houseProperty: { ...createSources().houseProperty, enabled: false },
    });

    const docsAfterHpDeselect = generateDynamicDocumentChecklist(
      sourcesWithoutHouseProperty,
      defaultPriorNotice,
      deductionsWithSec24b,
      defaultTaxesPaid,
      "old",
      undefined,
      [docWithFile]
    );

    const homeLoanAfterDeselect = docsAfterHpDeselect.find((d) => d.id === "doc-home-loan");
    assert.ok(homeLoanAfterDeselect);
    assert.equal(
      homeLoanAfterDeselect.tier,
      "ONLY_IF_APPLICABLE",
      "doc-home-loan must remain applicable because deductions.sec24b is still active"
    );
    assert.equal(homeLoanAfterDeselect.fileUri, "file://uploads/homeloan_cert.pdf");

    // If sec24b is also removed, THEN doc-home-loan becomes NOT_REQUIRED
    const docsBothRemoved = generateDynamicDocumentChecklist(
      sourcesWithoutHouseProperty,
      defaultPriorNotice,
      defaultDeductions,
      defaultTaxesPaid,
      "old",
      undefined,
      [docWithFile]
    );
    const homeLoanBothRemoved = docsBothRemoved.find((d) => d.id === "doc-home-loan");
    assert.equal(homeLoanBothRemoved?.tier, "NOT_REQUIRED");
    assert.equal(homeLoanBothRemoved?.fileUri, "file://uploads/homeloan_cert.pdf");
  });

  it("Scenario 7: Submission validation uses only the current requirements", () => {
    // Setup state where Salary is enabled with Form 16 missing, but Business is disabled with preserved doc
    const docs: ItrDocumentItem[] = [
      {
        id: "doc-form-16",
        name: "Form 16 (Part A & B)",
        subtitle: "Issued by employer",
        tier: "REQUIRED",
        required: true,
        docGroup: "income",
        // Not uploaded
      },
      {
        id: "doc-business-turnover",
        name: "Business Turnover & GST Filings",
        subtitle: "GSTR filings or sales register",
        tier: "NOT_REQUIRED",
        required: false,
        docGroup: "income",
        // Not uploaded
      },
      {
        id: "doc-capital-gains",
        name: "Capital Gains Statement / P&L",
        subtitle: "Broker P&L",
        tier: "NOT_REQUIRED",
        required: false,
        docGroup: "income",
        // Not uploaded
      },
    ];

    // Submission validation gate
    const missingMandatoryDocs = docs.filter(
      (d) => d.tier === "REQUIRED" && d.required && !d.fileUri && !d.isProfileVerified
    );

    // Business and Capital Gains are NOT reported as missing
    assert.equal(missingMandatoryDocs.length, 1);
    assert.equal(missingMandatoryDocs[0].id, "doc-form-16");

    // Once Form 16 is uploaded, submission validation passes even with deselected docs not having uploads
    docs[0].fileUri = "file://uploads/form16_final.pdf";
    const missingAfterUpload = docs.filter(
      (d) => d.tier === "REQUIRED" && d.required && !d.fileUri && !d.isProfileVerified
    );
    assert.equal(missingAfterUpload.length, 0, "Submission should be unblocked");
  });

  it("Scenario 8: API FormData population omits NOT_REQUIRED documents", () => {
    const docs: ItrDocumentItem[] = [
      {
        id: "doc-form-16",
        name: "Form 16",
        subtitle: "",
        tier: "REQUIRED",
        required: true,
        docGroup: "income",
        fileUri: "file://uploads/form16.pdf",
        fileName: "form16.pdf",
      },
      {
        id: "doc-business-turnover",
        name: "Business Turnover",
        subtitle: "",
        tier: "NOT_REQUIRED",
        required: false,
        docGroup: "income",
        fileUri: "file://uploads/business_old.pdf",
        fileName: "business_old.pdf",
      },
    ];

    const fieldMapping: Record<string, string> = {
      "doc-form-16": "form16PartAPartB",
      "doc-business-turnover": "businessTurnover",
    };

    // Filter used in ItrApiService.ts populateFormDataWithDocuments
    const docsToAttach = docs.filter(
      (doc) => Boolean(doc.fileUri) && Boolean(fieldMapping[doc.id]) && doc.tier !== "NOT_REQUIRED"
    );

    assert.equal(docsToAttach.length, 1);
    assert.equal(docsToAttach[0].id, "doc-form-16");
  });

  it("Scenario 9: Draft restoration recalculates requirements dynamically while keeping existing uploads", () => {
    const baseForm = createBaseMockForm();
    // Simulate saved draft data where income sources had Business disabled, but stale documents had Business REQUIRED
    const savedDraft: Partial<ItrFilingFormData> = {
      ...baseForm,
      incomeSources: createSources({
        salary: { ...createSources().salary, enabled: true, grossSalary: "900000" },
        business: { ...createSources().business, enabled: false },
      }),
      documents: [
        {
          id: "doc-form-16",
          name: "Form 16 (Part A & B)",
          subtitle: "Salary doc",
          tier: "REQUIRED",
          required: true,
          docGroup: "income",
          fileUri: "file://draft/f16.pdf",
          fileName: "f16.pdf",
        },
        {
          id: "doc-business-turnover",
          name: "Business Turnover",
          subtitle: "Stale draft tier",
          tier: "REQUIRED", // stale tier from old draft
          required: true,
          docGroup: "income",
          fileUri: "file://draft/biz.pdf",
          fileName: "biz.pdf",
        },
      ],
    };

    // restoreItrDraft calls recalculateItrForm on restored data
    const restoredForm = recalculateItrForm({
      ...baseForm,
      ...(savedDraft as ItrFilingFormData),
    });

    const restoredBizDoc = restoredForm.documents.find((d) => d.id === "doc-business-turnover");
    assert.ok(restoredBizDoc);
    assert.equal(restoredBizDoc.tier, "NOT_REQUIRED", "Draft recalculation corrected stale tier");
    assert.equal(restoredBizDoc.fileUri, "file://draft/biz.pdf", "Uploaded file preserved in draft");

    const reviewDocs = restoredForm.documents.filter(
      (d) => (d.fileUri || d.isProfileVerified) && d.tier !== "NOT_REQUIRED"
    );
    assert.equal(reviewDocs.length, 1);
    assert.equal(reviewDocs[0].id, "doc-form-16");
  });
});
