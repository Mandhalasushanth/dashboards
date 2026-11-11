import React from "react";
import { View, Text } from "react-native";
import { styles } from "./StatusBadge.styles";

interface StatusBadgeProps {
  label: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ label }) => {
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
};
