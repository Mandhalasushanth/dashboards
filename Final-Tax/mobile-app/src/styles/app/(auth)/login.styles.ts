/**
 * Screen: Login
 * Migrated from internal StyleSheet to external styles module.
 * Uses shared design tokens from src/shared/theme.ts.
 */

import { StyleSheet } from "react-native";
import {
  BrandColors,
  BorderRadius,
  Spacing,
  Typography,
} from "@/shared/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  wrapper: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  logo: {
    width: 76,
    height: 76,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  brandTitle: {
    fontSize: Typography.fontSize.hero,
    fontWeight: Typography.fontWeight.extraBold,
    letterSpacing: 2,
  },
  brandSub: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 3.5,
    marginTop: 3,
  },
  welcome: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  welcomeTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    textAlign: "center",
    marginBottom: 6,
  },
  welcomeSub: {
    fontSize: Typography.fontSize.base,
    textAlign: "center",
    lineHeight: 20,
  },
  form: {
    width: "100%",
  },
  label: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    marginBottom: Spacing.sm,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "100%",
  },
  codeBox: {
    height: 50,
    width: 58,
    borderWidth: 1.5,
    borderRadius: BorderRadius.sm + 2,
    justifyContent: "center",
    alignItems: "center",
  },
  codeText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1.5,
    borderRadius: BorderRadius.sm + 2,
    paddingHorizontal: Spacing.base - 2,
    fontSize: Typography.fontSize.md,
  },
  error: {
    fontSize: Typography.fontSize.sm + 0.5,
    marginTop: 6,
    fontWeight: Typography.fontWeight.semiBold,
  },
  continueBtn: {
    marginTop: 18,
    height: 50,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: Typography.fontSize.base - 1,
    fontWeight: Typography.fontWeight.medium,
  },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 50,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    elevation: 1,
  },
  googleText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  changeNumberBtn: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  changeNumberText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: BrandColors.PRIMARY_BLUE,
  },
  disabledField: {
    opacity: 0.85,
  },
  otpSection: {
    width: "100%",
    marginTop: Spacing.md,
  },
  otpTouchable: {
    width: "100%",
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
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    width: 1,
    height: 1,
  },
  verifyBtn: {
    marginTop: 8,
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
});
