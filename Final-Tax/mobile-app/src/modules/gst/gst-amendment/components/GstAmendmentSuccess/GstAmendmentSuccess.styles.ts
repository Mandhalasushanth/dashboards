import { StyleSheet } from "react-native";
import { BrandColors, BorderRadius, Spacing, Typography } from "@/shared/theme";

export const getSuccessHeroStyle = (topInset: number) => ({
  paddingTop: Math.max(topInset + 20, 48),
});

export const getSuccessActionsWrapStyle = (bottomInset: number) => ({
  paddingBottom: Math.max(bottomInset + 16, 24),
});

export const styles = StyleSheet.create({
  successContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  successHero: {
    backgroundColor: BrandColors.PRIMARY_BLUE,
    paddingBottom: 36,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  successHeroIconBox: {
    marginBottom: 16,
  },
  successHeroCheckCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  successHeroTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
  },
  successCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 20,
    marginHorizontal: Spacing.base,
    marginTop: -20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  successRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  successRowKey: {
    fontSize: Typography.fontSize.sm,
    color: "#64748B",
    fontWeight: "500",
  },
  successRowVal: {
    fontSize: Typography.fontSize.sm + 0.5,
    color: "#0F172A",
    fontWeight: "700",
  },
  successDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
  },
  successActionsWrap: {
    paddingHorizontal: Spacing.base,
    marginTop: 24,
    gap: 12,
  },
  successTrackBtn: {
    height: 52,
    backgroundColor: BrandColors.PRIMARY_BLUE,
    borderRadius: BorderRadius.base,
    justifyContent: "center",
    alignItems: "center",
  },
  successTrackBtnText: {
    fontSize: Typography.fontSize.base,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  successHomeBtn: {
    height: 52,
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.base,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    justifyContent: "center",
    alignItems: "center",
  },
  successHomeBtnText: {
    fontSize: Typography.fontSize.base,
    fontWeight: "700",
    color: "#475569",
  },
});
