import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "../../../../hooks/use-theme";
import { BorderRadius, Spacing, Typography } from "../../../../shared/theme";
import { lockoutMessage, type LockoutKind } from "../../services/lockoutPolicy";

interface LockoutNoticeProps {
  kind: LockoutKind;
  /** Seconds left; the notice renders nothing once this reaches 0. */
  remainingSeconds: number;
}

/** Live "try again in m:ss" notice shown while verification or login is locked. */
export function LockoutNotice({ kind, remainingSeconds }: LockoutNoticeProps) {
  const colors = useTheme();
  if (remainingSeconds <= 0) return null;

  return (
    <View
      accessibilityRole="alert"
      style={[styles.container, { borderColor: colors.error, backgroundColor: `${colors.error}14` }]}
    >
      <Ionicons name="lock-closed-outline" size={18} color={colors.error} />
      <Text style={[styles.text, { color: colors.error }]}>{lockoutMessage(kind, remainingSeconds)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  text: {
    flex: 1,
    fontSize: Typography.fontSize.sm + 0.5,
    fontWeight: Typography.fontWeight.semiBold,
  },
});

export default LockoutNotice;
