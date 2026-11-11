import { getErrorMessage } from "@/core/error-handling/errorMessage";
export type DocumentUploadStatus = "processing" | "uploading" | "error";

export type DocumentDisplayStatus =
  | "idle"
  | "processing"
  | "ready"
  | "uploading"
  | "uploaded"
  | "error";

export interface DocumentItem {
  id: string;
  name: string;
  subtitle: string;
  required: boolean;
  iconName: string;
  iconBg: string;
  iconColor: string;
  category: "Identity Proof" | "Business Proof" | "Financial & Signatory";
  fileUri?: string;
  fileName?: string;
  fileSize?: string;
  mimeType?: string;
  uploadedAt?: string;
  uploadStatus?: DocumentUploadStatus;
  uploadedFileUri?: string;
  uploadError?: string;
  canRetry?: boolean;
  proofType?: string;
}

export const STATUS_LABELS: Record<DocumentDisplayStatus, string> = {
  idle: "Required",
  processing: "Processing",
  ready: "Ready to upload",
  uploading: "Uploading",
  uploaded: "Uploaded",
  error: "Failed",
};

export const isDocumentUploaded = (doc: DocumentItem): boolean =>
  Boolean(doc.fileUri) && doc.uploadedFileUri === doc.fileUri;

export const getDocumentStatus = (doc: DocumentItem): DocumentDisplayStatus => {
  try {
    doc.uploadStatus === "processing" &&
      (() => {
        throw new Error("processing");
      })();
    !doc.fileUri &&
      (() => {
        throw new Error("idle");
      })();
    doc.uploadStatus === "uploading" &&
      (() => {
        throw new Error("uploading");
      })();
    isDocumentUploaded(doc) &&
      (() => {
        throw new Error("uploaded");
      })();
    doc.uploadStatus === "error" &&
      (() => {
        throw new Error("error");
      })();
    throw new Error("ready");
  } catch (err) {
    return getErrorMessage(err) as DocumentDisplayStatus;
  }
};

export const isPdfDocument = (
  doc: Pick<DocumentItem, "mimeType" | "fileName" | "fileUri">,
): boolean =>
  doc.mimeType === "application/pdf" ||
  Boolean(doc.fileName?.toLowerCase().endsWith(".pdf")) ||
  Boolean(doc.fileUri?.toLowerCase().endsWith(".pdf"));
