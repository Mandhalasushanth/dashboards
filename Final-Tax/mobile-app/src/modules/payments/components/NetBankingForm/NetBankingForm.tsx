import React from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { styles } from "./NetBankingForm.styles";

const POPULAR_BANKS = [
  { id: "hdfc", name: "HDFC Bank" },
  { id: "sbi", name: "State Bank of India" },
  { id: "icici", name: "ICICI Bank" },
  { id: "axis", name: "Axis Bank" },
  { id: "kotak", name: "Kotak Bank" },
  { id: "pnb", name: "Punjab National Bank" },
];

export interface NetBankingFormData {
  selectedBank: string;
  customerId: string;
}

export interface NetBankingFormProps {
  data: NetBankingFormData;
  onChange: (fields: Partial<NetBankingFormData>) => void;
  errors?: Record<string, string>;
}

export const NetBankingForm: React.FC<NetBankingFormProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Net Banking Details</Text>
      <Text style={styles.subHeading}>Select your bank</Text>

      {/* Popular Banks 2x3 Grid */}
      <View style={styles.bankGrid}>
        {POPULAR_BANKS.map((bank) => {
          const isSelected = data.selectedBank === bank.name;
          return (
            <TouchableOpacity
              key={bank.id}
              style={[styles.bankPill, isSelected ? styles.bankPillActive : null]}
              activeOpacity={0.75}
              onPress={() => onChange({ selectedBank: bank.name })}
            >
              <Text style={[styles.bankName, isSelected ? styles.bankNameActive : null]}>
                {bank.name}
              </Text>
              {isSelected && <Ionicons name="checkmark-circle" size={14} color={BrandColors.PRIMARY_ORANGE} />}
            </TouchableOpacity>
          );
        })}
      </View>
      {errors.selectedBank ? <Text style={styles.errorText}>{errors.selectedBank}</Text> : null}

      {/* Customer ID / Account Number */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Customer ID / User ID *</Text>
        <TextInput
          style={[styles.input, errors.customerId ? styles.inputError : null]}
          placeholder="Enter bank User ID / Customer ID"
          placeholderTextColor="#94A3B8"
          value={data.customerId}
          onChangeText={(t) => onChange({ customerId: t })}
          autoCapitalize="none"
        />
        {errors.customerId ? <Text style={styles.errorText}>{errors.customerId}</Text> : null}
      </View>
    </View>
  );
};
