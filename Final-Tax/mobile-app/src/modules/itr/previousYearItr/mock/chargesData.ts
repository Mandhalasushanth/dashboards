import { PreviousYearChargesData } from "../types/charges.types";

export const DEFAULT_PREVIOUS_YEAR_CHARGES: PreviousYearChargesData = {
  assessmentYear: "AY 2023–24",
  governmentCharges: {
    lateFilingFeeSec234F: 5000,
    interestSec234A: 3240,
    additionalTaxItrU: 7800,
    totalGovernmentCharges: 16040,
  },
  serviceFee: {
    baseFilingFee: 3500,
    gstPercent: 18,
    gstAmount: 630,
    totalServiceFee: 4130,
  },
};
