export type TdsDocStatus = "not_uploaded" | "uploaded";

export type TdsDocIconType =
  | "pan"
  | "form16"
  | "form16a"
  | "ais"
  | "tis"
  | "bank_statements"
  | "prev_itr"
  | "tds_certs"
  | "income_proofs";

export interface TdsDocumentItem {
  id: string;
  title: string;
  subtitle?: string;
  isMandatory: boolean;
  acceptedFormats: string;
  allowedExtensions?: string[];
  iconType: TdsDocIconType;
  status: TdsDocStatus;
  fileName?: string;
  fileSize?: string;
  fileUri?: string;
  mimeType?: string;
  fileTypeLabel?: string;
  errorMessage?: string;
}

export interface DocumentUploadPayload {
  uri: string;
  name: string;
  size: string;
  mimeType?: string;
  fileTypeLabel?: string;
}
