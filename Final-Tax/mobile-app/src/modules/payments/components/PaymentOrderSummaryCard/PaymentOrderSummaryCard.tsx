import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./PaymentOrderSummaryCard.styles";

export interface PaymentOrderSummaryCardProps {
  serviceTitle?: string;
  businessSubtitle?: string;
  professionalFee?: string;
  gstAmount?: string;
  discountAmount?: string;
  totalAmount?: string;
}

export const PaymentOrderSummaryCard: React.FC<PaymentOrderSummaryCardProps> = ({
  serviceTitle = "GST Registration",
  businessSubtitle = "Pavan Enterprises • Bengaluru",
  professionalFee = "₹1,986",
  gstAmount = "₹358",
  discountAmount = "₹0",
  totalAmount = "₹2,344",
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Order Summary</Text>

      <View style={styles.serviceRow}>
        <View style={styles.iconBox}>
          <Ionicons name="document-text" size={20} color="#6366F1" />
        </View>
        <View style={styles.textCol}>
          <Text style={styles.title}>{serviceTitle}</Text>
          <Text style={styles.subtitle}>{businessSubtitle}</Text>
        </View>
      </View>

      <View style={styles.calcList}>
        <View style={styles.calcRow}>
          <Text style={styles.calcLabel}>Professional Fee</Text>
          <Text style={styles.calcValue}>{professionalFee}</Text>
        </View>
        <View style={styles.calcRow}>
          <Text style={styles.calcLabel}>GST (18%)</Text>
          <Text style={styles.calcValue}>{gstAmount}</Text>
        </View>
        <View style={styles.calcRow}>
          <Text style={styles.calcLabel}>Discount</Text>
          <Text style={styles.calcValue}>{discountAmount}</Text>
        </View>
      </View>

      <View style={styles.totalBanner}>
        <Text style={styles.totalLabel}>Total Amount</Text>
        <Text style={styles.totalValue}>{totalAmount}</Text>
      </View>
    </View>
  );
};
