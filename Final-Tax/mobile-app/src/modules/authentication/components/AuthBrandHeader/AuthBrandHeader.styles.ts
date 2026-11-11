import { StyleSheet } from "react-native";
import { Spacing, BorderRadius, Typography } from "../../../../shared/theme";

export const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  logo: {
    width: 76,
    height: 76,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  brandTitle: {
    fontSize: Typography.fontSize.hero,
    fontWeight: Typography.fontWeight.extraBold,
    letterSpacing: 2,
  },
  brandSub: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 3.5,
    marginTop: 3,
  },
});
