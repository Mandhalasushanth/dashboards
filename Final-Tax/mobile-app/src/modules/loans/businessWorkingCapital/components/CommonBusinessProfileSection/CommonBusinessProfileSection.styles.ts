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
    backgroundColor: "#EAF1FE",
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
  input: {
    height: 48,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.fontSize.sm,
    color: BrandColors.TEXT_PRIMARY,
  },
  textArea: {
    height: 72,
    paddingTop: Spacing.sm + 2,
    textAlignVertical: "top",
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
  helperText: {
    fontSize: Typography.fontSize.xs - 1,
    color: BrandColors.TEXT_MUTED,
    marginTop: 4,
    marginLeft: 2,
  },
  twoColRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  col: {
    flex: 1,
  },
  toggleContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: 4,
  },
  toggleButton: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  toggleButtonActive: {
    borderColor: BrandColors.PRIMARY_BLUE,
    backgroundColor: "#083B75",
  },

  toggleText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: "600",
    color: BrandColors.TEXT_SECONDARY,
  },
  toggleTextActive: {
    color: BrandColors.WHITE,
  },
});
