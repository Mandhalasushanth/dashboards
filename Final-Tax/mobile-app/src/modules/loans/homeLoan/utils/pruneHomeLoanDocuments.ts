import type { LoanDocumentUpload } from "../../types/loanReview.types";
import type { HomeLoanRequirementFormData } from "../types/homeLoan.types";
import { getPropertyLoanDocuments } from "../constants/homeLoanDocuments";

/**
 * Prunes uploaded documents at submission time so only documents matching the CURRENT
 * loan purpose are submitted. Previously uploaded documents for other purposes remain
 * in state (for switching back) but are excluded from submission payloads.
 */
export function pruneHomeLoanDocuments(
  formData: HomeLoanRequirementFormData,
  uploadedDocuments: Record<string, LoanDocumentUpload>
): LoanDocumentUpload[] {
  const requirements = getPropertyLoanDocuments(formData);
  return requirements.flatMap((req) => {
    const doc = uploadedDocuments[req.id];
    return doc?.fileUri ? [doc] : [];
  });
}
