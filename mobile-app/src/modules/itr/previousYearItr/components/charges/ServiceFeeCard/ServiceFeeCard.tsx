import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ServiceFeeBreakdown } from "../../../types/charges.types";
import { styles } from "./ServiceFeeCard.styles";

interface ServiceFeeCardProps {
  serviceFee: ServiceFeeBreakdown;
}

export const ServiceFeeCard: React.FC<ServiceFeeCardProps> = ({ serviceFee }) => {
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name="cash-outline" size={20} color="#EA580C" />
        </View>
        <Text style={styles.headerTitle}>Finsolz service fee</Text>
      </View>

      {/* Rows */}
      <View style={styles.rowsList}>
        <View style={styles.row}>
          <Text style={styles.label}>Previous Year ITR</Text>
          <Text style={styles.value}>
            ₹{serviceFee.baseFilingFee.toLocaleString("en-IN")}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>GST @ {serviceFee.gstPercent}%</Text>
          <Text style={styles.value}>
            ₹{serviceFee.gstAmount.toLocaleString("en-IN")}
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Total Row */}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Payable to Finsolz</Text>
        <Text style={styles.totalValue}>
          ₹{serviceFee.totalServiceFee.toLocaleString("en-IN")}
        </Text>
      </View>

      {/* Separate Payments Notice */}
      <View style={styles.noteContainer}>
        <View style={styles.noteIconCircle}>
          <Ionicons name="information" size={13} color="#2563EB" />
        </View>
        <Text style={styles.noteText}>
          Two separate payments. The government charges go to the department, not to us.
        </Text>
      </View>
    </View>
  );
};
