import { Platform, StyleSheet } from "react-native";
import { Shadows, Spacing } from "@/shared/theme";

export const styles = StyleSheet.create({
  headerContainer: {
    paddingBottom: 28,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...Shadows.md,
  },
  innerContainer: {
    paddingHorizontal: Spacing.base + 4,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.base,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  titleSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: Spacing.xs,
  },
  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.22)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  headerIcon: {
    width: 52,
    height: 52,
  },
  titleCol: {
    flex: 1,
    justifyContent: "center",
  },
  tagText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.85)",
    fontWeight: "600",
    letterSpacing: 0.2,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif" }),
    marginBottom: 3,
  },
  titleText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.4,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  subtitleText: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.95)",
    lineHeight: 22,
    marginTop: 14,
    fontWeight: "400",
    fontFamily: Platform.select({ ios: "System", android: "sans-serif" }),
  },
});
