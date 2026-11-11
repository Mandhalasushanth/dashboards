import { StyleSheet } from "react-native";
import { BrandColors } from "@/shared/theme";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "space-between",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    alignItems: "center",
  },
  checkCircleWrap: {
    alignItems: "center",
    marginBottom: 20,
  },
  outerGlow: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(22, 163, 74, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  middleCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(22, 163, 74, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  innerCheckCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#16A34A",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  headerCol: {
    alignItems: "center",
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  successSubtitle: {
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: "center",
    fontWeight: "500",
  },
  refCard: {
    width: "100%",
    borderRadius: 18,
    borderWidth: 1.2,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  refRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    width: "100%",
  },
  refTextCol: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },
  refLabel: {
    fontSize: 11.5,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  refValue: {
    fontSize: 17,
    fontWeight: "800",
    marginTop: 2,
    letterSpacing: 0.3,
    lineHeight: 22,
    flexWrap: "wrap",
  },
  refValueLong: {
    fontSize: 14.5,
    lineHeight: 19,
    letterSpacing: 0.2,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    flexShrink: 0,
    alignSelf: "center",
    borderWidth: 1,
  },
  copyText: {
    fontSize: 12.5,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    width: "100%",
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  gridItem: {
    flex: 1,
    gap: 3,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  metaValue: {
    fontSize: 13.5,
    fontWeight: "700",
  },
  nextStepsCard: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  nextStepsTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    marginBottom: 4,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    marginTop: 6,
  },
  stepText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: "500",
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 10,
    width: "100%",
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  primaryBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    shadowColor: BrandColors.PRIMARY_ORANGE,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnText: {
    fontSize: 15.5,
    fontWeight: "700",
    color: BrandColors.WHITE,
  },
  secondaryBtn: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1.2,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
});

export const getRootThemeStyle = (isDark: boolean, paddingTop: number, paddingBottom: number) => ({
  backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
  paddingTop,
  paddingBottom,
});

export const getTitleThemeStyle = (isDark: boolean) => ({
  color: isDark ? "#F8FAFC" : "#0F172A",
});

export const getSubtitleThemeStyle = (isDark: boolean) => ({
  color: isDark ? "#94A3B8" : "#64748B",
});

export const getRefCardThemeStyle = (isDark: boolean) => ({
  backgroundColor: isDark ? "#1E293B" : BrandColors.WHITE,
  borderColor: isDark ? "#334155" : "#E2E8F0",
});

export const getRefLabelThemeStyle = (isDark: boolean) => ({
  color: isDark ? "#94A3B8" : "#64748B",
});

export const getRefValueThemeStyle = () => ({
  color: BrandColors.PRIMARY_BLUE_ACCENT,
});

export const getCopyBtnThemeStyle = (isDark: boolean, isCopied = false) => ({
  backgroundColor: isCopied
    ? isDark
      ? "rgba(22, 163, 74, 0.22)"
      : "rgba(22, 163, 74, 0.12)"
    : isDark
    ? "#334155"
    : "#EAF1FE",
  borderColor: isCopied
    ? isDark
      ? "#16A34A"
      : "#86EFAC"
    : "transparent",
});

export const getDividerThemeStyle = (isDark: boolean) => ({
  backgroundColor: isDark ? "#334155" : "#F1F5F9",
});

export const getMetaLabelThemeStyle = (isDark: boolean) => ({
  color: isDark ? "#64748B" : "#94A3B8",
});

export const getMetaValueThemeStyle = (isDark: boolean, isHighlight = false) => ({
  color: isHighlight
    ? isDark
      ? "#38BDF8"
      : "#083B75"
    : isDark
    ? "#F1F5F9"
    : "#1E293B",
});

export const getNextStepsCardThemeStyle = (isDark: boolean) => ({
  backgroundColor: isDark ? "#1E293B" : BrandColors.WHITE,
  borderColor: isDark ? "#334155" : "#E2E8F0",
});

export const getStepTextThemeStyle = (isDark: boolean) => ({
  color: isDark ? "#CBD5E1" : "#475569",
});

export const getBottomBarThemeStyle = (isDark: boolean, paddingBottom: number) => ({
  backgroundColor: isDark ? "#0F172A" : BrandColors.WHITE,
  borderTopColor: isDark ? "#1E293B" : "#F1F5F9",
  paddingBottom,
});

export const getSecondaryBtnThemeStyle = (isDark: boolean) => ({
  borderColor: isDark ? "#334155" : "#CBD5E1",
  backgroundColor: isDark ? "#1E293B" : BrandColors.WHITE,
});
