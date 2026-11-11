import { StyleSheet } from "react-native";
import { BrandColors, Typography, Spacing, BorderRadius } from "@/shared/theme";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.md,
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 16,
    marginBottom: 14,
  },
  trackerHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
    paddingHorizontal: 4,
  },
  trackerTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: "#0F172A",
  },
  trackerBadge: {
    backgroundColor: "#FEF0E6",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  trackerBadgeText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    color: BrandColors.PRIMARY_ORANGE_DARK,
  },
  scrollContainer: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  stepsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  stepNode: {
    alignItems: "center",
    width: 68,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  completedCircle: {
    backgroundColor: "#059669",
  },
  activeCircle: {
    backgroundColor: BrandColors.PRIMARY_ORANGE,
  },
  inactiveCircle: {
    backgroundColor: "#F1F5F9",
  },
  stepLabel: {
    fontSize: 9,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 12,
  },
  completedLabel: {
    color: "#059669",
  },
  activeLabel: {
    color: BrandColors.PRIMARY_ORANGE_DARK,
    fontWeight: "700",
  },
  inactiveLabel: {
    color: "#64748B",
  },
  connector: {
    width: 20,
    height: 1,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
    marginTop: 16,
  },
  activeStageBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: Spacing.sm,
    gap: 2,
    marginTop: 4,
  },
  activeStageTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  activeStageTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: "#083B75",
  },
  activeStageDesc: {
    fontSize: 11,
    color: "#64748B",
    lineHeight: 16,
    marginTop: 2,
  },
});
