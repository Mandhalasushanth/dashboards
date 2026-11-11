import { useAuthStore } from "@/store/authStore";
import { ItrFilingFormData, ItrPersonalInfo, ItrSelectableBank, ItrBankDetails, ItrPriorFilingAndNotice, GstReconciliationSummary, ItrCategoryType, ItrStructuredDeductions, TaxesPaidDetails } from "../itr-filing/types/itrFiling.types";
import { calculateItrTax } from "../itr-filing/engine/itrTaxCalculator";
import { determineApplicableItrForm } from "../itr-filing/engine/itrFormEngine";
import { generateDynamicDocumentChecklist } from "../itr-filing/engine/itrDocumentEngine";

export const getInitialFormData = (): ItrFilingFormData => {
  // 1. Pull user profile from authStore
  const authState = useAuthStore.getState();
  const customer = authState.customer;
  const user = authState.authenticatedUser;


  const personalInfo: ItrPersonalInfo = {
    pan: customer?.pan || (user as any)?.pan || "",
    aadhaar: customer?.aadhaar || (user as any)?.aadhaar || "",
    name: customer?.name || user?.name || "",
    dob: customer?.dob || (user as any)?.dob || "",
    gender: customer?.gender || (user as any)?.gender || "Male",
    fatherSpouseName: customer?.fatherSpouseName || "",
    address: customer?.address || customer?.addressLine1 || (user as any)?.address || "",
    city: customer?.city || (user as any)?.city || "",
    state: customer?.state || (user as any)?.state || "",
    pincode: customer?.pincode || (user as any)?.pincode || "",
    mobile: customer?.mobile || user?.mobileNumber || "",
    email: customer?.email || user?.email || "",
    residentialStatus: "",
    residentialStatusConfirmed: false,
    assessmentYear: "",
    filingType: "",
    filingTypeSuggested: "",
    isAutoVerified: Boolean(customer?.pan || (user as any)?.pan),
  };

  const initialBankAccounts: ItrSelectableBank[] = [];

  const bankDetails: ItrBankDetails = {
    bankName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    accountType: "Savings",
    isPrimaryRefund: false,
    validationStatus: "Pending",
  };

  const priorItrNotice: ItrPriorFilingAndNotice = {
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
  };

  const gstReconciliation: GstReconciliationSummary = {
    gstin: "",
    legalName: "",
    tradeName: "",
    businessActivity: "",
    registrationDate: "",
    gstr1Turnover: 0,
    gstr3bTurnover: 0,
    booksTurnover: 0,
    proposedItrTurnover: 0,
    variance: 0,
    hasVariance: false,
    varianceExplanation: "",
  };

  const registeredAccountType = customer?.customerType || "Individual";
  const initialCategory: ItrCategoryType | null = null;

  const incomeSources = {
    salary: {
      enabled: false,
      employerName: "",
      grossSalary: "",
      allowances: "",
      tdsDeducted: "",
      source: "USER_DECLARED" as const,
      isVerified: false,
    },
    houseProperty: {
      enabled: false,
      propertyType: "self_occupied" as const,
      annualRentReceived: "",
      municipalTaxesPaid: "",
      homeLoanInterest: "",
      source: "USER_DECLARED" as const,
    },
    business: {
      enabled: false,
      businessType: "presumptive_44ad" as const,
      businessName: "",
      gstin: "",
      businessActivity: "",
      grossTurnover: "",
      declaredProfit: "",
      source: "USER_DECLARED" as const,
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
      source: "USER_DECLARED" as const,
      statementUploaded: false,
    },
    otherSources: {
      enabled: false,
      savingsInterest: "",
      fdInterest: "",
      dividendIncome: "",
      familyPension: "",
      otherIncome: "",
      source: "USER_DECLARED" as const,
    },
  };

  const deductions: ItrStructuredDeductions = {
    sec80c: {
      epf: "",
      ppf: "",
      lic: "",
      elss: "",
      tuitionFees: "",
      housingPrincipal: "",
      other80c: "",
    },
    sec80d: {
      selfSpouseChildren: "",
      parents: "",
      isParentSeniorCitizen: false,
    },
    sec24b: "",
    sec80e: "",
    otherDeductionsList: [],
  };

  const taxesPaid: TaxesPaidDetails = {
    advanceTax: "",
    advanceTaxChallanBsr: "",
    advanceTaxDate: "",
    selfAssessmentTax: "",
  };

  const calculation = calculateItrTax(
    incomeSources,
    deductions,
    taxesPaid,
    "new",
    personalInfo.assessmentYear
  );

  const determinedForm = determineApplicableItrForm(
    incomeSources,
    personalInfo.residentialStatus,
    calculation.grossTotalIncome,
    personalInfo.assessmentYear
  );

  const documents = generateDynamicDocumentChecklist(
    incomeSources,
    priorItrNotice,
    deductions,
    taxesPaid,
    "new",
    personalInfo
  );

  return {
    personalInfo,
    bankDetails,
    bankAccountsList: initialBankAccounts,
    priorItrNotice,
    incomeSources,
    determinedForm,
    regime: "new",
    deductions,
    taxesPaid,
    documents,
    calculation,
    gstReconciliation,
    declarationAccepted: false,
    category: initialCategory,
    accountType: registeredAccountType,
  };
};