import { StyleSheet } from "react-native";
import { BrandColors, BorderRadius, Typography, Spacing } from "../../../../shared/theme";

export const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: Spacing.md,
  },
  otpGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
    width: "100%",
  },
  otpBox: {
    width: 46,
    height: 54,
    borderRadius: BorderRadius.sm + 2,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  otpBoxText: {
    fontSize: Typography.fontSize.lg + 4,
    fontWeight: Typography.fontWeight.bold,
  },
  otpBoxInput: {
    textAlign: "center",
    padding: 0,
  },
  error: {
    fontSize: Typography.fontSize.sm + 0.5,
    marginBottom: 8,
    fontWeight: Typography.fontWeight.semiBold,
  },
  verifyBtn: {
    marginTop: 4,
    height: 50,
  },
  resendContainer: {
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  resendText: {
    fontSize: Typography.fontSize.sm + 0.5,
    fontWeight: Typography.fontWeight.medium,
  },
  resendLink: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: "#F97316",
  },
  timerText: {
    fontWeight: "700",
  },
});

export const getThemedStyles = (colors: {
  error: string;
  border: string;
  backgroundElement: string;
  text: string;
  textSecondary: string;
}) => ({
  getOtpBoxStyle: (isCurrent: boolean, hasError?: boolean | string | null) => ({
    borderColor: hasError
      ? colors.error
      : isCurrent
      ? BrandColors.PRIMARY_BLUE
      : colors.border,
    backgroundColor: colors.backgroundElement,
  }),
  otpBoxText: {
    color: colors.text,
  },
  error: {
    color: colors.error,
  },
  resendText: {
    color: colors.textSecondary,
  },
  timerText: {
    color: colors.text,
  },
});
