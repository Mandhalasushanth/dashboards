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
  card: {
    backgroundColor: BrandColors.WHITE,
    borderRadius: 16,
    padding: Spacing.base,
    marginBottom: Spacing.base,
  },
  sectionTitle: {
    color: BrandColors.TEXT_PRIMARY,
    fontSize: Typography.fontSize.md,
    fontWeight: "700",
    marginBottom: Spacing.md,
  },
  field: {
    marginBottom: Spacing.md,
  },
  label: {
    color: BrandColors.TEXT_PRIMARY,
    fontSize: Typography.fontSize.xs + 1,
    fontWeight: "600",
    marginBottom: 6,
  },
  required: {
    color: "#DC2626",
  },
  input: {
    minHeight: 48,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: Typography.fontSize.sm + 1,
    color: BrandColors.TEXT_PRIMARY,
  },
  inputError: {
    borderColor: "#DC2626",
    backgroundColor: "#FEF2F2",
  },
  errorText: {
    fontSize: Typography.fontSize.xs,
    color: "#DC2626",
    marginTop: 4,
    marginLeft: 2,
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
    minHeight: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BrandColors.PRIMARY_ORANGE,
  },
  continueButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: "700",
    color: BrandColors.WHITE,
  },
});
