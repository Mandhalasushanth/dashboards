import { StyleSheet } from "react-native";
import { BrandColors, Spacing, Typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.BACKGROUND,
  },
  content: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
  },
  footer: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    backgroundColor: BrandColors.WHITE,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  continueButton: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: BrandColors.PRIMARY_ORANGE,
  },
  continueButtonDisabled: {
    backgroundColor: "#CBD5E1",
  },
  continueButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: "700",
    color: BrandColors.WHITE,
    marginRight: 6,
  },
  subsequentPlaceholder: {
    flex: 1,
    padding: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderCard: {
    backgroundColor: BrandColors.WHITE,
    borderRadius: 16,
    padding: Spacing.xl,
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: BrandColors.CARD_BORDER,
  },
  placeholderTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: "700",
    color: BrandColors.TEXT_PRIMARY,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
    textAlign: "center",
  },
  placeholderText: {
    fontSize: Typography.fontSize.sm,
    color: BrandColors.TEXT_SECONDARY,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  returnBtn: {
    backgroundColor: BrandColors.PRIMARY_BLUE,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    borderRadius: 10,
  },
  returnBtnText: {
    color: BrandColors.WHITE,
    fontWeight: "600",
    fontSize: Typography.fontSize.sm,
  },
});
