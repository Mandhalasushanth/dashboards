import {
  ALL_UPLOAD_SOURCES,
  DEFAULT_ALLOWED_MIME_TYPES,
  MAX_DOCUMENT_SIZE_BYTES,
} from "../../constants/loanDocuments";
import type { LoanDocumentRequirement } from "../../types/loanReview.types";
import type { MachineryLoanFormData } from "../types/machinery.types";

export const MACHINERY_DOCUMENT_IDS = {
  newQuotation: "machinery_new_quotation",
  usedPurchaseDocument: "machinery_used_purchase_document",
} as const;

/** The same quotation/purchase proof applies to either machinery condition. */
export function getMachineryLoanDocuments(
  formData: MachineryLoanFormData
): LoanDocumentRequirement[] {
  if (
    formData.machineryCondition !== "New" &&
    formData.machineryCondition !== "Used / Pre-owned"
  ) {
    return [];
  }

  const isNew = formData.machineryCondition === "New";
  return [
    {
      id: isNew
        ? MACHINERY_DOCUMENT_IDS.newQuotation
        : MACHINERY_DOCUMENT_IDS.usedPurchaseDocument,
      icon: "document-text-outline",
      name: isNew
        ? "Machinery Quotation / Proforma Invoice"
        : "Machinery Quotation / Purchase Document",
      description: isNew
        ? "Quotation or proforma invoice for the new machinery being financed"
        : "Quotation or purchase document for the used / pre-owned machinery being financed",
      isMandatory: true,
      allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
      maxSizeBytes: MAX_DOCUMENT_SIZE_BYTES,
      uploadSources: ALL_UPLOAD_SOURCES,
    },
  ];
}
