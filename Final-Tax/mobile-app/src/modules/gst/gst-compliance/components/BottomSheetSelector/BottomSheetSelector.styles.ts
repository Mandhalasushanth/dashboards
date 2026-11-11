import { StyleSheet, Platform, ViewStyle, TextStyle } from "react-native";
import { BrandColors } from "@/shared/theme";

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: Platform.select({ ios: 36, android: 24, default: 20 }),
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  handleWrap: {
    alignItems: "center",
    paddingVertical: 8,
  },
  handle: {
    width: 42,
    height: 4.5,
    borderRadius: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  closeBtn: {
    padding: 4,
  },
  scrollList: {
    marginBottom: 12,
  },
  scrollContent: {
    gap: 8,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  textWrap: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 15,
  },
  optionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: BrandColors.PRIMARY_BLUE_ACCENT,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  cancelBtn: {
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "600",
  },
});

export const getSheetThemeStyle = (isDark: boolean): ViewStyle => ({
  backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
  borderTopColor: isDark ? "#334155" : "#E2E8F0",
});

export const getHandleThemeStyle = (isDark: boolean): ViewStyle => ({
  backgroundColor: isDark ? "#475569" : "#CBD5E1",
});

export const getHeaderTitleThemeStyle = (isDark: boolean): TextStyle => ({
  color: isDark ? "#F8FAFC" : "#0F172A",
});

export const getOptionRowThemeStyle = (isSelected: boolean, isDark: boolean): ViewStyle => ({
  backgroundColor: isSelected
    ? isDark
      ? "rgba(11, 94, 215, 0.15)"
      : "#EAF1FE"
    : "transparent",
  borderColor: isSelected
    ? BrandColors.PRIMARY_BLUE_ACCENT
    : isDark
    ? "#334155"
    : "#F1F5F9",
});

export const getIconBoxThemeStyle = (isSelected: boolean, isDark: boolean): ViewStyle => ({
  backgroundColor: isSelected
    ? BrandColors.PRIMARY_BLUE_ACCENT
    : isDark
    ? "#334155"
    : "#F8FAFC",
});

export const getOptionLabelThemeStyle = (
  isSelected: boolean,
  isDestructive: boolean | undefined,
  isDark: boolean
): TextStyle => ({
  color: isDestructive
    ? "#EF4444"
    : isSelected
    ? BrandColors.PRIMARY_BLUE_ACCENT
    : isDark
    ? "#F1F5F9"
    : "#1E293B",
  fontWeight: isSelected ? "700" : "500",
});

export const getOptionSubtitleThemeStyle = (isDark: boolean): TextStyle => ({
  color: isDark ? "#94A3B8" : "#64748B",
});

export const getEmptyCircleThemeStyle = (isDark: boolean): ViewStyle => ({
  borderColor: isDark ? "#475569" : "#CBD5E1",
});

export const getCancelBtnThemeStyle = (isDark: boolean): ViewStyle => ({
  backgroundColor: isDark ? "#0F172A" : "#F1F5F9",
});

export const getCancelTextThemeStyle = (isDark: boolean): TextStyle => ({
  color: isDark ? "#CBD5E1" : "#475569",
});
