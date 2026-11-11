export type TdsUploadStatus =
  | "not_uploaded"
  | "uploaded"
  | "verified"
  | "rejected";

export type TdsDocumentCategory =
  | "base"
  | "salary"
  | "non_salary"
  | "bank"
  | "previous_return"
  | "capital_gains"
  | "property"
  | "deductions"
  | "other";

export interface UploadedDocMetadata {
  id: string;
  documentType: string;
  fileName: string;
  fileSize?: number;
  fileSizeFormatted: string;
  fileUri: string;
  mimeType?: string;
  uploadedAt: string;
  status: TdsUploadStatus;
}

export interface TdsChecklistItem {
  id: string;
  title: string;
  subtitle: string;
  category?: TdsDocumentCategory;
  iconType?: string;
  isMandatory: boolean;
  isVisible?: boolean;
  status: TdsUploadStatus;
  fileName?: string;
  fileSize?: string;
  fileUri?: string;
  mimeType?: string;
  uploadedAt?: string;
  isHighlighted?: boolean;
}
