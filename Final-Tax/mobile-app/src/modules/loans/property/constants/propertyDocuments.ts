import { getPropertyLoanDocuments } from "../../homeLoan/constants/homeLoanDocuments";
import type { LoanDocumentRequirement } from "../../types/loanReview.types";
import type {
  PropertyLoanFormData,
  PropertyPurpose,
} from "../types/property.types";

/** Property purposes mapped onto the document checklist the loans module already defines. */
const DOCUMENT_PURPOSE: Record<PropertyPurpose, string> = {
  "Home Purchase": "Purchase a New Home",
  "Home Construction": "Construct a House",
  "Home Renovation": "Home Renovation",
  "Plot Purchase": "Plot Purchase",
  "Plot + Construction": "Plot + Construction",
  "Balance Transfer": "Balance Transfer",
  Other: "",
};

/** Documents to collect on the Documents screen for the chosen purpose. */
export function getPropertyDocumentRequirements(
  form: PropertyLoanFormData
): LoanDocumentRequirement[] {
  return getPropertyLoanDocuments({
    purpose: form.purpose ? DOCUMENT_PURPOSE[form.purpose] : "",
  });
}
