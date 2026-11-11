import { formatCurrencyINR } from "@/shared/formatters/currencyFormatter";
import type { PropertyLoanFormData } from "../property/types/property.types";
import {
  getStageQuestion,
  prunePropertyFormData,
} from "../property/utils/propertyFlow";
import type { ReviewRow, ReviewSection } from "./loanReviewSummary";

const EMPTY = "—";

const withOther = (value: string, other: string): string =>
  value === "Other" ? other.trim() || EMPTY : value || EMPTY;

/**
 * Review sections for a Property Loan. Only the answers that were actually submitted are
 * shown, so a status question left over from a previous purpose never appears.
 */
export function buildPropertyReviewSections(
  form: PropertyLoanFormData
): ReviewSection[] {
  const submitted = prunePropertyFormData(form);
  const question = getStageQuestion(submitted.purpose);

  const requirementRows: ReviewRow[] = [
    { label: "Loan Type", value: "Property Loan" },
    {
      label: "Requested Loan Amount",
      value: submitted.requestedAmount.trim()
        ? formatCurrencyINR(submitted.requestedAmount)
        : EMPTY,
      highlight: true,
    },
    { label: "Purpose", value: withOther(submitted.purpose, submitted.purposeOther) },
    ...(question
      ? [{ label: question.label, value: submitted[question.field] || EMPTY }]
      : []),
  ];

  return [
    {
      id: "loan",
      title: "Loan Requirement",
      subtitle: "Requested financing and purpose",
      icon: "cash-outline",
      editTarget: "property-details",
      editLabel: "Edit loan requirement",
      rows: requirementRows,
    },
    {
      id: "property",
      title: "Property Details",
      subtitle: "Type, location and ownership",
      icon: "home-outline",
      editTarget: "property-details",
      editLabel: "Edit property details",
      rows: [
        {
          label: "Property Type",
          value: withOther(submitted.propertyType, submitted.propertyTypeOther),
        },
        { label: "City", value: submitted.city || EMPTY },
        { label: "State", value: submitted.state || EMPTY },
        { label: "PIN Code", value: submitted.pinCode || EMPTY },
        { label: "Ownership", value: submitted.ownership || EMPTY },
      ],
    },
  ];
}
