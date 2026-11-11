export const PROPERTY_PURPOSE_OPTIONS = [
  "Home Purchase",
  "Home Construction",
  "Home Renovation",
  "Plot Purchase",
  "Plot + Construction",
  "Balance Transfer",
  "Other",
] as const;

export const PROPERTY_TYPE_OPTIONS = [
  "Apartment / Flat",
  "Independent House",
  "Villa",
  "Plot",
  "Commercial Property",
  "Other",
] as const;

export const PROPERTY_OWNERSHIP_OPTIONS = [
  "Self",
  "Joint / Family",
  "Not Yet Purchased",
] as const;

export const PROPERTY_STATUS_OPTIONS = [
  "Identified Property",
  "Property Not Yet Identified",
] as const;

export const CONSTRUCTION_STAGE_OPTIONS = [
  "Planning Stage",
  "Construction Started",
] as const;

export const RENOVATION_STATUS_OPTIONS = [
  "Planning Stage",
  "Renovation Started",
] as const;

export type PropertyPurpose = (typeof PROPERTY_PURPOSE_OPTIONS)[number];
export type PropertyType = (typeof PROPERTY_TYPE_OPTIONS)[number];
export type PropertyOwnership = (typeof PROPERTY_OWNERSHIP_OPTIONS)[number];
export type PropertyStatus = (typeof PROPERTY_STATUS_OPTIONS)[number];
export type ConstructionStage = (typeof CONSTRUCTION_STAGE_OPTIONS)[number];
export type RenovationStatus = (typeof RENOVATION_STATUS_OPTIONS)[number];

export interface PropertyLoanFormData {
  /** Whole rupees, digits only. */
  requestedAmount: string;
  purpose: PropertyPurpose | "";
  purposeOther: string;
  propertyType: PropertyType | "";
  propertyTypeOther: string;
  city: string;
  state: string;
  pinCode: string;
  propertyStatus: PropertyStatus | "";
  constructionStage: ConstructionStage | "";
  renovationStatus: RenovationStatus | "";
  ownership: PropertyOwnership | "";
}

/** A value of the purpose-dependent status question. */
export type PropertyStageValue =
  | PropertyStatus
  | ConstructionStage
  | RenovationStatus
  | "";

export type PropertyLoanErrors = Partial<Record<keyof PropertyLoanFormData, string>>;

/** The one status question that applies to the chosen purpose. */
export type PropertyStageField =
  | "propertyStatus"
  | "constructionStage"
  | "renovationStatus";

export interface PropertyStageQuestion {
  field: PropertyStageField;
  label: string;
  placeholder: string;
  options: readonly string[];
  missingMessage: string;
}

export const createInitialPropertyFormData = (): PropertyLoanFormData => ({
  requestedAmount: "",
  purpose: "",
  purposeOther: "",
  propertyType: "",
  propertyTypeOther: "",
  city: "",
  state: "",
  pinCode: "",
  propertyStatus: "",
  constructionStage: "",
  renovationStatus: "",
  ownership: "",
});
