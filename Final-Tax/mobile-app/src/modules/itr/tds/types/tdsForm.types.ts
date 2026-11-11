export interface TdsFormData {
  panNumber: string;
  assessmentYear: string;
  totalIncome: string;
  totalDeductions: string;
  deductorName: string;
  deductorTan: string;
  tdsAmount: string;
  deductedSection: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  previousItrFiled: string;
}

export type TdsFormFieldKey = keyof TdsFormData;

export type TdsFormErrors = Partial<Record<TdsFormFieldKey, string>>;

export interface SelectOption {
  label: string;
  value: string;
  description?: string;
}

export interface ValidationRule {
  required?: boolean;
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  custom?: (value: string, allData: TdsFormData) => string | undefined;
  errorMessage: string;
}
