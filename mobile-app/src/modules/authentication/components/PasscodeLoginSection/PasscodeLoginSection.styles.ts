import { StyleSheet } from "react-native";
import { BrandColors, BorderRadius, Typography, Spacing } from "../../../../shared/theme";

export const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: Spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize.sm + 0.5,
    fontWeight: Typography.fontWeight.semiBold,
  },
  eyeBtn: {
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  digitText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0C2340",
    textAlign: "center",
  },
  touchable: {
    width: "100%",
    position: "relative",
  },
  overlayInput: {
    ...StyleSheet.absoluteFill,
    opacity: 0.01,
    color: "transparent",
    backgroundColor: "transparent",
    zIndex: 10,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
    width: "100%",
  },
  dotBox: {
    width: 46,
    height: 54,
    borderRadius: BorderRadius.sm + 2,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#0C2340",
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    width: 1,
    height: 1,
  },
  forgotRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: Spacing.md,
  },
  forgotBtn: {
    paddingVertical: 4,
  },
  forgotText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: BrandColors.PRIMARY_BLUE,
  },
  error: {
    fontSize: Typography.fontSize.sm,
    marginBottom: 8,
    fontWeight: Typography.fontWeight.semiBold,
  },
  loginBtn: {
    marginTop: 4,
    height: 50,
  },
  biometricBtn: {
    marginTop: 12,
    height: 48,
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  biometricBtnText: {
    fontSize: Typography.fontSize.sm + 1,
    fontWeight: Typography.fontWeight.bold,
  },
});

export const getThemedStyles = (colors: {
  text: string;
  error: string;
  border: string;
  backgroundElement: string;
  primary?: string;
  textSecondary?: string;
}) => ({
  title: {
    color: colors.text,
  },
  digitText: {
    color: colors.text,
  },
  getDotBoxStyle: (isCurrent: boolean, hasError?: boolean | string | null) => ({
    borderColor: hasError
      ? colors.error
      : isCurrent
        ? BrandColors.PRIMARY_BLUE
        : colors.border,
    backgroundColor: colors.backgroundElement,
  }),
  error: {
    color: colors.error,
  },
  biometricBtn: {
    borderColor: colors.border,
    backgroundColor: colors.backgroundElement,
  },
  biometricBtnText: {
    color: colors.primary || BrandColors.PRIMARY_BLUE,
  },
});

