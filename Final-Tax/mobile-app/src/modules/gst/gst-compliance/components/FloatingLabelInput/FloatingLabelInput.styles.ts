import { StyleSheet, Platform, ViewStyle, TextStyle } from "react-native";

export const styles = StyleSheet.create({
  rootContainer: {
    marginBottom: 16,
    width: "100%",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  labelAboveText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  labelAboveTextDark: {
    color: "#E2E8F0",
  },
  inputContainer: {
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    position: "relative",
  },
  floatingLabelWrapper: {
    position: "absolute",
    left: 12,
    paddingHorizontal: 4,
    zIndex: 2,
    borderRadius: 4,
  },
  floatingLabelText: {
    letterSpacing: 0.1,
  },
  star: {
    color: "#EF4444",
  },
  textInput: {
    flex: 1,
    fontSize: 14.5,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif" }),
    minHeight: 48,
  },
  rightElementWrap: {
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  clearBtn: {
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  helperRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 6,
    paddingHorizontal: 2,
    gap: 8,
  },
  errorRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 5,
  },
  errorSpacer: {
    flex: 1,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "500",
    lineHeight: 16,
  },
  charCountText: {
    fontSize: 11.5,
    color: "#64748B",
    fontWeight: "500",
    textAlign: "right",
    flexShrink: 0,
    marginTop: 1,
  },
  charCountTextDark: {
    color: "#94A3B8",
  },
  charCountTextError: {
    color: "#DC2626",
    fontWeight: "600",
  },
});

export const getInputContainerDynamicStyle = (
  bg: string,
  borderColor: string,
  isFocused: boolean,
  hasError: boolean,
  multiline: boolean,
  numberOfLines?: number
): ViewStyle => ({
  backgroundColor: bg,
  borderColor,
  borderWidth: isFocused || hasError ? 1.8 : 1.2,
  minHeight: multiline
    ? numberOfLines
      ? numberOfLines * 24 + 36
      : 96
    : 52,
  alignItems: multiline ? "flex-start" : "center",
});

export const getTextInputDynamicStyle = (
  isDark: boolean,
  multiline: boolean
): TextStyle => ({
  color: isDark ? "#F8FAFC" : "#0F172A",
  paddingTop: multiline ? 12 : Platform.OS === "ios" ? 0 : 2,
  paddingBottom: multiline ? 12 : 0,
});
