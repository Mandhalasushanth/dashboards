import { StyleSheet } from "react-native";
import { BorderRadius, BrandColors, Shadows, Spacing, Typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.BACKGROUND,
  },
  content: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  generalErrorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.base,
  },
  generalErrorText: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    color: "#B91C1C",
    lineHeight: 19,
  },
  footer: {
    backgroundColor: BrandColors.WHITE,
    borderTopWidth: 1,
    borderTopColor: BrandColors.BORDER,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    ...Shadows.md,
  },
  submitButton: {
    minHeight: 54,
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    borderRadius: BorderRadius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: BrandColors.WHITE,
  },
  secureRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: Spacing.sm,
  },
  secureText: {
    fontSize: Typography.fontSize.xs,
    color: BrandColors.TEXT_SECONDARY,
  },
});
