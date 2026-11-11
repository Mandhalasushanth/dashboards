/**
 * Screen: GST Filing
 * External styles module with dynamic styling helpers.
 * Uses shared design tokens from src/shared/theme.ts.
 */

import { StyleSheet, Platform, ViewStyle } from "react-native";
import {
  BrandColors,
  BorderRadius,
  BorderWidth,
  Spacing,
  Typography,
} from "@/shared/theme";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BrandColors.WHITE,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.base,
    paddingBottom: 12,
    backgroundColor: BrandColors.WHITE,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    borderWidth: BorderWidth.thin,
    borderColor: "#E2E8F0",
    backgroundColor: BrandColors.WHITE,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: BrandColors.TEXT_PRIMARY,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  placeholderBox: {
    width: 38,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    flexGrow: 1,
    paddingBottom: 24,
  },
  scrollContentCompact: {
    paddingHorizontal: 18,
    flexGrow: 1,
    paddingBottom: 24,
  },
  buttonWrapper: {
    marginTop: 22,
    marginBottom: Spacing.sm,
  },
  submitBtn: {
    height: 50,
    borderRadius: 25,
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: BrandColors.PRIMARY_ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: BrandColors.WHITE,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
});

export const getHeaderBarStyle = (topInset: number): ViewStyle => ({
  paddingTop: Math.max(topInset, 12) + 6,
});

export const getScrollContentStyle = (isPostPaymentStep: boolean): ViewStyle => ({
  paddingBottom: isPostPaymentStep ? 24 : 32,
});

export const getSubmitButtonStyle = (isSubmitting: boolean): ViewStyle[] => {
  const list: ViewStyle[] = [styles.submitBtn];
  if (isSubmitting) {
    list.push(styles.submitBtnDisabled);
  }
  return list;
};
