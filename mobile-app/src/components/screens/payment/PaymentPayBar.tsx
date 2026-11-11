import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { formatIndianCurrency } from "@/shared/formatters/currencyFormatter";
import { PrimaryButton } from "@/shared/components/Button/PrimaryButton";
import {
  styles,
  getPayBarThemedStyle,
} from "@/styles/app/payment/[id].styles";
import type { useTheme } from "@/hooks/use-theme";

interface PaymentPayBarProps {
  alreadyPaid: boolean;
  hasValidAmount: boolean;
  total: number;
  processing: boolean;
  onPay: () => void;
  colors: ReturnType<typeof useTheme>;
  bottomInset: number;
}

export function PaymentPayBar({
  alreadyPaid,
  hasValidAmount,
  total,
  processing,
  onPay,
  colors,
  bottomInset,
}: PaymentPayBarProps) {
  const getButtonTitle = () => {
    if (alreadyPaid) return "Already Paid";
    if (hasValidAmount) return `Pay Securely ${formatIndianCurrency(total)}`;
    return "Fee Pending Calculation";
  };

  return (
    <>
      {/* ---------- Sticky pay bar ---------- */}
      <View style={[styles.payBar, getPayBarThemedStyle(colors, bottomInset)]}>
        <PrimaryButton
          title={getButtonTitle()}
          onPress={onPay}
          loading={processing}
          disabled={alreadyPaid || !hasValidAmount}
          colorType="orange"
        />
      </View>
    </>
  );
}

export function PaymentSecurityNote({
  colors,
}: {
  colors: ReturnType<typeof useTheme>;
}) {
  return (
    <View style={[styles.secureNote, { backgroundColor: "#FFF4EC" }]}>
      <Ionicons name="shield-checkmark" size={16} color={colors.orange} />
      <Text style={[styles.secureText, { color: colors.textSecondary }]}>
        Payments are processed over an encrypted connection. Finsolz never
        stores your card or UPI credentials.
      </Text>
    </View>
  );
}
