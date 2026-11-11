import { StyleSheet } from "react-native";
import { BorderRadius, BrandColors, Shadows, Spacing, Typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.BACKGROUND,
  },
  headerSafeArea: {
    backgroundColor: BrandColors.WHITE,
  },
  content: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
  },
  introBody: {
    marginBottom: Spacing.base,
    fontSize: Typography.fontSize.base,
    lineHeight: 20,
    color: BrandColors.TEXT_SECONDARY,
  },
  groupTitle: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.6,
    color: BrandColors.TEXT_SECONDARY,
    textTransform: "uppercase",
  },
  footer: {
    backgroundColor: BrandColors.WHITE,
    borderTopWidth: 1,
    borderTopColor: BrandColors.BORDER,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    ...Shadows.md,
  },
  footerHint: {
    marginBottom: Spacing.sm,
    textAlign: "center",
    fontSize: Typography.fontSize.sm,
    color: BrandColors.TEXT_SECONDARY,
  },
  continueButton: {
    minHeight: 52,
    borderRadius: BorderRadius.md,
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  continueButtonDisabled: {
    backgroundColor: "#CBD5E1",
  },
  continueText: {
    color: BrandColors.WHITE,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
});
