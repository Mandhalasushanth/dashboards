export interface PersonalInformationData {
  panNumber: string;
  aadhaarNumber: string;
  assessmentYear: string;
}

export interface IncomeInformationData {
  incomeAmount: string;
}

export interface RequiredDocumentItem {
  id: string;
  title: string;
  subtitle: string;
  iconType: "pnl" | "balance_sheet" | "bank" | "ais" | "tis" | "form16" | "salary_slip" | "generic";
  fileUri?: string;
  fileName?: string;
  fileSize?: string;
  mimeType?: string;
}

export interface IncomeDetailsFormErrors {
  panNumber?: string;
  aadhaarNumber?: string;
  assessmentYear?: string;
  incomeAmount?: string;
}
