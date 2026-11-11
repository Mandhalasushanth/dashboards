import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import {
  styles,
  getThemedCardStyle,
  getInputThemedStyle,
  getUpiChipThemedStyle,
} from "@/styles/app/payment/[id].styles";
import type { useTheme } from "@/hooks/use-theme";

export const UPI_APPS: { label: string; suffix: string }[] = [
  { label: "PhonePe", suffix: "@ybl" },
  { label: "GPay", suffix: "@okicici" },
  { label: "Paytm", suffix: "@paytm" },
  { label: "BHIM", suffix: "@upi" },
];

interface UpiPaymentSectionProps {
  upiId: string;
  setUpiId: (text: string) => void;
  colors: ReturnType<typeof useTheme>;
}

export function UpiPaymentSection({
  upiId,
  setUpiId,
  colors,
}: UpiPaymentSectionProps) {
  const handleAppChipPress = (suffix: string) => {
    const handle = upiId.includes("@") ? upiId.split("@")[0] : upiId;
    setUpiId((handle || "username") + suffix);
  };

  return (
    <View style={[styles.detailCard, getThemedCardStyle(colors)]}>
      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
        Enter UPI ID / VPA
      </Text>
      <TextInput
        value={upiId}
        onChangeText={setUpiId}
        placeholder="username@bank"
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
        style={[styles.input, getInputThemedStyle(colors)]}
      />

      <View style={styles.chipRow}>
        {UPI_APPS.map((app) => (
          <TouchableOpacity
            key={app.label}
            activeOpacity={0.7}
            onPress={() => handleAppChipPress(app.suffix)}
            style={[styles.chip, getUpiChipThemedStyle(colors)]}
          >
            <Text style={[styles.chipText, { color: colors.primary }]}>
              {app.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
