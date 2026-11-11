import { StyleSheet } from "react-native";
import { BrandColors, BorderRadius, Spacing, Typography } from "@/shared/theme";

export const getHeaderBarStyle = (topInset: number) => ({
  paddingTop: Math.max(topInset, 12) + 6,
});

export const getBottomBarStyle = (bottomInset: number) => ({
  paddingBottom: Math.max(bottomInset + 12, 20),
});

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.base,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  roundBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleWrap: {
    flex: 1,
    marginLeft: 14,
  },
  headerMainTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: "500",
    color: "#64748B",
    marginTop: 2,
  },
  placeholderBox: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingBottom: 40,
    gap: 16,
  },
  reviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    gap: 12,
    marginTop: 8,
  },
  reviewCardEditRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  reviewCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  reviewCardTitle: {
    fontSize: Typography.fontSize.sm + 1,
    fontWeight: "800",
    color: "#083B75",
  },
  editOptionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFF1E8",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: "#FED7AA",
  },
  editOptionText: {
    fontSize: Typography.fontSize.xs + 1.5,
    fontWeight: "700",
    color: BrandColors.PRIMARY_ORANGE,
  },
  reviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 4,
    gap: 12,
  },
  reviewKey: {
    fontSize: Typography.fontSize.sm,
    color: "#64748B",
    fontWeight: "500",
    flex: 1,
  },
  reviewVal: {
    fontSize: Typography.fontSize.sm,
    color: "#0F172A",
    fontWeight: "700",
    flex: 1.4,
    textAlign: "right",
  },
  reviewDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
  },
  declarationBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#EAF1FE",
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    padding: 14,
    gap: 12,
    marginTop: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.8,
    borderColor: "#083B75",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 1,
  },
  checkboxActive: {
    backgroundColor: "#083B75",
    borderColor: "#083B75",
  },
  declarationText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: "#083B75",
    fontWeight: "500",
    lineHeight: 20,
  },
  bottomBar: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingHorizontal: Spacing.base,
    paddingTop: 12,
  },
  primaryBtn: {
    height: 52,
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    borderRadius: BorderRadius.base,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryBtnDisabled: {
    opacity: 0.65,
  },
  primaryBtnText: {
    fontSize: Typography.fontSize.base,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
