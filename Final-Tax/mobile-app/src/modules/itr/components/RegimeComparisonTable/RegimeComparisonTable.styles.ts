import { StyleSheet } from "react-native";
import { BrandColors, Typography, Spacing, BorderRadius } from "@/shared/theme";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  title: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: "#0F172A",
  },
  ayBadge: {
    backgroundColor: "#EAF1FE",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  ayBadgeText: {
    fontSize: Typography.fontSize.xs - 1,
    fontWeight: Typography.fontWeight.bold,
    color: "#083B75",
  },
  description: {
    fontSize: Typography.fontSize.xs,
    color: "#64748B",
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  tableContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    marginBottom: Spacing.md,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    paddingVertical: 10,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  tableHeaderColParam: {
    flex: 1.4,
  },
  tableHeaderColRegime: {
    flex: 1,
    alignItems: "flex-end",
  },
  tableHeaderText: {
    fontSize: Typography.fontSize.xs - 1,
    fontWeight: Typography.fontWeight.bold,
    color: "#475569",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  tableRowHighlight: {
    backgroundColor: "#EFF6FF",
    borderTopWidth: 1,
    borderTopColor: "#DBEAFE",
    borderBottomWidth: 1,
    borderBottomColor: "#DBEAFE",
  },
  paramLabel: {
    fontSize: Typography.fontSize.xs,
    color: "#334155",
  },
  paramLabelBold: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: "#0F172A",
  },
  valueText: {
    fontSize: Typography.fontSize.xs,
    color: "#0F172A",
  },
  valueTextBold: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: "#0F172A",
  },
  valueTextDeduction: {
    fontSize: Typography.fontSize.xs,
    color: "#059669",
    fontWeight: Typography.fontWeight.medium,
  },
  valueTextTax: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: "#083B75",
  },
  savingsBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  savingsBannerTextCol: {
    flex: 1,
  },
  savingsBannerTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: "#166534",
  },
  savingsBannerSub: {
    fontSize: 11,
    color: "#15803D",
    marginTop: 1,
  },
  selectionSectionTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: "#0F172A",
    marginBottom: Spacing.xs,
  },
  regimeOptionCards: {
    gap: Spacing.sm,
  },
  regimeCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
  },
  regimeCardSelected: {
    borderColor: BrandColors.PRIMARY_ORANGE,
    backgroundColor: "#FEF0E6",
  },
  regimeCardContent: {
    flex: 1,
  },
  regimeCardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  regimeName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: "#0F172A",
  },
  regimeTag: {
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  regimeTagText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    color: "#475569",
  },
  regimeBullet: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 3,
    lineHeight: 16,
  },
});
