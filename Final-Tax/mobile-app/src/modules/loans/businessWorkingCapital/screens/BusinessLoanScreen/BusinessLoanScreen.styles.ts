import { StyleSheet } from "react-native";
import { BrandColors, Spacing, Typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
  },
  footer: {
    backgroundColor: BrandColors.WHITE,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  continueButton: {
    height: 52,
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: BrandColors.PRIMARY_ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonDisabled: {
    backgroundColor: "#CBD5E1",
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: "700",
    color: BrandColors.WHITE,
  },
  stepIndicatorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#EEF2F6",
    borderRadius: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    marginBottom: Spacing.sm,
  },
  stepIndicatorText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: "600",
    color: BrandColors.PRIMARY_BLUE,
  },
  stepTag: {
    fontSize: Typography.fontSize.xs - 1,
    fontWeight: "700",
    color: BrandColors.PRIMARY_ORANGE,
    backgroundColor: "#FFF7ED",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
});
