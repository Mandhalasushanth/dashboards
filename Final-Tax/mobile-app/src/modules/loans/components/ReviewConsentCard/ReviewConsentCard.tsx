import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./ReviewConsentCard.styles";

interface ReviewConsentCardProps {
  isConfirmed: boolean;
  onToggleConfirm: (val: boolean) => void;
  error?: string;
}

export const ReviewConsentCard: React.FC<ReviewConsentCardProps> = ({
  isConfirmed,
  onToggleConfirm,
  error,
}) => {
  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.consentRow}
        activeOpacity={0.8}
        onPress={() => onToggleConfirm(!isConfirmed)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isConfirmed }}
        accessibilityLabel="Confirm application accuracy declaration"
      >
        <View
          style={[
            styles.checkbox,
            isConfirmed && styles.checkboxChecked,
          ]}
        >
          {isConfirmed && (
            <Ionicons name="checkmark" size={15} color="#FFFFFF" />
          )}
        </View>

        <View style={styles.consentTextWrapper}>
          <Text style={styles.consentTitle}>Applicant Declaration</Text>
          <Text style={styles.consentText}>
            I confirm that the information provided in this application is accurate and complete.
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.trustBadge}>
        <Ionicons name="shield-checkmark-outline" size={14} color="#166534" />
        <Text style={styles.trustText}>
          Agent Review • Verified Lending Partners • Zero Upfront Charges
        </Text>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

export default ReviewConsentCard;
