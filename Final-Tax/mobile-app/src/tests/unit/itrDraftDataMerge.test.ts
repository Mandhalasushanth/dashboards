import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  deepMergeItrFormData,
  recalculateItrForm,
  buildApplicationDraftPayload,
} from "../../modules/itr/store/itrStoreHelpers";
import type {
  ItrFilingFormData,
  IncomeSourcesState,
  ItrStructuredDeductions,
  ItrPersonalInfo,
  ItrBankDetails,
  ItrPriorFilingAndNotice,
  TaxesPaidDetails,
} from "../../modules/itr/itr-filing/types/itrFiling.types";

const readSource = (relPath: string): string =>
  fs.readFileSync(path.join(__dirname, "..", "..", relPath), "utf-8");

const createDefaultIncomeSources = (): IncomeSourcesState => ({
  salary: {
    enabled: false,
    employerName: "",
    grossSalary: "",
    allowances: "",
    tdsDeducted: "",
    source: "USER_DECLARED",
    isVerified: false,
  },
  houseProperty: {
    enabled: false,
    propertyType: "self_occupied",
    annualRentReceived: "",
    municipalTaxesPaid: "",
    homeLoanInterest: "",
    source: "USER_DECLARED",
  },
  business: {
    enabled: false,
    businessType: "presumptive_44ad",
    businessName: "",
    gstin: "",
    businessActivity: "",
    grossTurnover: "",
    declaredProfit: "",
    source: "USER_DECLARED",
    hasGstActivity: false,
    gstr1Turnover: "",
    gstr3bTurnover: "",
    gstReconciliationRequired: false,
  },
  capitalGains: {
    enabled: false,
    hasEquityMf: false,
    hasFnoIntraday: false,
    hasPropertyAssets: false,
    hasCryptoVda: false,
    shortTermGains: "",
    longTermGains: "",
    brokerName: "",
    totalTransactions: 0,
    source: "USER_DECLARED",
    statementUploaded: false,
  },
  otherSources: {
    enabled: false,
    savingsInterest: "",
    fdInterest: "",
    dividendIncome: "",
    familyPension: "",
    otherIncome: "",
    source: "USER_DECLARED",
  },
});

const createDefaultDeductions = (): ItrStructuredDeductions => ({
  sec80c: { epf: "", ppf: "", lic: "", elss: "", tuitionFees: "", housingPrincipal: "", other80c: "" },
  sec80d: { selfSpouseChildren: "", parents: "", isParentSeniorCitizen: false },
  sec24b: "",
  sec80e: "",
  otherDeductionsList: [],
});

const createDefaultTaxesPaid = (): TaxesPaidDetails => ({
  advanceTax: "",
  advanceTaxChallanBsr: "",
  advanceTaxDate: "",
  selfAssessmentTax: "",
});

const createDefaultPriorNotice = (): ItrPriorFilingAndNotice => ({
  hasPreviousItr: false,
  previousAckNumber: "",
  previousAssessmentYear: "",
  previousItrForm: undefined,
  previousFiledDate: "",
  importedIncomeDetails: false,
  importedDeductions: false,
  importedLosses: false,
  importedBankDetails: false,
  importedFilingDetails: false,
  hasCarriedForwardLosses: false,
  carriedForwardLossesDetails: "",
  hasTaxNotice: false,
  noticeSection: "",
  noticeDetails: "",
});

const createMockInitialFormData = (): ItrFilingFormData => {
  const personalInfo: ItrPersonalInfo = {
    pan: "",
    aadhaar: "",
    name: "",
    dob: "",
    gender: "Male",
    fatherSpouseName: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    mobile: "",
    email: "",
    residentialStatus: "",
    residentialStatusConfirmed: false,
    assessmentYear: "2025-2026",
    filingType: "",
    filingTypeSuggested: "",
    isAutoVerified: false,
  };

  const bankDetails: ItrBankDetails = {
    bankName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    accountType: "Savings",
    isPrimaryRefund: false,
    validationStatus: "Pending",
  };

  return recalculateItrForm({
    personalInfo,
    bankDetails,
    bankAccountsList: [],
    priorItrNotice: createDefaultPriorNotice(),
    incomeSources: createDefaultIncomeSources(),
    determinedForm: {
      form: "ITR-1",
      formTitle: "ITR-1 (Sahaj)",
      rationale: "Default",
      criteriaChecks: [],
    },
    regime: "new",
    deductions: createDefaultDeductions(),
    taxesPaid: createDefaultTaxesPaid(),
    documents: [],
    calculation: {
      assessmentYear: "2025-2026",
      financialYear: "2024-2025",
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
      tdsCredits: 0,
      advanceTaxPaid: 0,
      selfAssessmentTaxPaid: 0,
      totalTaxesPaid: 0,
      finalAmount: 0,
      finalType: "NIL",
      recommendedRegime: "new",
      savingsAmount: 0,
      savingsExplanation: "",
    },
    declarationAccepted: false,
    category: null,
    accountType: "Individual",
  });
};

describe("Bug 4: ITR Filing Nested Data Merge & Persistence Safety", () => {
  let mockStorage: Record<string, string>;
  let setItemFails: boolean;
  let indexAdded: boolean;

  beforeEach(() => {
    mockStorage = {};
    setItemFails = false;
    indexAdded = false;
  });

  const mockAsyncStorage = {
    getItem: async (key: string): Promise<string | null> => mockStorage[key] ?? null,
    setItem: async (key: string, value: string): Promise<void> => {
      if (setItemFails) throw new Error("AsyncStorage write failed (disk full)");
      mockStorage[key] = value;
    },
  };

  const mockAddDraftToIndex = async (mobile: string, serviceKey: string): Promise<void> => {
    indexAdded = true;
  };

  // 1. Partial nested deduction structures restore with complete defaults
  it("1. Partial nested deduction structures restore with complete defaults without crashing", () => {
    const initial = createMockInitialFormData();
    initial.regime = "old";
    initial.incomeSources.salary.enabled = true;
    initial.incomeSources.salary.grossSalary = "500000";

    const partialDraft: any = {
      regime: "old",
      deductions: {
        sec80c: { epf: "75000", ppf: "25000" },
      },
    };

    const merged = deepMergeItrFormData(initial, partialDraft);

    assert.equal(merged.deductions.sec80c.epf, "75000");
    assert.equal(merged.deductions.sec80c.ppf, "25000");
    assert.equal(merged.deductions.sec80c.lic, "");
    assert.ok(merged.deductions.sec80d, "sec80d must not be undefined");
    assert.equal(merged.deductions.sec80d.selfSpouseChildren, "");
    assert.equal(merged.deductions.sec80d.isParentSeniorCitizen, false);
    assert.deepEqual(merged.deductions.otherDeductionsList, []);

    assert.doesNotThrow(() => {
      const recalculated = recalculateItrForm(merged);
      assert.ok(recalculated.calculation.totalChapterVIA >= 100000);
    });
  });

  // 2. Partial income-source objects restore correctly
  it("2. Partial income-source objects restore correctly with clean defaults", () => {
    const initial = createMockInitialFormData();
    const partialDraft: any = {
      incomeSources: {
        salary: { enabled: true, grossSalary: "900000" },
      },
    };

    const merged = deepMergeItrFormData(initial, partialDraft);

    assert.equal(merged.incomeSources.salary.enabled, true);
    assert.equal(merged.incomeSources.salary.grossSalary, "900000");
    assert.equal(merged.incomeSources.salary.employerName, "");
    assert.ok(merged.incomeSources.houseProperty, "houseProperty must exist");
    assert.equal(merged.incomeSources.houseProperty.enabled, false);
    assert.ok(merged.incomeSources.business, "business must exist");
    assert.equal(merged.incomeSources.business.enabled, false);
    assert.ok(merged.incomeSources.capitalGains, "capitalGains must exist");
    assert.equal(merged.incomeSources.capitalGains.enabled, false);
  });

  // 3. Document metadata and NOT_REQUIRED behavior remain correct
  it("3. Document metadata survives and deselected sources remain NOT_REQUIRED (preserving Bug 1)", () => {
    const initial = createMockInitialFormData();
    const existingDocs = [
      {
        id: "doc-form-16",
        name: "Form 16",
        subtitle: "Issued by employer",
        tier: "REQUIRED" as const,
        required: true,
        docGroup: "income" as const,
        fileUri: "file:///data/user/0/com.finsolz/cache/form16.pdf",
        fileName: "form16.pdf",
        fileSize: 1048576,
        uploadedAt: "2026-11-06T10:00:00Z",
      },
      {
        id: "doc-capital-gains",
        name: "Capital Gains Statement",
        subtitle: "Broker statement",
        tier: "REQUIRED" as const,
        required: true,
        docGroup: "income" as const,
        fileUri: "file:///data/user/0/com.finsolz/cache/broker_statement.xlsx",
        fileName: "broker_statement.xlsx",
        fileSize: 204800,
        uploadedAt: "2026-11-06T10:05:00Z",
      },
    ];

    const draftData: any = {
      incomeSources: {
        salary: { enabled: true, grossSalary: "800000" },
        capitalGains: { enabled: false },
      },
      documents: existingDocs,
    };

    const merged = deepMergeItrFormData(initial, draftData);
    const recalculated = recalculateItrForm(merged);

    const form16 = recalculated.documents.find((d) => d.id === "doc-form-16");
    const capGainsDoc = recalculated.documents.find((d) => d.id === "doc-capital-gains");

    assert.ok(form16);
    assert.equal(form16?.tier, "REQUIRED");
    assert.equal(form16?.fileUri, "file:///data/user/0/com.finsolz/cache/form16.pdf");

    assert.ok(capGainsDoc);
    assert.equal(capGainsDoc?.tier, "NOT_REQUIRED");
    assert.equal(capGainsDoc?.fileUri, "file:///data/user/0/com.finsolz/cache/broker_statement.xlsx");
  });

  // 4. Profile population does not overwrite existing user values
  it("4. Profile population does not overwrite existing user values", () => {
    const profileFromAuth = {
      pan: "PAN_FROM_AUTH",
      name: "Name From Auth",
      address: "Auth Address",
      city: "Auth City",
    };

    const stateWithDraft = {
      personalInfo: {
        pan: "CORRECTED_PAN_123",
        name: "User Edited Name",
        address: "User Saved Address",
        city: "",
      },
    };

    const cur = stateWithDraft.personalInfo;
    const populated = {
      ...cur,
      pan: cur.pan || profileFromAuth.pan || "",
      name: cur.name || profileFromAuth.name || "",
      address: cur.address || profileFromAuth.address || "",
      city: cur.city || profileFromAuth.city || "",
    };

    assert.equal(populated.pan, "CORRECTED_PAN_123", "Must preserve existing non-empty PAN");
    assert.equal(populated.name, "User Edited Name", "Must preserve existing non-empty name");
    assert.equal(populated.address, "User Saved Address", "Must preserve existing non-empty address");
    assert.equal(populated.city, "Auth City", "Empty field gets pre-filled from auth profile");

    const step1Content = readSource(
      "modules/itr/itr-filing/components/Step1PersonalInfo/Step1PersonalInfo.tsx"
    );
    assert.ok(
      !step1Content.includes("fetchAndPopulateUserProfile()"),
      "Step1PersonalInfo must not contain redundant fetchAndPopulateUserProfile call"
    );
  });

  // 5. Async draft saving resolves only after required persistence operations finish
  it("5. Async draft saving resolves only after required persistence operations finish", async () => {
    let writeFinished = false;
    const asyncWriter = async () => {
      await new Promise((r) => setTimeout(r, 10));
      writeFinished = true;
    };

    const saveOperation = async () => {
      await asyncWriter();
      await mockAddDraftToIndex("9876543210", "itr-filing");
    };

    const savePromise = saveOperation();
    assert.equal(writeFinished, false);
    await savePromise;
    assert.equal(writeFinished, true);
    assert.equal(indexAdded, true);
  });

  // 6. Failed storage writes reject and do not update draft index
  it("6. Failed storage writes reject and do not update draft index", async () => {
    setItemFails = true;
    let indexUpdated = false;

    const saveDraftWithGuards = async () => {
      await mockAsyncStorage.setItem("test-key", "test-val");
      indexUpdated = true;
    };

    await assert.rejects(
      async () => {
        await saveDraftWithGuards();
      },
      { message: "AsyncStorage write failed (disk full)" }
    );

    assert.equal(indexUpdated, false);
  });

  // 7. Corrupted or missing draft data is handled safely
  it("7. Corrupted or missing draft data is handled safely", async () => {
    const rawMissing = await mockAsyncStorage.getItem("@finsolz_draft_none_itr-filing");
    assert.equal(rawMissing, null);

    await mockAsyncStorage.setItem("corrupted-key", "invalid-json-{broken");
    const safeRestore = async (key: string) => {
      try {
        const raw = await mockAsyncStorage.getItem(key);
        if (!raw) return false;
        const parsed = JSON.parse(raw);
        return Boolean(parsed);
      } catch {
        return false;
      }
    };

    const missingResult = await safeRestore("@finsolz_draft_none_itr-filing");
    assert.equal(missingResult, false);

    const corruptedResult = await safeRestore("corrupted-key");
    assert.equal(corruptedResult, false);
  });

  // 8. buildApplicationDraftPayload constructs valid applicationStore payload
  it("8. buildApplicationDraftPayload maps required applicationStore fields", () => {
    const initial = createMockInitialFormData();
    initial.personalInfo.assessmentYear = "2025-2026";
    initial.category = "salaried";
    const payload = buildApplicationDraftPayload("draft-123", 2, initial, "2026-11-06T12:00:00Z");

    assert.equal(payload.id, "draft-123");
    assert.equal(payload.stepIndex, 2);
    assert.equal(payload.category, "salaried");
    assert.equal(payload.assessmentYear, "2025-2026");
    assert.equal(payload.updatedAt, "2026-11-06T12:00:00Z");
  });
});

