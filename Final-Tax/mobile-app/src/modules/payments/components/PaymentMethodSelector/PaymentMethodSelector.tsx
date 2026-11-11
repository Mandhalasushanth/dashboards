import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { CardDetailsForm, CardFormData } from "../CardDetailsForm/CardDetailsForm";
import { NetBankingForm, NetBankingFormData } from "../NetBankingForm/NetBankingForm";
import { styles, getIconBoxBgStyle } from "./PaymentMethodSelector.styles";

export type { CardFormData, NetBankingFormData };
export type PaymentMethodType = "upi" | "debit" | "credit" | "netbanking";

const UPI_APPS = [
  { id: "phonepe", label: "PhonePe", handle: "ybl" },
  { id: "gpay", label: "GPay", handle: "okaxis" },
  { id: "paytm", label: "Paytm", handle: "paytm" },
  { id: "bhim", label: "BHIM", handle: "upi" },
];

const METHODS = [
  { id: "upi" as const, title: "UPI", subtitle: "Pay via any UPI app", icon: "phone-portrait", iconBg: "#DCFCE7", iconColor: "#16A34A" },
  { id: "debit" as const, title: "Debit Card", subtitle: "Visa / Mastercard / RuPay", icon: "card", iconBg: "#E0F2FE", iconColor: "#0284C7" },
  { id: "credit" as const, title: "Credit Card", subtitle: "Visa / Mastercard / Amex", icon: "card", iconBg: "#E0F2FE", iconColor: "#2563EB" },
  { id: "netbanking" as const, title: "Net Banking", subtitle: "All major banks", icon: "business", iconBg: "#F1F5F9", iconColor: "#475569" },
];

export interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethodType;
  onSelectMethod: (method: PaymentMethodType) => void;
  upiId: string;
  onChangeUpiId: (id: string) => void;
  upiError?: string;
  cardData?: CardFormData;
  onChangeCardData?: (fields: Partial<CardFormData>) => void;
  cardErrors?: Record<string, string>;
  netBankingData?: NetBankingFormData;
  onChangeNetBankingData?: (fields: Partial<NetBankingFormData>) => void;
  netBankingErrors?: Record<string, string>;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onSelectMethod,
  upiId,
  onChangeUpiId,
  upiError,
  cardData = { cardNumber: "", cardHolder: "", expiry: "", cvv: "" },
  onChangeCardData = () => {},
  cardErrors = {},
  netBankingData = { selectedBank: "", customerId: "" },
  onChangeNetBankingData = () => {},
  netBankingErrors = {},
}) => {
  const handleSelectApp = (handle: string) => {
    const username = upiId.includes("@") ? upiId.split("@")[0] : upiId || "";
    onChangeUpiId(username ? `${username}@${handle}` : `@${handle}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Choose Payment Method</Text>

      {/* Methods Radio List */}
      {METHODS.map((m) => {
        const isSelected = selectedMethod === m.id;
        return (
          <TouchableOpacity
            key={m.id}
            style={[styles.card, isSelected ? styles.cardActive : null]}
            activeOpacity={0.8}
            onPress={() => onSelectMethod(m.id)}
          >
            <View style={[styles.iconBox, getIconBoxBgStyle(m.iconBg)]}>
              <Ionicons name={m.icon as any} size={20} color={m.iconColor} />
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.title}>{m.title}</Text>
              <Text style={styles.subtitle}>{m.subtitle}</Text>
            </View>
            <View style={[styles.radio, isSelected ? styles.radioActive : null]}>
              {isSelected && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
            </View>
          </TouchableOpacity>
        );
      })}

      {/* Dynamic Sub-form based on selection */}
      {selectedMethod === "upi" && (
        <View style={styles.upiCard}>
          <Text style={styles.upiLabel}>UPI ID *</Text>
          <TextInput
            style={[styles.upiInput, upiError ? styles.inputError : null]}
            placeholder="e.g. mobileNumber@upi / yourname@okhdfcbank"
            placeholderTextColor="#94A3B8"
            value={upiId}
            onChangeText={onChangeUpiId}
            autoCapitalize="none"
          />
          {upiError ? <Text style={styles.errorText}>{upiError}</Text> : null}

          <View style={styles.pillsRow}>
            {UPI_APPS.map((app) => (
              <TouchableOpacity
                key={app.id}
                style={styles.pill}
                activeOpacity={0.7}
                onPress={() => handleSelectApp(app.handle)}
              >
                <Text style={styles.pillText}>{app.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {(selectedMethod === "debit" || selectedMethod === "credit") && (
        <CardDetailsForm
          cardType={selectedMethod === "debit" ? "Debit Card" : "Credit Card"}
          data={cardData}
          onChange={onChangeCardData}
          errors={cardErrors}
        />
      )}

      {selectedMethod === "netbanking" && (
        <NetBankingForm
          data={netBankingData}
          onChange={onChangeNetBankingData}
          errors={netBankingErrors}
        />
      )}

      {/* PCI-DSS Security Banner */}
      <View style={styles.securityBanner}>
        <Ionicons name="shield-checkmark" size={16} color="#083B75" />
        <Text style={styles.securityText}>
          256-bit encrypted & PCI-DSS compliant secure payment gateway
        </Text>
      </View>
    </View>
  );
};
