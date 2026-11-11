import { StyleSheet, Platform } from "react-native";
import type { ThemeColors } from "@/constants/theme";

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 24,
    paddingHorizontal: 8,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif" }),
  },
  enableBtn: {
    width: "100%",
    height: 48,
    borderRadius: 24,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  enableBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  notNowBtn: {
    width: "100%",
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  notNowBtnText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
});

export const getThemedStyles = (colors: ThemeColors) => ({
  modalCard: {
    backgroundColor: colors.backgroundElement,
    borderColor: colors.border,
  },
  iconCircle: {
    backgroundColor: colors.orangeLight,
  },
  title: {
    color: colors.text,
  },
  message: {
    color: colors.textSecondary,
  },
  enableBtn: {
    backgroundColor: colors.primaryDark,
  },
  notNowBtn: {
    backgroundColor: colors.background,
  },
  notNowBtnText: {
    color: colors.textSecondary,
  },
});
