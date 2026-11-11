import { TaxComputationData, ReturnDetailsData } from "../types/computation.types";

export const DEFAULT_COMPUTATION_DATA: TaxComputationData = {
  grossTotalIncome: 897680,
  totalDeductions: 380000,
  taxableIncome: 517680,
  taxPlusCess: 16675,
  taxesPaid: 46260,
  refundDue: 29585,
  isRefund: true,
};

export const DEFAULT_RETURN_DETAILS: ReturnDetailsData = {
  applicationId: "ITR-2026-00042",
  incomeType: "Business",
  itrForm: "ITR-3",
  assessmentYear: "AY 2026-27",
  status: "Waiting for Customer Approval",
  preparedBy: "Assigned Tax Executive",
};
