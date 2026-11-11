import type { ComponentProps } from "react";
import type Ionicons from "@expo/vector-icons/Ionicons";

/** Where a customer may pick a document from; mirrors the shared upload sheet. */
export type LoanDocumentSource = "files" | "camera";

export interface LoanDocumentRequirement {
  id: string;
  name: string;
  description: string;
  isMandatory: boolean;
  allowedMimeTypes: string[];
  maxSizeBytes: number;
  icon: ComponentProps<typeof Ionicons>["name"];
  uploadSources: LoanDocumentSource[];
}

export interface LoanDocumentUpload {
  id: string;
  documentId: string;
  fileName: string;
  fileUri: string;
  fileSize: number;
  mimeType: string;
  status: "idle" | "selected" | "error";
  errorMessage?: string;
}

export interface LoanReviewState {
  documents: Record<string, LoanDocumentUpload>;
  isConsentGiven: boolean;
  isSubmitting: boolean;
  applicationId: string | null;
  submittedAt: string | null;
}

export type LoanReviewErrors = {
  documents?: Record<string, string>;
  consent?: string;
  general?: string;
  /** Section-level messages shown on the matching summary card. */
  applicant?: string;
  business?: string;
  loan?: string;
  employment?: string;
  property?: string;
  vehicle?: string;
  machinery?: string;
  msme?: string;
};
