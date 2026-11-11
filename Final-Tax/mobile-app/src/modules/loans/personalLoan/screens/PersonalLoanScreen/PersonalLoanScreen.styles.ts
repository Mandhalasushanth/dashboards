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
    paddingBottom: Spacing.xl,
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
});
