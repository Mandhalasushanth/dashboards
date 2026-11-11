import type { LoanDocumentRequirement } from "../../types/loanReview.types";
import {
  ALL_UPLOAD_SOURCES,
  DEFAULT_ALLOWED_MIME_TYPES,
  MAX_DOCUMENT_SIZE_BYTES,
} from "../../constants/loanDocuments";
import type { MsmeLoanFormData } from "../types/msmeLoan.types";

export const MSME_DOCUMENT_IDS = {
  udyamCertificate: "msme_udyam_certificate",
  gstCertificate: "msme_gst_certificate",
} as const;

/**
 * Checks whether Udyam is registered based on Screen 2 input.
 * Supports "Yes", "Registered" (case-insensitive).
 */
export function isUdyamRegistered(status?: string): boolean {
  if (!status) return false;
  const s = status.trim().toLowerCase();
  return s === "yes" || s === "registered";
}

/**
 * Checks whether GST is registered based on Screen 2 input.
 * Supports "Yes", "Registered" (case-insensitive).
 */
export function isGstRegistered(status?: string): boolean {
  if (!status) return false;
  const s = status.trim().toLowerCase();
  return s === "yes" || s === "registered";
}

/**
 * Resolves dynamic document checklist for MSME Loans.
 * - Udyam Registered = Yes -> Udyam Registration Certificate (Mandatory)
 * - Udyam Registered = No -> Not displayed / not required
 * - GST Registered = Yes -> GST Registration Certificate (Mandatory)
 * - GST Registered = No -> Not displayed / not required
 */
export function getMsmeLoanDocuments(
  formData?: MsmeLoanFormData
): LoanDocumentRequirement[] {
  if (!formData) return [];
  const docs: LoanDocumentRequirement[] = [];

  // 1. Udyam Registration Certificate (Required ONLY if Udyam Registered = Yes / Registered)
  if (isUdyamRegistered(formData.udyamStatus)) {
    docs.push({
      id: MSME_DOCUMENT_IDS.udyamCertificate,
      icon: "ribbon-outline",
      name: "Udyam Registration Certificate",
      description:
        "Official Udyam Registration Certificate issued by Ministry of MSME",
      isMandatory: true,
      allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
      maxSizeBytes: MAX_DOCUMENT_SIZE_BYTES,
      uploadSources: ALL_UPLOAD_SOURCES,
    });
  }

  // 2. GST Registration Certificate (Required ONLY if GST Registered = Yes / Registered)
  if (isGstRegistered(formData.gstStatus)) {
    docs.push({
      id: MSME_DOCUMENT_IDS.gstCertificate,
      icon: "shield-checkmark-outline",
      name: "GST Registration Certificate",
      description:
        "GST registration certificate (Form GST REG-06) or latest GSTR filing",
      isMandatory: true,
      allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
      maxSizeBytes: MAX_DOCUMENT_SIZE_BYTES,
      uploadSources: ALL_UPLOAD_SOURCES,
    });
  }

  return docs;
}
