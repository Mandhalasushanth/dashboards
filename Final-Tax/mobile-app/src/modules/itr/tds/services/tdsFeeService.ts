import { TdsFeeBreakdown } from "../types/payment.types";

export interface FeeConfiguration {
  serviceFeePercent: number;
  minimumFee: number;
  maximumFee: number;
  flatFeeZeroRefund: number;
  gstPercent: number;
}

export const DEFAULT_FEE_CONFIG: FeeConfiguration = {
  serviceFeePercent: 10,
  minimumFee: 499,
  maximumFee: 4999,
  flatFeeZeroRefund: 499,
  gstPercent: 18,
};

export const tdsFeeService = {
  calculateFee: (
    refundEstimate: number,
    isAdditionalTaxPayable: boolean,
    config: FeeConfiguration = DEFAULT_FEE_CONFIG
  ): TdsFeeBreakdown => {
    let serviceFeeAmount: number;

    if (isAdditionalTaxPayable || refundEstimate <= 0) {
      serviceFeeAmount = config.flatFeeZeroRefund;
    } else {
      const calculated = Math.round(refundEstimate * (config.serviceFeePercent / 100));
      serviceFeeAmount = Math.max(config.minimumFee, Math.min(config.maximumFee, calculated));
    }

    const gstAmount = Math.round(serviceFeeAmount * (config.gstPercent / 100));
    const totalPayable = serviceFeeAmount + gstAmount;

    return {
      refundEstimate,
      isAdditionalTaxPayable,
      serviceFeePercent: config.serviceFeePercent,
      serviceFeeAmount,
      gstPercent: config.gstPercent,
      gstAmount,
      totalPayable,
    };
  },
};

export default tdsFeeService;
