export type ResidentialStatus = "Resident" | "NRI" | "RNOR" | "";
export type FilingType =
  | "139_1_original"
  | "139_4_belated"
  | "139_5_revised"
  | "139_8a_updated"
  | "";

export type TaxRegimeType = "new" | "old";
export type ApplicableItrForm = "ITR-1" | "ITR-2" | "ITR-3" | "ITR-4";

export type ItrCategoryType =
  | "salaried"
  | "business"
  | "professional"
  | "freelancer"
  | "trader_investor"
  | "rental"
  | "capital_gains"
  | "multiple";

export type ItrJourneyStage =
  | "NEW_REQUEST"
  | "DOCUMENTS_PENDING"
  | "DOCUMENTS_RECEIVED"
  | "DOCUMENTS_UNDER_VERIFICATION"
  | "ITR_PREPARATION"
  | "TAX_CALCULATION"
  | "CUSTOMER_APPROVAL"
  | "ITR_FILED"
  | "EVERIFICATION_PENDING"
  | "EVERIFIED"
  | "PROCESSING"
  | "REFUND_OR_PAYABLE"
  | "COMPLETED";

export type DataSourceOrigin =
  | "FINSOLZ_PROFILE"
  | "FORM_16"
  | "AIS_TIS"
  | "FORM_26AS"
  | "GST_FILING"
  | "BROKER_STATEMENT"
  | "USER_DECLARED"
  | "PRIOR_ITR";

export interface ItrPersonalInfo {
  pan: string;
  aadhaar: string;
  name: string;
  dob: string;
  gender: string;
  fatherSpouseName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  mobile: string;
  email: string;
  residentialStatus: ResidentialStatus;
  residentialStatusConfirmed: boolean;
  assessmentYear: string;
  filingType: FilingType;
  filingTypeSuggested: FilingType;
  isAutoVerified: boolean;
}

export interface ItrSelectableBank {
  id: string;
  bankName: string;
  branchName?: string;
  accountNumber: string;
  maskedAccountNumber: string;
  ifscCode: string;
  accountType: "Savings" | "Current";
  isPrimaryRefund: boolean;
  validationStatus: "Validated" | "Pending";
}

export interface ItrBankDetails {
  bankName: string;
  branchName?: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifscCode: string;
  accountType: "Savings" | "Current";
  isPrimaryRefund: boolean;
  validationStatus: "Validated" | "Pending";
}

export interface ItrPriorFilingAndNotice {
  hasPreviousItr: boolean;
  previousAckNumber: string;
  previousAssessmentYear?: string;
  previousItrForm?: ApplicableItrForm;
  previousFiledDate?: string;
  importedIncomeDetails?: boolean;
  importedDeductions?: boolean;
  importedLosses?: boolean;
  importedBankDetails?: boolean;
  importedFilingDetails?: boolean;
  hasCarriedForwardLosses: boolean;
  carriedForwardLossesDetails: string;
  hasTaxNotice: boolean;
  noticeSection: string;
  noticeDetails: string;
}

export interface IncomeSalaryData {
  enabled: boolean;
  employerName: string;
  grossSalary: string;
  allowances: string;
  tdsDeducted: string;
  source: DataSourceOrigin;
  isVerified: boolean;
}

export interface IncomeHousePropertyData {
  enabled: boolean;
  propertyType: "self_occupied" | "let_out";
  annualRentReceived: string;
  municipalTaxesPaid: string;
  homeLoanInterest: string;
  source: DataSourceOrigin;
}

export interface IncomeBusinessData {
  enabled: boolean;
  businessType: "presumptive_44ad" | "presumptive_44ada" | "regular_books" | "not_sure";
  businessName: string;
  gstin: string;
  businessActivity?: string;
  grossTurnover: string;
  declaredProfit: string;
  source: DataSourceOrigin;
  hasGstActivity: boolean;
  gstr1Turnover?: string;
  gstr3bTurnover?: string;
  gstReconciliationRequired?: boolean;
}

export interface IncomeCapitalGainsData {
  enabled: boolean;
  hasEquityMf: boolean;
  hasFnoIntraday: boolean;
  hasPropertyAssets: boolean;
  hasCryptoVda: boolean;
  shortTermGains: string;
  longTermGains: string;
  brokerName?: string;
  totalTransactions?: number;
  source: DataSourceOrigin;
  statementUploaded?: boolean;
}

export interface IncomeOtherSourcesData {
  enabled: boolean;
  savingsInterest: string;
  fdInterest: string;
  dividendIncome: string;
  familyPension: string;
  otherIncome: string;
  source: DataSourceOrigin;
}

export interface IncomeSourcesState {
  salary: IncomeSalaryData;
  houseProperty: IncomeHousePropertyData;
  business: IncomeBusinessData;
  capitalGains: IncomeCapitalGainsData;
  otherSources: IncomeOtherSourcesData;
}

export interface Structured80C {
  epf: string;
  ppf: string;
  lic: string;
  elss: string;
  tuitionFees: string;
  housingPrincipal: string;
  other80c: string;
}

export interface Structured80D {
  selfSpouseChildren: string;
  parents: string;
  isParentSeniorCitizen: boolean;
}

export interface AdditionalDeductionItem {
  id: string;
  type: "80G" | "80TTA" | "80CCD_NPS" | "80DD" | "OTHER";
  title: string;
  amount: string;
  details?: string;
}

export interface ItrStructuredDeductions {
  sec80c: Structured80C;
  sec80d: Structured80D;
  sec24b: string;
  sec80e: string;
  otherDeductionsList: AdditionalDeductionItem[];
}

export type DocumentRequirementTier = "REQUIRED" | "RECOMMENDED" | "NOT_REQUIRED" | "ONLY_IF_APPLICABLE";

export interface ItrDocumentItem {
  id: string;
  name: string;
  subtitle: string;
  tier: DocumentRequirementTier;
  required: boolean;
  docGroup: "common" | "income" | "conditional";
  iconName?: string;
  fileUri?: string;
  fileName?: string;
  fileSize?: string;
  mimeType?: string;
  uploadedAt?: string;
  isProfileVerified?: boolean;
  profileVerifiedLabel?: string;
}

export interface TaxesPaidDetails {
  advanceTax: string;
  advanceTaxChallanBsr: string;
  advanceTaxDate: string;
  selfAssessmentTax: string;
}

export interface ItrCriteriaCheck {
  id: string;
  label: string;
  met: boolean;
}

export interface DeterminedFormInfo {
  form: ApplicableItrForm;
  formTitle: string;
  rationale: string;
  criteriaChecks: ItrCriteriaCheck[];
}

export interface TaxCalculationBreakdown {
  assessmentYear: string;
  financialYear: string;
  grossTotalIncome: number;
  standardDeduction: number;
  newRegimeStdDeduction: number;
  oldRegimeStdDeduction: number;
  totalChapterVIA: number;
  totalDeductions: number;
  taxableIncome: number;
  taxUnderNewRegime: number;
  taxUnderOldRegime: number;
  grossTaxLiability: number;
  rebate87A: number;
  taxAfterRebate: number;
  cess: number;
  totalTaxLiability: number;
  tdsCredits: number;
  advanceTaxPaid: number;
  selfAssessmentTaxPaid: number;
  totalTaxesPaid: number;
  finalAmount: number;
  finalType: "REFUND" | "PAYABLE" | "NIL";
  recommendedRegime: TaxRegimeType;
  savingsAmount: number;
  savingsExplanation: string;
}

export interface GstReconciliationSummary {
  gstin: string;
  legalName: string;
  tradeName: string;
  businessActivity: string;
  registrationDate: string;
  gstr1Turnover: number;
  gstr3bTurnover: number;
  booksTurnover: number;
  proposedItrTurnover: number;
  variance: number;
  hasVariance: boolean;
  varianceExplanation?: string;
}

export interface ReconciliationItem {
  id: string;
  category: string;
  label: string;
  amount?: string;
  source: DataSourceOrigin;
  sourceLabel: string;
  status: "VERIFIED" | "MATCHED" | "NEEDS_CONFIRMATION" | "VARIANCE_DETECTED";
  notes?: string;
}

export interface MissingInfoItem {
  id: string;
  severity: "REQUIRED" | "WARNING" | "INFO";
  title: string;
  actionLabel: string;
  targetStep: number;
}

export interface ItrFilingFormData {
  itrId?: string;
  incomeId?: string;
  documentId?: string;
  personalInfo: ItrPersonalInfo;
  bankDetails: ItrBankDetails;
  bankAccountsList: ItrSelectableBank[];
  priorItrNotice: ItrPriorFilingAndNotice;
  incomeSources: IncomeSourcesState;
  determinedForm: DeterminedFormInfo;
  regime: TaxRegimeType;
  deductions: ItrStructuredDeductions;
  taxesPaid: TaxesPaidDetails;
  documents: ItrDocumentItem[];
  calculation: TaxCalculationBreakdown;
  gstReconciliation?: GstReconciliationSummary;
  declarationAccepted: boolean;
  category: ItrCategoryType | null;
  accountType?: string;
}
