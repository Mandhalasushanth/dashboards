export interface OriginalReturnDetails {
  acknowledgementNumber: string;
  assessmentYear: string;
  filingDate: string;
  itrForm: string;
  filingStatus: string;
  grossTotalIncome: string;
}

export type RevisionReasonId =
  | "missed_income"
  | "wrong_deduction"
  | "incorrect_bank"
  | "other";

export interface RevisionReasonOption {
  id: RevisionReasonId;
  title: string;
  subtitle: string;
  iconName: "cash-outline" | "document-text-outline" | "business-outline" | "pencil-outline";
}

export interface RevisedFormFields {
  salaryBusinessIncome: string;
  otherIncome: string;
  sec80c: string;
  sec80d: string;
  homeLoanInterest: string;
  bankAccount: string;
  ifsc: string;
  taxableIncome: string;
}

export interface RevisedDocumentItem {
  id: string;
  title: string;
  subtitle: string;
  isMandatory: boolean;
  fileUri?: string;
  fileName?: string;
  fileSize?: string;
  mimeType?: string;
  status: "not_uploaded" | "uploaded";
}

export interface ComputationComparisonRow {
  particular: string;
  original: string;
  revised: string;
  change: string;
  isHighlight?: boolean;
}
