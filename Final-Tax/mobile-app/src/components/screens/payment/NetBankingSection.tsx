import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  styles,
  getThemedCardStyle,
} from "@/styles/app/payment/[id].styles";
import type { useTheme } from "@/hooks/use-theme";

export const POPULAR_BANKS = [
  "HDFC Bank",
  "ICICI Bank",
  "State Bank of India",
  "Axis Bank",
];

interface NetBankingSectionProps {
  selectedBank: string;
  onSelectBank: (bank: string) => void;
  colors: ReturnType<typeof useTheme>;
}

export function NetBankingSection({
  selectedBank,
  onSelectBank,
  colors,
}: NetBankingSectionProps) {
  return (
    <View style={[styles.detailCard, getThemedCardStyle(colors)]}>
      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
        Select Bank
      </Text>
      <View>
        {POPULAR_BANKS.map((bankName, index) => {
          const isSelected = selectedBank === bankName;
          const isLast = index === POPULAR_BANKS.length - 1;
          return (
            <TouchableOpacity
              key={bankName}
              activeOpacity={0.7}
              onPress={() => onSelectBank(bankName)}
              style={[
                styles.bankOption,
                { borderBottomColor: isLast ? "transparent" : colors.border },
              ]}
            >
              <Text
                style={[
                  styles.bankText,
                  { color: isSelected ? colors.primary : colors.text },
                ]}
              >
                {bankName}
              </Text>
              <Ionicons
                name={isSelected ? "radio-button-on" : "radio-button-off"}
                size={18}
                color={isSelected ? colors.primary : colors.border}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
