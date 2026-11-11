import { StyleSheet } from "react-native";
import {
  BrandColors,
  BorderRadius,
  BorderWidth,
  Spacing,
  Typography,
} from "@/shared/theme";

export const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: BrandColors.WHITE,
    borderRadius: BorderRadius.base,
    borderWidth: BorderWidth.thin,
    borderColor: BrandColors.BORDER,
    padding: Spacing.base,
    marginBottom: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: BorderWidth.thin,
    borderBottomColor: "#F1F5F9",
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: BrandColors.TEXT_PRIMARY,
    letterSpacing: -0.2,
  },
  badgeEstimate: {
    backgroundColor: BrandColors.PRIMARY_LIGHT_BLUE,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
  },
  badgeEstimateText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semiBold,
    color: BrandColors.PRIMARY_BLUE_ACCENT,
  },
  rowsList: {
    gap: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowLabel: {
    fontSize: Typography.fontSize.sm,
    color: BrandColors.TEXT_SECONDARY,
  },
  rowValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: BrandColors.TEXT_PRIMARY,
  },
  deductionValue: {
    color: "#16A34A",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 4,
  },
  taxableRow: {
    paddingVertical: 4,
  },
  taxableLabel: {
    fontSize: Typography.fontSize.sm + 0.5,
    fontWeight: Typography.fontWeight.bold,
    color: BrandColors.TEXT_PRIMARY,
  },
  taxableValue: {
    fontSize: Typography.fontSize.sm + 0.5,
    fontWeight: Typography.fontWeight.bold,
    color: BrandColors.TEXT_PRIMARY,
  },
  creditsSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: BorderWidth.thin,
    borderTopColor: "#F1F5F9",
    gap: 8,
  },
  sectionSubhead: {
    fontSize: Typography.fontSize.xs + 1,
    fontWeight: Typography.fontWeight.bold,
    color: BrandColors.PRIMARY_BLUE,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  finalHeroBox: {
    marginTop: Spacing.base,
    padding: Spacing.base,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  finalHeroRefund: {
    backgroundColor: "#F0FDF4",
    borderWidth: BorderWidth.thin,
    borderColor: "#BBF7D0",
  },
  finalHeroPayable: {
    backgroundColor: "#FEF2F2",
    borderWidth: BorderWidth.thin,
    borderColor: "#FECACA",
  },
  finalHeroLabel: {
    fontSize: Typography.fontSize.xs + 1,
    fontWeight: Typography.fontWeight.bold,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  finalHeroLabelRefund: {
    color: "#16A34A",
  },
  finalHeroLabelPayable: {
    color: "#DC2626",
  },
  finalHeroAmount: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  finalHeroAmountRefund: {
    color: "#15803D",
  },
  finalHeroAmountPayable: {
    color: "#B91C1C",
  },
  disclaimerBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.md,
    gap: 8,
    borderWidth: BorderWidth.thin,
    borderColor: BrandColors.BORDER,
  },
  disclaimerText: {
    flex: 1,
    fontSize: Typography.fontSize.xs,
    color: BrandColors.TEXT_SECONDARY,
    lineHeight: 16,
  },
});
