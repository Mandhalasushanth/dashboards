import React from "react";
import { Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { MoneyInputField } from "@/modules/loans/components/MoneyInputField";
import { styles } from "./PersonalIncomeSections.styles";

interface PersonalLoanAmountCardProps {
  value: string;
  error?: string;
  onChange: (rawDigits: string) => void;
}

/**
 * Top card of Personal Loan Screen 2:
 * Collects required loan amount in whole rupees with Indian formatting.
 */
export const PersonalLoanAmountCard: React.FC<PersonalLoanAmountCardProps> = ({
  value,
  error,
  onChange,
}) => (
  <View style={styles.card}>
    <View style={styles.headerRow}>
      <Ionicons name="cash-outline" size={18} color="#083B75" />
      <Text style={styles.cardTitle}>How much loan do you need?</Text>
    </View>
    <MoneyInputField
      label="Requested Loan Amount"
      required
      value={value}
      onChange={onChange}
      placeholder="e.g. 2,50,000"
      error={error}
    />
  </View>
);

export default PersonalLoanAmountCard;
