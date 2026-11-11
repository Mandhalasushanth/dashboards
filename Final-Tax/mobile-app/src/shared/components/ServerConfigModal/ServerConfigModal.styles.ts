import { StyleSheet } from "react-native";
import { BrandColors, Typography, BorderRadius, Spacing } from "@/shared/theme";

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  dialog: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: BrandColors.WHITE,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: "#0F172A",
  },
  description: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.regular,
    color: "#64748B",
    marginBottom: Spacing.base,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: 10,
    fontSize: Typography.fontSize.base,
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
    marginBottom: Spacing.sm,
  },
  resultBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 8,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  resultText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semiBold,
  },
  testBtn: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.sm,
    backgroundColor: "#EFF6FF",
    marginBottom: Spacing.base,
  },
  testBtnText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: BrandColors.PRIMARY_BLUE,
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  resetBtnText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: "#64748B",
  },
  saveBtn: {
    flex: 1.3,
    backgroundColor: BrandColors.PRIMARY_BLUE,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: BrandColors.WHITE,
  },
  closeBtn: {
    marginTop: Spacing.base,
    alignItems: "center",
  },
  closeBtnText: {
    fontSize: Typography.fontSize.sm,
    color: "#94A3B8",
  },
});

export const getResultBadgeStyle = (success: boolean) => ({
  backgroundColor: success ? "#ECFDF5" : "#FEF2F2",
});

export const getResultTextStyle = (success: boolean) => ({
  color: success ? "#065F46" : "#991B1B",
});
