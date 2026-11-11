import { StyleSheet } from "react-native";
import { BrandColors, Spacing, Typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: BrandColors.WHITE,
    borderRadius: 16,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: BrandColors.CARD_BORDER,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.xs + 2,
  },
  title: {
    fontSize: Typography.fontSize.md,
    fontWeight: "700",
    color: BrandColors.TEXT_PRIMARY,
  },
  subtitle: {
    fontSize: Typography.fontSize.xs,
    color: BrandColors.TEXT_SECONDARY,
    marginBottom: Spacing.base,
    lineHeight: 18,
  },
  fieldWrapper: {
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    fontSize: Typography.fontSize.xs + 1,
    fontWeight: "600",
    color: BrandColors.TEXT_PRIMARY,
    marginBottom: 6,
  },
  requiredStar: {
    color: BrandColors.PRIMARY_ORANGE,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingHorizontal: Spacing.md,
    height: 48,
  },
  inputRowError: {
    borderColor: "#DC2626",
    backgroundColor: "#FEF2F2",
  },
  currencyPrefix: {
    fontSize: Typography.fontSize.base,
    fontWeight: "700",
    color: BrandColors.PRIMARY_BLUE,
    marginRight: 8,
  },

  currencyInput: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    fontWeight: "600",
    color: BrandColors.TEXT_PRIMARY,
    padding: 0,
  },
  standardInput: {
    height: 48,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.fontSize.sm,
    color: BrandColors.TEXT_PRIMARY,
  },
  standardInputError: {
    borderColor: "#DC2626",
    backgroundColor: "#FEF2F2",
  },
  textArea: {
    height: 64,
    paddingTop: Spacing.sm + 2,
    textAlignVertical: "top",
  },
  twoColRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  col: {
    flex: 1,
  },
  errorText: {
    fontSize: Typography.fontSize.xs,
    color: "#DC2626",
    marginTop: 4,
    marginLeft: 2,
  },
  helperText: {
    fontSize: Typography.fontSize.xs - 1,
    color: BrandColors.TEXT_MUTED,
    marginTop: 4,
    marginLeft: 2,
  },
});
