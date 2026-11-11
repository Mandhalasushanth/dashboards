import { StyleSheet } from "react-native";
import { BrandColors, Typography, Spacing, BorderRadius } from "@/shared/theme";

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.xxl,
  },
  progressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: Spacing.md,
  },
  progressHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
  },
  progressCounterText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: "#0F172A",
  },
  statusBadge: {
    backgroundColor: "#FEF0E6",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: Typography.fontSize.xs - 1,
    fontWeight: Typography.fontWeight.bold,
    color: BrandColors.PRIMARY_ORANGE_DARK,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 3,
    overflow: "hidden",
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    borderRadius: 3,
  },
  instructionRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  instructionTextCol: {
    flex: 1,
  },
  instructionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: "#0F172A",
    marginBottom: 2,
  },
  instructionDetail: {
    fontSize: Typography.fontSize.xs,
    color: "#64748B",
    marginTop: 1,
  },
  instructionHighlight: {
    fontWeight: "700",
  },
  groupSection: {
    marginBottom: Spacing.base,
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
  },
  groupTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: "#1E293B",
  },
  groupTag: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  groupTagText: {
    fontSize: Typography.fontSize.xs - 1,
    fontWeight: Typography.fontWeight.bold,
    color: "#64748B",
  },
  groupTagRequired: {
    backgroundColor: "#FEF2F2",
  },
  groupTagTextRequired: {
    color: "#DC2626",
    fontSize: Typography.fontSize.xs - 1,
    fontWeight: Typography.fontWeight.bold,
  },
  groupTagRecommended: {
    backgroundColor: "#EFF6FF",
  },
  groupTagTextRecommended: {
    color: "#1D4ED8",
    fontSize: Typography.fontSize.xs - 1,
    fontWeight: Typography.fontWeight.bold,
  },
  docsList: {
    gap: Spacing.sm,
  },
  docCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  docCardUploaded: {
    borderColor: "#86EFAC",
    backgroundColor: "#F0FDF4",
  },
  docCardVerified: {
    backgroundColor: "#F8FAFC",
    borderColor: "#CBD5E1",
  },
  docTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.xs,
  },
  docIconBox: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    backgroundColor: "#EAF1FE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  docIconBoxDone: {
    backgroundColor: "#DCFCE7",
  },
  docIconBoxVerified: {
    backgroundColor: "#F1F5F9",
  },
  docInfoCol: {
    flex: 1,
  },
  docTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  docTitleLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  docName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: "#0F172A",
  },
  requiredAsterisk: {
    color: "#EF4444",
    marginLeft: 2,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  verifiedBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  verifiedBadgeText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    color: "#166534",
  },
  docSubtitle: {
    fontSize: Typography.fontSize.xs,
    color: "#64748B",
    marginTop: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  uploadedFileName: {
    fontSize: Typography.fontSize.xs,
    color: "#166534",
    fontWeight: Typography.fontWeight.medium,
  },
  docActionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: Spacing.sm,
    paddingTop: Spacing.xs,
  },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF1FE",
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  uploadBtnText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: "#083B75",
  },
  viewBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingVertical: 5,
    paddingHorizontal: Spacing.sm + 2,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  viewBtnText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semiBold,
    color: "#083B75",
  },
  changeBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF0E6",
    paddingVertical: 5,
    paddingHorizontal: Spacing.sm + 2,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  changeBtnText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: BrandColors.PRIMARY_ORANGE_DARK,
  },
  removeBtn: {
    backgroundColor: "#FEF2F2",
    padding: 6,
    borderRadius: BorderRadius.sm,
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    paddingVertical: Spacing.base,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  continueButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: "#FFFFFF",
  },
});

export const getProgressBarFill = (percent: number) => ({
  ...styles.progressBarFill,
  width: `${Math.min(100, Math.max(0, percent))}%` as any,
});
