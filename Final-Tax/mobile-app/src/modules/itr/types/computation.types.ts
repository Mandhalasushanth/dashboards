export interface TaxComputationData {
  grossTotalIncome: number;
  totalDeductions: number;
  taxableIncome: number;
  taxPlusCess: number;
  taxesPaid: number;
  refundDue?: number;
  taxPayableDue?: number;
  isRefund: boolean;
}

export interface ReturnDetailsData {
  applicationId: string;
  incomeType: string;
  itrForm: string;
  assessmentYear: string;
  status: string;
  preparedBy: string;
}
