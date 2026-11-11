import React from "react";
import { View, Text, TextInput } from "react-native";
import {
  styles,
  getThemedCardStyle,
  getInputThemedStyle,
} from "@/styles/app/payment/[id].styles";
import type { useTheme } from "@/hooks/use-theme";

interface CardPaymentSectionProps {
  cardNumber: string;
  setCardNumber: (text: string) => void;
  cardExpiry: string;
  setCardExpiry: (text: string) => void;
  cardCvv: string;
  setCardCvv: (text: string) => void;
  colors: ReturnType<typeof useTheme>;
}

export function CardPaymentSection({
  cardNumber,
  setCardNumber,
  cardExpiry,
  setCardExpiry,
  cardCvv,
  setCardCvv,
  colors,
}: CardPaymentSectionProps) {
  const inputStyle = getInputThemedStyle(colors);

  return (
    <View style={[styles.detailCard, getThemedCardStyle(colors)]}>
      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
        Card Number
      </Text>
      <TextInput
        value={cardNumber}
        onChangeText={setCardNumber}
        placeholder="1234 5678 9012 3456"
        placeholderTextColor={colors.textSecondary}
        keyboardType="numeric"
        maxLength={19}
        style={[styles.input, inputStyle]}
      />

      <View style={styles.fieldRow}>
        <View style={styles.fieldHalf}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            Expiry
          </Text>
          <TextInput
            value={cardExpiry}
            onChangeText={setCardExpiry}
            placeholder="MM/YY"
            placeholderTextColor={colors.textSecondary}
            maxLength={5}
            style={[styles.input, inputStyle]}
          />
        </View>
        <View style={styles.fieldHalf}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            CVV
          </Text>
          <TextInput
            value={cardCvv}
            onChangeText={setCardCvv}
            placeholder="123"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
            secureTextEntry
            maxLength={4}
            style={[styles.input, inputStyle]}
          />
        </View>
      </View>
    </View>
  );
}
