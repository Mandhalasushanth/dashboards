import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ApplicationSummaryData } from "../../../types/success.types";
import { styles } from "./ApplicationSummaryCard.styles";

interface ApplicationSummaryCardProps {
  summary: ApplicationSummaryData;
}

export const ApplicationSummaryCard: React.FC<ApplicationSummaryCardProps> = ({
  summary,
}) => {
  const rows = [
    { label: "Assessment Year", value: summary.assessmentYear },
    { label: "Return Form", value: summary.itrForm },
    { label: "Income Sources", value: summary.incomeType },
    { label: "Tax Regime", value: summary.taxRegime || "New Tax Regime" },
    { label: "Documents", value: summary.documentsUploaded },
    { label: "Refund Bank", value: summary.refundBank || "HDFC Bank •••• 1234" },
  ];

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="document-text" size={18} color="#F97316" />
        </View>
        <Text style={styles.cardTitle}>What we have</Text>
      </View>

      {/* Summary Rows */}
      <View style={styles.rowsContainer}>
        {rows.map((row, index) => {
          const isLast = index === rows.length - 1;
          return (
            <View
              key={row.label}
              style={[
                styles.row,
                !isLast && styles.rowBorder,
              ]}
            >
              <Text style={styles.rowLabel}>{row.label}</Text>
              <Text style={styles.rowValue} numberOfLines={2}>
                {row.value}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};
