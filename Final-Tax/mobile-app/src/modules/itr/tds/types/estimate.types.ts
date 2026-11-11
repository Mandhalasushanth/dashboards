export interface TaxCalculationBreakdown {
  grossTotalIncome: number;
  standardDeduction: number;
  chapterVIAEligibleDeductions: number;
  totalEligibleDeductions: number;
  taxableIncome: number;

  slabTax: number;
  rebate87A: number;
  taxAfterRebate: number;
  cess: number;
  estimatedTaxLiability: number;

  tdsDeducted: number;
  tcsAmount: number;
  advanceTaxPaid: number;
  selfAssessmentTaxPaid: number;
  totalTaxCredits: number;

  estimatedRefund: number;
  estimatedTaxPayable: number;
  isAdditionalTaxPayable: boolean;

  serviceFee: number;
  gstAmount: number;
  totalPayableFee: number;
  disclaimer: string;
}

export interface TdsRefundEstimateData {
  totalTdsDeducted: number;
  totalTaxLiability: number;
  estimatedRefund: number;
  serviceFeeRate: string;
  serviceFee: number;
  netEstimatedRefund: number;
  breakdown?: TaxCalculationBreakdown;
}
