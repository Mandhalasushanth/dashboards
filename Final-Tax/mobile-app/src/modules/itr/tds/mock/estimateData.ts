import { TdsRefundEstimateData } from "../types/estimate.types";

export const EMPTY_TDS_ESTIMATE: TdsRefundEstimateData = {
  totalTdsDeducted: 0,
  totalTaxLiability: 0,
  estimatedRefund: 0,
  serviceFeeRate: "10%",
  serviceFee: 0,
  netEstimatedRefund: 0,
};

export const DEFAULT_TDS_ESTIMATE = EMPTY_TDS_ESTIMATE;
