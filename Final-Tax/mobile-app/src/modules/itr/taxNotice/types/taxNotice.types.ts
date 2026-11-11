export interface TaxNoticeFormData {
  pan: string;
  assessmentYear: string;
  noticeType: string;
  noticeDate: string;
  noticeNumber: string; // Notice Reference Number / DIN
  responseDueDate: string;
  customerExplanation: string;
  noticeFileUri?: string;
  noticeFileName?: string;
  noticeFileSize?: string;
  noticeFileType?: string;
}

// Backward compatibility alias
export type TaxNoticeUploadFormData = TaxNoticeFormData;

export interface TaxNoticeSummaryData {
  noticeType: string;
  section: string;
  issuedDate: string;
  responseDueDate: string;
  daysLeft: number;
  riskLevel: "Low" | "Medium" | "High";
  whatItMeans: string;
  actionRequired: string;
}

export interface TaxNoticeSupportingDoc {
  id: string;
  title: string;
  subtitle: string;
  isMandatory: boolean;
  fileUri?: string;
  fileName?: string;
  fileSize?: string;
  mimeType?: string;
  fileTypeLabel?: string;
  status: "not_uploaded" | "uploaded";
  errorMessage?: string;
}

export interface DocumentUploadPayload {
  uri: string;
  name: string;
  size: string;
  mimeType?: string;
  fileTypeLabel?: string;
}

export interface NoticeTrackingStep {
  id: string;
  title: string;
  date: string;
  description: string;
  status: "completed" | "active" | "pending";
}

export interface NoticeStatusDetails {
  noticeNumber: string;
  section: string;
  submittedOn: string;
  acknowledgementNo: string;
  assignedTaxExecutive: string;
  currentStatus: string;
}

export interface NoticeTypeOption {
  label: string;
  value: string;
  section: string;
  description: string;
}
