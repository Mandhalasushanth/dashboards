import { StyleSheet } from "react-native";
import { BorderRadius, BrandColors, Spacing, Typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.BACKGROUND,
  },
  body: {
    flex: 1,
    padding: Spacing.base,
    justifyContent: "center",
  },
  card: {
    alignItems: "center",
    backgroundColor: BrandColors.WHITE,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: BrandColors.CARD_BORDER,
    padding: Spacing.xl,
  },
  title: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: BrandColors.TEXT_PRIMARY,
    textAlign: "center",
  },
  text: {
    marginTop: Spacing.xs,
    fontSize: Typography.fontSize.base,
    color: BrandColors.TEXT_SECONDARY,
    textAlign: "center",
  },
});
