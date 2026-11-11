export type DocumentPreviewVariant =
  | "auto"
  | "itr"
  | "loans"
  | "home-loan"
  | "project-finance";

export interface PreviewDocumentItem {
  id?: string;
  name: string;
  fileName?: string;
  fileUri?: string | null;
  fileSize?: string;
  mimeType?: string;
  category?: string;
  uploadedAt?: string;
  status?: string;
  subtitle?: string;
  tier?: string;
  required?: boolean;
  docGroup?: string;
  // Project Finance specific fields compatibility
  uploadedFileName?: string;
  uploadedFileSize?: string;
  uploadedFileUri?: string;
  formatInfo?: string;
  isRequired?: boolean;
}

export interface DocumentPreviewModalProps<T extends PreviewDocumentItem = PreviewDocumentItem> {
  visible: boolean;
  document: T | null;
  onClose: () => void;
  onChangeFile?: (doc: T) => void;
  variant?: DocumentPreviewVariant;
  showShareButton?: boolean;
}
