import { StyleSheet, Platform } from "react-native";
import {
  BrandColors,
  BorderRadius,
  Typography,
  Spacing,
  BorderWidth,
} from "../../../../shared/theme";

export const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  section: {
    marginBottom: Spacing.xl,
    width: "100%",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm + 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "left",
    color: "#06152D",
  },
  eyeToggleBtn: {
    padding: Spacing.xs,
    justifyContent: "center",
    alignItems: "center",
  },
  boxesWrapper: {
    position: "relative",
    width: "100%",
  },
  overlayInput: {
    ...StyleSheet.absoluteFill,
    opacity: 0.01,
    color: "transparent",
    backgroundColor: "transparent",
    zIndex: 10,
    ...Platform.select({
      web: { outlineStyle: "none" } as any,
      default: {},
    }),
  },
  otpTouchable: {
    width: "100%",
  },
  otpGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  otpBox: {
    width: 46,
    height: 56,
    borderRadius: BorderRadius.base - 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BrandColors.WHITE,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  digitText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0C2340",
    textAlign: "center",
  },
  secureDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#0C2340",
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    width: 1,
    height: 1,
  },
  inlineErrorText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: "#DC2626",
    textAlign: "center",
    marginBottom: Spacing.md,
    marginTop: -Spacing.xs,
  },
  submitBtn: {
    marginTop: Spacing.sm,
    height: 54,
    borderRadius: BorderRadius.base - 2,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
      default: {},
    }),
  },
});

export const getThemedStyles = (isDark: boolean = false) => ({
  title: {
    color: "#06152D",
  },
  getBoxStyle: (isCurrent: boolean, isFilled: boolean, hasError: boolean) => {
    const borderColor = hasError
      ? "#DC2626"
      : isCurrent
        ? BrandColors.PRIMARY_ORANGE
        : isFilled
          ? BrandColors.PRIMARY_BLUE_DARK
          : "#E2E8F0";

    return {
      borderColor,
      borderWidth: isCurrent || isFilled ? BorderWidth.medium : BorderWidth.thin,
      backgroundColor: BrandColors.WHITE,
    };
  },
  secureDot: {
    backgroundColor: "#0C2340",
  },
});
