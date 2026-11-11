export type DocumentUploadStatus =
  | "not_uploaded"
  | "uploaded"
  | "verified"
  | "rejected";

export type DocumentCategory =
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
  status: DocumentUploadStatus;
}

export interface DocumentChecklistItem {
  id: string;
  title: string;
  subtitle: string;
  category?: DocumentCategory;
  iconType?: string;
  isMandatory: boolean;
  isVisible?: boolean;
  status: DocumentUploadStatus;
  fileName?: string;
  fileSize?: string;
  fileUri?: string;
  mimeType?: string;
  uploadedAt?: string;
  isHighlighted?: boolean;
}

// Backward-compatibility aliases
export type TdsUploadStatus = DocumentUploadStatus;
export type TdsDocumentCategory = DocumentCategory;
export type TdsChecklistItem = DocumentChecklistItem;
