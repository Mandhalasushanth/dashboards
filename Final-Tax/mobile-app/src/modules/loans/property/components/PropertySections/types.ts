import type {
  PropertyLoanErrors,
  PropertyLoanFormData,
} from "../../types/property.types";

export type PropertyFieldChange = <K extends keyof PropertyLoanFormData>(
  field: K,
  value: PropertyLoanFormData[K]
) => void;

export interface PropertySectionProps {
  data: PropertyLoanFormData;
  errors: PropertyLoanErrors;
  onChangeField: PropertyFieldChange;
}
