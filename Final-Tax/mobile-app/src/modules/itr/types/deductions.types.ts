export type PreviousFilingOption = "previous_itr" | "tax_notice" | "none";

export interface DeductionsFormData {
  sec80c: string;
  sec80d: string;
  homeLoan24b: string;
  educationLoan80e: string;
  otherDeductions: string;
  previousFilingOption: PreviousFilingOption;
}

export interface DeductionsFormErrors {
  sec80c?: string;
  sec80d?: string;
  homeLoan24b?: string;
  educationLoan80e?: string;
  otherDeductions?: string;
  previousFilingOption?: string;
}
