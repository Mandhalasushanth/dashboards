import React from "react";
import { View, Text } from "react-native";
import { TdsFeeBreakdown } from "../../../types/payment.types";
import { formatCurrency } from "../../../utils/tdsValidation";
import { styles } from "./FeeSummaryCard.styles";

export interface FeeSummaryCardProps {
  feeData: TdsFeeBreakdown;
}

export const FeeSummaryCard: React.FC<FeeSummaryCardProps> = ({ feeData }) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Payment Summary</Text>
      </View>

      <View style={styles.rowsList}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>
            {feeData.isAdditionalTaxPayable ? "Estimated Tax Payable" : "Estimated Refund"}
          </Text>
          <Text style={[styles.rowValue, !feeData.isAdditionalTaxPayable ? styles.refundValue : null]}>
            {formatCurrency(feeData.refundEstimate)}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Finsolz Service Fee</Text>
          <Text style={styles.rowValue}>
            {formatCurrency(feeData.serviceFeeAmount)}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>GST (18%)</Text>
          <Text style={styles.rowValue}>
            {formatCurrency(feeData.gstAmount)}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total Payable</Text>
        <Text style={styles.totalValue}>
          {formatCurrency(feeData.totalPayable)}
        </Text>
      </View>
    </View>
  );
};

export default FeeSummaryCard;
