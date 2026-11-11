export interface ApplicationSummaryData {
  applicationId: string;
  incomeType: string;
  itrForm: string;
  assessmentYear: string;
  taxRegime?: string;
  documentsUploaded: string;
  refundBank?: string;
  submissionDate: string;
  status: string;
}

export interface ProgressStageItem {
  id: string;
  label: string;
  iconName: "document-text" | "search" | "receipt" | "person" | "send" | "shield-checkmark";
  status: "completed" | "current" | "upcoming";
}
