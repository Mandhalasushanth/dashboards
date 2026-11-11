import type {
  PersonalLoanErrors,
  PersonalLoanFormData,
} from "../../types/personalLoan.types";

export type PersonalFieldChange = <K extends keyof PersonalLoanFormData>(
  field: K,
  value: PersonalLoanFormData[K]
) => void;

export interface PersonalIncomeSectionProps {
  data: PersonalLoanFormData;
  errors: PersonalLoanErrors;
  onChangeField: PersonalFieldChange;
}
