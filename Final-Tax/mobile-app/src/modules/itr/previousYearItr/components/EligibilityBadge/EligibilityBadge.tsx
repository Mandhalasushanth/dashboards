import React from "react";
import { View, Text } from "react-native";
import { styles } from "./EligibilityBadge.styles";

export type BadgeVariant = "closed" | "eligible" | "selected";

interface EligibilityBadgeProps {
  variant: BadgeVariant;
}

export const EligibilityBadge: React.FC<EligibilityBadgeProps> = ({ variant }) => {
  if (variant === "selected") {
    return (
      <View style={[styles.badge, styles.selectedBadge]}>
        <Text style={[styles.text, styles.selectedText]}>Selected</Text>
      </View>
    );
  }

  if (variant === "eligible") {
    return (
      <View style={[styles.badge, styles.eligibleBadge]}>
        <Text style={[styles.text, styles.eligibleText]}>Eligible</Text>
      </View>
    );
  }

  return (
    <View style={[styles.badge, styles.closedBadge]}>
      <Text style={[styles.text, styles.closedText]}>Closed</Text>
    </View>
  );
};
