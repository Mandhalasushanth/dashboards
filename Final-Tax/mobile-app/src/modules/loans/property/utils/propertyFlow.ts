import {
  CONSTRUCTION_STAGE_OPTIONS,
  PROPERTY_OWNERSHIP_OPTIONS,
  PROPERTY_STATUS_OPTIONS,
  RENOVATION_STATUS_OPTIONS,
  createInitialPropertyFormData,
  type PropertyLoanFormData,
  type PropertyOwnership,
  type PropertyPurpose,
  type PropertyStageQuestion,
} from "../types/property.types";

/** The single status question for a purpose, or null when none applies. */
export function getStageQuestion(
  purpose: PropertyPurpose | ""
): PropertyStageQuestion | null {
  switch (purpose) {
    case "Home Purchase":
    case "Plot Purchase":
      return {
        field: "propertyStatus",
        label: "Property Status",
        placeholder: "Select property status",
        options: PROPERTY_STATUS_OPTIONS,
        missingMessage: "Please select the property status",
      };
    case "Home Construction":
    case "Plot + Construction":
      return {
        field: "constructionStage",
        label: "Construction Stage",
        placeholder: "Select construction stage",
        options: CONSTRUCTION_STAGE_OPTIONS,
        missingMessage: "Please select the construction stage",
      };
    case "Home Renovation":
      return {
        field: "renovationStatus",
        label: "Renovation Status",
        placeholder: "Select renovation status",
        options: RENOVATION_STATUS_OPTIONS,
        missingMessage: "Please select the renovation status",
      };
    default:
      return null;
  }
}

const PURCHASE_PURPOSES: readonly (PropertyPurpose | "")[] = [
  "Home Purchase",
  "Plot Purchase",
  "Plot + Construction",
  "Other",
  "",
];

/** "Not Yet Purchased" only makes sense for a purpose that buys the property. */
export function getOwnershipOptions(
  purpose: PropertyPurpose | ""
): readonly PropertyOwnership[] {
  return PURCHASE_PURPOSES.includes(purpose)
    ? PROPERTY_OWNERSHIP_OPTIONS
    : PROPERTY_OWNERSHIP_OPTIONS.filter((option) => option !== "Not Yet Purchased");
}

/**
 * The property data to submit: values of questions that do not apply to the chosen
 * purpose or option are dropped. The form itself keeps them so switching back loses nothing.
 */
export function prunePropertyFormData(
  form: PropertyLoanFormData
): PropertyLoanFormData {
  const question = getStageQuestion(form.purpose);
  const empty = createInitialPropertyFormData();
  return {
    ...empty,
    requestedAmount: form.requestedAmount,
    purpose: form.purpose,
    purposeOther: form.purpose === "Other" ? form.purposeOther : "",
    propertyType: form.propertyType,
    propertyTypeOther: form.propertyType === "Other" ? form.propertyTypeOther : "",
    city: form.city,
    state: form.state,
    pinCode: form.pinCode,
    ownership: form.ownership,
    ...(question ? { [question.field]: form[question.field] } : null),
  };
}
