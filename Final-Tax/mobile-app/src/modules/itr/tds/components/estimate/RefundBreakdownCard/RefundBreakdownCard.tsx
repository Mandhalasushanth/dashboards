import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { TdsRefundEstimateData } from "../../../types/estimate.types";
import { styles } from "./RefundBreakdownCard.styles";

interface RefundBreakdownCardProps {
  data: TdsRefundEstimateData;
}

export const RefundBreakdownCard: React.FC<RefundBreakdownCardProps> = ({ data }) => {
  return (
    <View style={styles.card}>
      {/* Card Header */}
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Ionicons name="receipt-outline" size={18} color="#0B1F3A" />
        </View>
        <Text style={styles.headerTitle}>Refund Breakdown</Text>
      </View>

      {/* Breakdown Rows */}
      <View style={styles.rowsList}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Total TDS Deducted</Text>
          <Text style={styles.rowValue}>₹{data.totalTdsDeducted.toLocaleString("en-IN")}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Total Tax Liability</Text>
          <Text style={styles.rowValue}>₹{data.totalTaxLiability.toLocaleString("en-IN")}</Text>
        </View>

        <View style={styles.row}>
          <Text style={[styles.rowLabel, styles.orangeText]}>Estimated Refund</Text>
          <Text style={[styles.rowValue, styles.orangeText]}>
            ₹{data.estimatedRefund.toLocaleString("en-IN")}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Service Fee ({data.serviceFeeRate})</Text>
          <Text style={styles.rowValue}>₹{data.serviceFee.toLocaleString("en-IN")}</Text>
        </View>
      </View>

      {/* Subtle Divider */}
      <View style={styles.divider} />

      {/* Final Summary Row */}
      <View style={styles.finalRow}>
        <Text style={styles.finalLabel}>You will receive (estimated)</Text>
        <Text style={styles.finalValue}>
          ₹{data.netEstimatedRefund.toLocaleString("en-IN")}
        </Text>
      </View>
    </View>
  );
};
