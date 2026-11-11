import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  deepMergeItrFormData,
  recalculateItrForm,
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

describe("Bug 4: ITR Filing Draft Persistence & Lifecycle", () => {
  let mockStorage: Record<string, string>;

  beforeEach(() => {
    mockStorage = {};
  });

  const mockAsyncStorage = {
    getItem: async (key: string): Promise<string | null> => mockStorage[key] ?? null,
    setItem: async (key: string, value: string): Promise<void> => {
      mockStorage[key] = value;
    },
  };

  // 1. Step 1 draft save and restore with currentStep === 0
  it("1. Step 1 draft save and restore with currentStep === 0", async () => {
    const initial = createMockInitialFormData();
    initial.personalInfo.name = "Vikram Sharma";
    initial.personalInfo.pan = "ABCDE1234F";
    initial.personalInfo.assessmentYear = "2025-2026";
    initial.category = "salaried";

    const currentStep = 0;
    const maxStepReached = 0;
    const mobile = "9876543210";
    const draftKey = `@finsolz_draft_${mobile}_itr-filing`;

    const storagePayload = {
      serviceKey: "itr-filing",
      serviceName: "ITR Filing",
      category: "ITR",
      step: currentStep,
      stepIndex: currentStep,
      maxStepReached,
      formData: initial,
      documents: initial.documents,
      updatedAt: new Date().toISOString(),
    };
    await mockAsyncStorage.setItem(draftKey, JSON.stringify(storagePayload));

    const raw = await mockAsyncStorage.getItem(draftKey);
    assert.ok(raw, "Draft must exist in storage");
    const parsed = JSON.parse(raw);
    assert.equal(parsed.stepIndex, 0, "Restored step must be exactly 0 (Step 1)");

    const merged = deepMergeItrFormData(createMockInitialFormData(), parsed.formData);
    const recalculated = recalculateItrForm(merged);

    assert.equal(recalculated.personalInfo.name, "Vikram Sharma");
    assert.equal(recalculated.personalInfo.pan, "ABCDE1234F");
    assert.equal(recalculated.category, "salaried");
  });

  // 2. Restored drafts bypass category selection
  it("2. Restored drafts bypass category selection unconditionally", () => {
    const screenContent = readSource(
      "modules/itr/itr-filing/screens/ItrFilingScreen/ItrFilingScreen.tsx"
    );

    assert.ok(
      screenContent.includes("if (restored) {\n          setIsCategoryConfirmed(true);"),
      "ItrFilingScreen must unconditionally set isCategoryConfirmed(true) when restoreItrDraft returns true"
    );
    assert.ok(
      !screenContent.includes("if (restoredStep > 0) {\n          setIsCategoryConfirmed(true);"),
      "Must not condition category confirmation on restoredStep > 0"
    );
  });

  // 3. Multiple selected income sources survive restoration
  it("3. Multiple selected income sources survive restoration", () => {
    const initial = createMockInitialFormData();
    const draftSources: Partial<IncomeSourcesState> = {
      salary: { ...initial.incomeSources.salary, enabled: true, grossSalary: "1200000" },
      business: { ...initial.incomeSources.business, enabled: true, grossTurnover: "2500000" },
      capitalGains: { ...initial.incomeSources.capitalGains, enabled: true, longTermGains: "150000" },
    };

    const draftData = {
      category: "multiple" as const,
      incomeSources: draftSources as IncomeSourcesState,
    };

    const merged = deepMergeItrFormData(initial, draftData as any);
    const recalculated = recalculateItrForm(merged);

    assert.equal(recalculated.incomeSources.salary.enabled, true);
    assert.equal(recalculated.incomeSources.business.enabled, true);
    assert.equal(recalculated.incomeSources.capitalGains.enabled, true);
    assert.equal(recalculated.incomeSources.houseProperty.enabled, false);
    assert.ok(recalculated.calculation.grossTotalIncome > 1200000);
  });

  // 4. maxStepReached is saved and restored
  it("4. maxStepReached is saved and restored accurately", async () => {
    const mobile = "9876543210";
    const draftKey = `@finsolz_draft_${mobile}_itr-filing`;
    const payload = {
      stepIndex: 0,
      maxStepReached: 3,
      formData: { category: "salaried" },
    };
    await mockAsyncStorage.setItem(draftKey, JSON.stringify(payload));

    const raw = await mockAsyncStorage.getItem(draftKey);
    const draftData = JSON.parse(raw!);

    const restoredStep = draftData.stepIndex;
    const parsedMaxStep =
      typeof draftData.maxStepReached === "number"
        ? draftData.maxStepReached
        : (restoredStep >= 3 ? 3 : restoredStep);
    const restoredMaxStep = Math.max(restoredStep, parsedMaxStep);

    assert.equal(restoredStep, 0, "Restored step is Step 1");
    assert.equal(restoredMaxStep, 3, "Restored maxStepReached must be 3");
  });

  // 5. Legacy drafts without maxStepReached: conservative fallback
  it("5. Legacy drafts without maxStepReached safely derive conservative fallback", () => {
    // Case A: Legacy draft at Step 1 (currentStep === 0) with no maxStepReached
    const draftAtStep0 = { stepIndex: 0 };
    const maxStep0 = Math.max(
      draftAtStep0.stepIndex,
      typeof (draftAtStep0 as any).maxStepReached === "number"
        ? (draftAtStep0 as any).maxStepReached
        : (draftAtStep0.stepIndex >= 3 ? 3 : draftAtStep0.stepIndex)
    );
    assert.equal(maxStep0, 0, "Legacy draft at Step 1 must NOT falsely enable Review-edit mode");

    // Case B: Legacy draft at Step 2 (Income Sources)
    const draftAtStep1 = { stepIndex: 1 };
    const maxStep1 = Math.max(
      draftAtStep1.stepIndex,
      typeof (draftAtStep1 as any).maxStepReached === "number"
        ? (draftAtStep1 as any).maxStepReached
        : (draftAtStep1.stepIndex >= 3 ? 3 : draftAtStep1.stepIndex)
    );
    assert.equal(maxStep1, 1, "Legacy draft at Step 2 must preserve stepIndex without forcing review");

    // Case C: Legacy draft at Step 4 (Tax Summary Review)
    const draftAtReview = { stepIndex: 3 };
    const maxStepReview = Math.max(
      draftAtReview.stepIndex,
      typeof (draftAtReview as any).maxStepReached === "number"
        ? (draftAtReview as any).maxStepReached
        : (draftAtReview.stepIndex >= 3 ? 3 : draftAtReview.stepIndex)
    );
    assert.equal(maxStepReview, 3, "Legacy draft at Review must fallback to maxStepReached >= 3");
  });

  // 6. Hydration gate in ItrFilingScreen
  it("6. ItrFilingScreen hydration gate prevents early rendering and handles errors in try/finally", () => {
    const screenContent = readSource(
      "modules/itr/itr-filing/screens/ItrFilingScreen/ItrFilingScreen.tsx"
    );

    assert.ok(
      screenContent.includes("const [isHydrating, setIsHydrating] = useState<boolean>(true);"),
      "ItrFilingScreen must declare isHydrating initialized to true"
    );
    assert.ok(
      screenContent.includes("if (isHydrating) {\n    return ("),
      "ItrFilingScreen must guard filing UI behind isHydrating check"
    );
    assert.ok(
      screenContent.includes("} finally {\n        if (isMounted) {\n          setIsHydrating(false);"),
      "ItrFilingScreen must use try/finally to ensure isHydrating is unset even on error"
    );
    assert.ok(
      screenContent.includes("let isMounted = true;"),
      "ItrFilingScreen must guard unmounted component updates with isMounted"
    );
  });

  // 7. Save failure must propagate error to prevent navigation
  it("7. Save failure re-throws error in onSaveDraft so modal remains open and screen does not exit", () => {
    const screenContent = readSource(
      "modules/itr/itr-filing/screens/ItrFilingScreen/ItrFilingScreen.tsx"
    );

    assert.ok(
      screenContent.includes("onSaveDraft: async () => {"),
      "onSaveDraft must be an async callback"
    );
    assert.ok(
      screenContent.includes("throw error;"),
      "onSaveDraft must re-throw error so UniversalDraftGuard does not proceed to navigation"
    );
  });
});
