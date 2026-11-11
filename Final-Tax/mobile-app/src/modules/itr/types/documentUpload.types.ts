export type DocumentUploadStatus =
  | "not_uploaded"
  | "uploaded"
  | "under_review"
  | "verified"
  | "rejected";

export interface BusinessDocumentItem {
  id: string;
  title: string;
  subtitle: string;
  iconType:
    | "pan"
    | "aadhaar"
    | "business_income"
    | "pnl_balance_sheet"
    | "bank_statements"
    | "ais"
    | "tis";
  status: DocumentUploadStatus;
  fileUri?: string;
  fileName?: string;
  fileSize?: string;
  mimeType?: string;
}
