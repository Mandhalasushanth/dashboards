/**
 * Screen: Create Profile / Register - Aadhaar OTP & Verification Styles
 * Dedicated module styles complying with the < 500 lines per file standard.
 */

import { Platform } from "react-native";
import {
  BrandColors,
  BorderRadius,
  Spacing,
  Typography,
} from "@/shared/theme";

export const aadhaarOtpStyles = {
  validTickContainer: {
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingRight: 2,
    marginLeft: Spacing.sm,
  },
  sendOtpBtn: {
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: BorderRadius.sm,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginLeft: 6,
  },
  sendOtpBtnDisabled: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  sendOtpBtnText: {
    color: BrandColors.WHITE,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  sendOtpBtnTextDisabled: {
    color: "#94A3B8",
    fontWeight: Typography.fontWeight.medium,
  },
  aadhaarVerifiedInline: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    marginLeft: 6,
    gap: 4,
  },
  aadhaarVerifiedInlineText: {
    color: "#059669",
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  aadhaarOtpSection: {
    backgroundColor: "#F8FAFC",
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: Spacing.base,
    marginTop: -2,
    marginBottom: Spacing.base - 2,
  },
  aadhaarOtpHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginBottom: 6,
  },
  aadhaarOtpTitleRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  aadhaarOtpTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: BrandColors.PRIMARY_BLUE_DARK,
  },
  mockOtpPill: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  mockOtpPillText: {
    fontSize: 10,
    color: "#1D4ED8",
    fontWeight: Typography.fontWeight.bold,
  },
  aadhaarOtpSubtitle: {
    fontSize: Typography.fontSize.xs,
    color: BrandColors.TEXT_SECONDARY,
    marginBottom: 12,
  },
  aadhaarOtpBoxesContainer: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    marginBottom: 8,
    position: "relative" as const,
  },
  aadhaarOtpHiddenInput: {
    ...Platform.select({
      web: { outlineStyle: "none" } as any,
      default: {},
    }),
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.01,
    zIndex: 10,
  },
  aadhaarOtpBox: {
    width: 44,
    height: 48,
    borderRadius: BorderRadius.sm + 2,
    borderWidth: 1.5,
    borderColor: BrandColors.BORDER,
    backgroundColor: BrandColors.WHITE,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  aadhaarOtpBoxFocused: {
    borderColor: BrandColors.PRIMARY_ORANGE,
    backgroundColor: "#FFF9F5",
  },
  aadhaarOtpBoxFilled: {
    borderColor: BrandColors.PRIMARY_BLUE,
  },
  aadhaarOtpDigitText: {
    fontSize: Typography.fontSize.lg + 2,
    fontWeight: Typography.fontWeight.bold,
    color: BrandColors.TEXT_PRIMARY,
  },
  aadhaarOtpTimerRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginBottom: 10,
  },
  aadhaarOtpTimerText: {
    fontSize: Typography.fontSize.xs,
    color: BrandColors.TEXT_SECONDARY,
    fontWeight: Typography.fontWeight.medium,
  },
  aadhaarOtpTimerHighlight: {
    color: BrandColors.PRIMARY_ORANGE_DARK,
    fontWeight: Typography.fontWeight.bold,
  },
  aadhaarOtpExpiredRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  aadhaarOtpResendLink: {
    fontSize: Typography.fontSize.xs,
    color: BrandColors.PRIMARY_ORANGE,
    fontWeight: Typography.fontWeight.bold,
  },
  aadhaarOtpVerifyBtn: {
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    height: 44,
    borderRadius: BorderRadius.sm + 2,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  aadhaarOtpVerifyBtnDisabled: {
    backgroundColor: "#CBD5E1",
  },
  aadhaarOtpVerifyBtnText: {
    color: BrandColors.WHITE,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  aadhaarOtpErrorText: {
    fontSize: Typography.fontSize.xs,
    color: "#DC2626",
    fontWeight: Typography.fontWeight.medium,
    marginBottom: 8,
  },
  aadhaarVerifiedCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: -2,
    marginBottom: Spacing.base - 2,
  },
  aadhaarVerifiedCardLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  aadhaarVerifiedCardText: {
    color: "#065F46",
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
  },
  aadhaarChangeText: {
    color: BrandColors.PRIMARY_ORANGE,
    fontSize: Typography.fontSize.xs + 1,
    fontWeight: Typography.fontWeight.bold,
  },
};
