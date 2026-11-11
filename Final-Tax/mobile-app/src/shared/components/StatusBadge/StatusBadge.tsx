import React from "react";
import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { Colors } from "@/design-system/colors";

export type StatusVariant =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "pending"
  | "completed"
  | "uploaded"
  | "rejected"
  | "paid";

export interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  style?: StyleProp<ViewStyle>;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant,
  style,
}) => {
  const norm = (variant || status || "").toLowerCase();

  let bg = Colors.primaryLight;
  let text = Colors.primary;

  if (norm.includes("success") || norm.includes("completed") || norm.includes("uploaded") || norm.includes("paid")) {
    bg = Colors.successLight;
    text = Colors.success;
  } else if (norm.includes("warning") || norm.includes("pending") || norm.includes("process")) {
    bg = Colors.warningLight;
    text = Colors.warning;
  } else if (norm.includes("error") || norm.includes("rejected") || norm.includes("failed")) {
    bg = Colors.errorLight;
    text = Colors.error;
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[styles.text, { color: text }]}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
  },
});

export default StatusBadge;
