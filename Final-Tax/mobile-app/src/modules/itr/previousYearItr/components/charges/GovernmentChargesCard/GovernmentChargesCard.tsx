import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { GovernmentChargesBreakdown } from "../../../types/charges.types";
import { styles } from "./GovernmentChargesCard.styles";

interface GovernmentChargesCardProps {
  charges: GovernmentChargesBreakdown;
}

export const GovernmentChargesCard: React.FC<GovernmentChargesCardProps> = ({
  charges,
}) => {
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name="business-outline" size={20} color="#0B1F3A" />
        </View>
        <Text style={styles.headerTitle}>Government charges{"\n"}(estimated)</Text>
      </View>

      {/* Rows */}
      <View style={styles.rowsList}>
        <View style={styles.row}>
          <Text style={styles.label}>Late filing fee — Sec 234F</Text>
          <Text style={styles.value}>
            ₹{charges.lateFilingFeeSec234F.toLocaleString("en-IN")}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Interest — Sec 234A</Text>
          <Text style={styles.value}>
            ₹{charges.interestSec234A.toLocaleString("en-IN")}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Additional tax — ITR-U</Text>
          <Text style={styles.value}>
            ₹{charges.additionalTaxItrU.toLocaleString("en-IN")}
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Total Row */}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Payable to department</Text>
        <Text style={styles.totalValue}>
          ₹{charges.totalGovernmentCharges.toLocaleString("en-IN")}
        </Text>
      </View>
    </View>
  );
};
