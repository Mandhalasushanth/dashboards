import React from "react";
import { View, Text, TextInput } from "react-native";
import { styles } from "./CardDetailsForm.styles";

export interface CardFormData {
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  cvv: string;
}

export interface CardDetailsFormProps {
  cardType: "Debit Card" | "Credit Card";
  data: CardFormData;
  onChange: (fields: Partial<CardFormData>) => void;
  errors?: Record<string, string>;
}

export const CardDetailsForm: React.FC<CardDetailsFormProps> = ({
  cardType,
  data,
  onChange,
  errors = {},
}) => {
  const formatCardNumber = (text: string) => {
    const clean = text.replace(/[^0-9]/g, "").slice(0, 16);
    const parts = clean.match(/.{1,4}/g) || [];
    return parts.join(" ");
  };

  const formatExpiry = (text: string) => {
    const clean = text.replace(/[^0-9]/g, "").slice(0, 4);
    if (clean.length > 2) {
      return `${clean.slice(0, 2)}/${clean.slice(2)}`;
    }
    return clean;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{cardType} Details</Text>

      {/* Card Number */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Card Number *</Text>
        <TextInput
          style={[styles.input, errors.cardNumber ? styles.inputError : null]}
          placeholder="XXXX XXXX XXXX XXXX"
          placeholderTextColor="#94A3B8"
          value={data.cardNumber}
          onChangeText={(t) => onChange({ cardNumber: formatCardNumber(t) })}
          keyboardType="numeric"
          maxLength={19}
        />
        {errors.cardNumber ? <Text style={styles.errorText}>{errors.cardNumber}</Text> : null}
      </View>

      {/* Cardholder Name */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Cardholder Name *</Text>
        <TextInput
          style={[styles.input, errors.cardHolder ? styles.inputError : null]}
          placeholder="Enter name on card"
          placeholderTextColor="#94A3B8"
          value={data.cardHolder}
          onChangeText={(t) => onChange({ cardHolder: t })}
        />
        {errors.cardHolder ? <Text style={styles.errorText}>{errors.cardHolder}</Text> : null}
      </View>

      {/* Expiry & CVV Row */}
      <View style={styles.row}>
        <View style={[styles.fieldGroup, { flex: 1 }]}>
          <Text style={styles.label}>Expiry (MM/YY) *</Text>
          <TextInput
            style={[styles.input, errors.expiry ? styles.inputError : null]}
            placeholder="MM/YY"
            placeholderTextColor="#94A3B8"
            value={data.expiry}
            onChangeText={(t) => onChange({ expiry: formatExpiry(t) })}
            keyboardType="numeric"
            maxLength={5}
          />
          {errors.expiry ? <Text style={styles.errorText}>{errors.expiry}</Text> : null}
        </View>

        <View style={[styles.fieldGroup, { flex: 1 }]}>
          <Text style={styles.label}>CVV / CVC *</Text>
          <TextInput
            style={[styles.input, errors.cvv ? styles.inputError : null]}
            placeholder="123"
            placeholderTextColor="#94A3B8"
            value={data.cvv}
            onChangeText={(t) => onChange({ cvv: t.replace(/[^0-9]/g, "").slice(0, 4) })}
            keyboardType="numeric"
            secureTextEntry
            maxLength={4}
          />
          {errors.cvv ? <Text style={styles.errorText}>{errors.cvv}</Text> : null}
        </View>
      </View>
    </View>
  );
};
