import { StyleSheet, Platform } from "react-native";
import {
  BrandColors,
  BorderRadius,
  BorderWidth,
  Spacing,
  Typography,
} from "@/shared/theme";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: BrandColors.WHITE,
    borderRadius: BorderRadius.base,
    padding: Spacing.base,
    borderWidth: BorderWidth.thin,
    borderColor: BrandColors.BORDER,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  cardHeader: {
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: BorderWidth.thin,
    borderBottomColor: "#F1F5F9",
  },
  serviceLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: BrandColors.PRIMARY_ORANGE,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  cardTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: BrandColors.TEXT_PRIMARY,
    marginTop: 2,
  },
  rowsList: {
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLabel: {
    fontSize: Typography.fontSize.sm,
    color: BrandColors.TEXT_SECONDARY,
    fontWeight: Typography.fontWeight.medium,
  },
  rowValue: {
    fontSize: Typography.fontSize.sm + 0.5,
    fontWeight: Typography.fontWeight.semiBold,
    color: BrandColors.TEXT_PRIMARY,
  },
  refundValue: {
    color: "#16A34A",
    fontWeight: Typography.fontWeight.bold,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 4,
  },
  totalLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: BrandColors.TEXT_PRIMARY,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: "800",
    color: BrandColors.PRIMARY_ORANGE,
    letterSpacing: -0.5,
  },
  noticeBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: BorderRadius.sm,
    padding: 10,
    marginTop: 14,
    borderWidth: BorderWidth.thin,
    borderColor: BrandColors.BORDER,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  noticeText: {
    flex: 1,
    fontSize: Typography.fontSize.xs,
    color: BrandColors.TEXT_SECONDARY,
    lineHeight: 16,
  },
});
