import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./ReusableStepCard.styles";

interface ReusableStepCardProps {
  stepNumber: number;
  title: string;
  description: string;
  iconName: "briefcase-outline" | "document-text-outline" | "calculator-outline";
  trailingLabel?: string;
}

export const ReusableStepCard: React.FC<ReusableStepCardProps> = ({
  stepNumber: _stepNumber,
  title,
  description,
  iconName,
  trailingLabel = "Same as ITR Filing",
}) => {
  return (
    <View style={styles.card}>
      {/* Icon */}
      <View style={styles.iconBox}>
        <Ionicons name={iconName} size={22} color="#EA580C" />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <View style={styles.trailingBadge}>
            <Text style={styles.trailingBadgeText}>{trailingLabel}</Text>
          </View>
        </View>

        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
};
