import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { TdsReconciliationSummary } from "../../../types/reconciliation.types";
import { formatCurrency } from "../../../utils/tdsValidation";
import { styles } from "./TdsReconciliationCard.styles";

export interface TdsReconciliationCardProps {
  summary: TdsReconciliationSummary;
}

export const TdsReconciliationCard: React.FC<TdsReconciliationCardProps> = ({
  summary,
}) => {
  if (summary.items.length === 0) return null;

  return (
    <View
      style={[
        styles.container,
        summary.hasMismatch ? styles.containerMismatch : styles.containerMatch,
      ]}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <Ionicons
          name={summary.hasMismatch ? "warning-outline" : "checkmark-circle"}
          size={20}
          color={summary.hasMismatch ? "#D97706" : "#16A34A"}
        />
        <Text
          style={[
            styles.headerTitle,
            summary.hasMismatch ? styles.titleMismatch : styles.titleMatch,
          ]}
        >
          {summary.hasMismatch
            ? "TDS information mismatch"
            : "TDS Records Verified & Reconciled"}
        </Text>
      </View>

      <Text style={styles.subtitle}>
        {summary.hasMismatch
          ? "A variance was identified between uploaded statements and customer-entered TDS details. A CA will verify before return submission."
          : "Customer-entered TDS matches with uploaded Form 26AS, Form 16, and AIS statements."}
      </Text>

      {/* Breakdown per document source */}
      <View style={styles.itemsList}>
        {summary.items.map((item, idx) => (
          <View key={idx} style={styles.itemBox}>
            <Text style={styles.itemSource}>{item.source}</Text>

            <View style={styles.itemRow}>
              <Text style={styles.itemLabel}>Reported in document:</Text>
              <Text style={styles.itemValue}>{formatCurrency(item.reportedAmount)}</Text>
            </View>

            <View style={styles.itemRow}>
              <Text style={styles.itemLabel}>Entered by customer:</Text>
              <Text style={styles.itemValue}>{formatCurrency(item.enteredAmount)}</Text>
            </View>

            {item.hasMismatch && (
              <View style={styles.itemRow}>
                <Text style={styles.itemLabel}>Difference:</Text>
                <Text style={[styles.itemValue, styles.diffValue]}>
                  {formatCurrency(item.difference)}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

export default TdsReconciliationCard;
