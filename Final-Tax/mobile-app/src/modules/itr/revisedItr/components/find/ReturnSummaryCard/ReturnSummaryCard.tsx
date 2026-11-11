import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { OriginalReturnDetails } from "../../../types/revisedItr.types";
import { styles } from "./ReturnSummaryCard.styles";

interface ReturnSummaryCardProps {
  details: OriginalReturnDetails;
}

export const ReturnSummaryCard: React.FC<ReturnSummaryCardProps> = ({ details }) => {
  const cleanForm = details.itrForm.replace(/\s*\(.*\)/, "");

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Original Return Found</Text>
        <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
      </View>

      <View style={styles.divider} />

      <View style={styles.detailsGrid}>
        <View style={styles.row}>
          <Text style={styles.label}>Filed:</Text>
          <Text style={styles.value}>{details.filingDate}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Assessment Year:</Text>
          <Text style={styles.value}>{details.assessmentYear}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>ITR Form:</Text>
          <Text style={styles.value}>{cleanForm}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Gross Total Income:</Text>
          <Text style={[styles.value, styles.incomeValue]}>
            {details.grossTotalIncome}
          </Text>
        </View>
      </View>
    </View>
  );
};
