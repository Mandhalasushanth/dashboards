/** Body sent to the GST filing create / update endpoints. */
export interface GstFilingPayload {
  gstin: string;
  customerId: string;
  financialYear: string;
  filingPeriod: string;
  filingFrequency: "MONTHLY" | "QUARTERLY" | "ANNUAL_FINANCIAL_YEAR";
  returnType: "GSTR_1" | "GSTR_3B";
  filingType: "NIL_RETURN" | "REGULAR";
  taxCalculationMethod: "ESTIMATION_FIGURES" | "FINSOLZ_CA_CALCULATION";
  estimatedTaxableSales: number | null;
  estimatedTaxablePurchases: number | null;
  estimatedEligibleItc: number | null;
}
