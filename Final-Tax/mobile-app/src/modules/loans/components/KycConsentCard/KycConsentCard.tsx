import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./KycConsentCard.styles";

interface KycConsentCardProps {
  consentGiven: boolean;
  onToggleConsent: (val: boolean) => void;
  error?: string;
}

export const KycConsentCard: React.FC<KycConsentCardProps> = ({
  consentGiven,
  onToggleConsent,
  error,
}) => {
  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.consentRow}
        activeOpacity={0.8}
        onPress={() => onToggleConsent(!consentGiven)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: consentGiven }}
      >
        <View
          style={[
            styles.checkbox,
            consentGiven && styles.checkboxChecked,
          ]}
        >
          {consentGiven && (
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          )}
        </View>

        <View style={styles.consentTextWrapper}>
          <Text style={styles.consentTitle}>Consent & Authorization</Text>
          <Text style={styles.consentText}>
            I hereby authorize Finsolz and its RBI-regulated lending partners to verify my KYC details (PAN & Aadhaar) and fetch my credit records for loan evaluation in compliance with RBI norms and the Digital Personal Data Protection (DPDP) Act.
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.privacyBadge}>
        <Ionicons name="lock-closed" size={13} color="#94A3B8" />
        <Text style={styles.privacyText}>
          256-bit encryption • Strictly confidential • Never shared without consent
        </Text>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

export default KycConsentCard;
