import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  styles,
  getMethodCardThemedStyle,
} from "@/styles/app/payment/[id].styles";
import type { useTheme } from "@/hooks/use-theme";
import type { IconName } from "@/types/domain";

export type PaymentMethodId = "UPI" | "DEBIT" | "CREDIT" | "NETBANKING";

export interface PaymentMethod {
  id: PaymentMethodId;
  icon: IconName;
  title: string;
  subtitle: string;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "UPI",
    icon: "phone-portrait",
    title: "UPI",
    subtitle: "Pay via any UPI app",
  },
  {
    id: "DEBIT",
    icon: "card",
    title: "Debit Card",
    subtitle: "Visa / Mastercard / RuPay",
  },
  {
    id: "CREDIT",
    icon: "card",
    title: "Credit Card",
    subtitle: "Visa / Mastercard / Amex",
  },
  {
    id: "NETBANKING",
    icon: "business",
    title: "Net Banking",
    subtitle: "All major banks",
  },
];

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethodId;
  onSelectMethod: (method: PaymentMethodId) => void;
  colors: ReturnType<typeof useTheme>;
}

export function PaymentMethodSelector({
  selectedMethod,
  onSelectMethod,
  colors,
}: PaymentMethodSelectorProps) {
  return (
    <View>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Choose Payment Method
      </Text>

      {PAYMENT_METHODS.map((item) => {
        const selected = selectedMethod === item.id;
        return (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.8}
            onPress={() => onSelectMethod(item.id)}
            style={[styles.methodCard, getMethodCardThemedStyle(selected, colors)]}
          >
            <View
              style={[
                styles.methodIcon,
                { backgroundColor: selected ? "#D8E6F5" : "#E8EFF7" },
              ]}
            >
              <Ionicons
                name={item.icon}
                size={20}
                color={selected ? colors.primary : colors.textSecondary}
              />
            </View>
            <View style={styles.methodText}>
              <Text
                style={[
                  styles.methodTitle,
                  { color: selected ? colors.primary : colors.text },
                ]}
              >
                {item.title}
              </Text>
              <Text
                style={[
                  styles.methodSub,
                  {
                    color: selected ? colors.primary : colors.textSecondary,
                  },
                ]}
              >
                {item.subtitle}
              </Text>
            </View>
            <Ionicons
              name={selected ? "radio-button-on" : "radio-button-off"}
              size={20}
              color={selected ? colors.primary : colors.border}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
