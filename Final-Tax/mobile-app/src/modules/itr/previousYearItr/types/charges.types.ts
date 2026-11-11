export interface GovernmentChargesBreakdown {
  lateFilingFeeSec234F: number;
  interestSec234A: number;
  additionalTaxItrU: number;
  totalGovernmentCharges: number;
}

export interface ServiceFeeBreakdown {
  baseFilingFee: number;
  gstPercent: number;
  gstAmount: number;
  totalServiceFee: number;
}

export interface PreviousYearChargesData {
  assessmentYear: string;
  governmentCharges: GovernmentChargesBreakdown;
  serviceFee: ServiceFeeBreakdown;
}
