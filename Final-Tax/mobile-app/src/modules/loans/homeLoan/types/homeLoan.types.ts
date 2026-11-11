export const HOME_LOAN_PURPOSE_OPTIONS = [
  "Purchase a New Home",
  "Purchase a Resale Home",
  "Construct a House",
  "Home Renovation",
  "Balance Transfer",
] as const;

export type HomeLoanPurpose = (typeof HOME_LOAN_PURPOSE_OPTIONS)[number];

export const EXTENDED_PROPERTY_PURPOSE_OPTIONS = [
  ...HOME_LOAN_PURPOSE_OPTIONS,
  "Plot Purchase",
  "Plot + Construction",
] as const;

export type PropertyLoanPurpose =
  | HomeLoanPurpose
  | "Plot Purchase"
  | "Plot + Construction";

export const HOME_LOAN_PROPERTY_STATUS_OPTIONS = [
  "Property Identified",
  "Looking for Property",
  "Under Construction",
  "Ready to Move",
] as const;

export type HomeLoanPropertyStatus =
  (typeof HOME_LOAN_PROPERTY_STATUS_OPTIONS)[number];

export interface HomeLoanRequirementFormData {
  loanAmount: string;
  requestedAmount?: string;
  purpose: HomeLoanPurpose | "";
  propertyStatus: HomeLoanPropertyStatus | "";
  approximatePropertyValue: string;
  propertyValue?: string;
}

export type HomeLoanRequirementErrors = Partial<
  Record<keyof HomeLoanRequirementFormData, string>
>;
