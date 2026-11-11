import { StyleSheet, Platform, ViewStyle, TextStyle } from "react-native";

export const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13.5,
    fontWeight: "600",
    marginBottom: 6,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  star: {
    color: "#EF4444",
  },
  inputBox: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1.2,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
  },
  valueText: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: "500",
  },
  manualInput: {
    flex: 1,
    height: "100%",
    fontSize: 14.5,
    fontWeight: "500",
    paddingVertical: 0,
  },
  errorText: {
    fontSize: 12,
    color: "#DC2626",
    marginTop: 6,
    fontWeight: "500",
  },
  helperText: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
});

export const getLabelThemeStyle = (isDark: boolean): TextStyle => ({
  color: isDark ? "#E2E8F0" : "#334155",
});

export const getInputBoxThemeStyle = (isDark: boolean, hasError: boolean): ViewStyle => ({
  backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
  borderColor: hasError ? "#EF4444" : isDark ? "#334155" : "#E2E8F0",
});

export const getValueTextThemeStyle = (value: string, isDark: boolean): TextStyle => ({
  color: value
    ? isDark
      ? "#F8FAFC"
      : "#0F172A"
    : isDark
    ? "#64748B"
    : "#94A3B8",
});

export const getWebInputStyle = (isDark: boolean): any => ({
  flex: 1,
  background: "transparent",
  border: "none",
  outline: "none",
  color: isDark ? "#F8FAFC" : "#0F172A",
  fontSize: "15px",
  fontFamily: "inherit",
  paddingLeft: "8px",
});
