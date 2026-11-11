import { StyleSheet, Platform, ViewStyle, DimensionValue } from "react-native";
import {
  BrandColors,
  BorderRadius,
  BorderWidth,
  Spacing,
  Typography,
} from "../../../../../shared/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.BACKGROUND,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
  },
  titleSection: {
    marginBottom: 14,
  },
  pageTitle: {
    fontSize: Typography.fontSize.lg + 4,
    fontWeight: Typography.fontWeight.extraBold,
    color: "#0B1F3A",
    letterSpacing: -0.2,
  },
  pageSubtitle: {
    fontSize: Typography.fontSize.sm + 0.5,
    color: BrandColors.TEXT_SECONDARY,
    marginTop: Spacing.xs,
    lineHeight: 18,
    fontWeight: Typography.fontWeight.regular,
  },
  sectionHeader: {
    marginTop: 10,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#0B1F3A",
  },
  docCard: {
    backgroundColor: BrandColors.WHITE,
    borderRadius: 14,
    padding: 12,
    borderWidth: BorderWidth.thin,
    borderColor: "#E2E8F0",
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#0B1F3A",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
      default: {},
    }),
  },
  docRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  docInfo: {
    flex: 1,
    marginRight: 10,
  },
  docTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0B1F3A",
    lineHeight: 18,
  },
  requiredBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#DC2626",
    marginTop: 2,
  },
  optionalBadgeText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#64748B",
    marginTop: 2,
  },
  uploadButton: {
    borderWidth: 1.2,
    borderColor: BrandColors.PRIMARY_ORANGE,
    backgroundColor: BrandColors.WHITE,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 7,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#EA580C",
  },
  uploadedBox: {
    gap: 8,
  },
  fileMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  fileNameText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#0B1F3A",
    flex: 1,
  },
  fileSizeText: {
    fontSize: 11.5,
    color: "#64748B",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: "#F1F5F9",
  },
  actionBtnDelete: {
    backgroundColor: "#FEF2F2",
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#DC2626",
  },
  buttonWrapper: {
    marginTop: "auto",
    paddingTop: 24,
    marginBottom: 20,
  },
  continueButton: {
    height: 52,
    borderRadius: BorderRadius.base,
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: BrandColors.PRIMARY_ORANGE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      default: {},
    }),
  },
  continueButtonText: {
    color: BrandColors.WHITE,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.2,
  },
});

export const getContainerInsetsStyle = (top: number): ViewStyle => ({
  paddingTop: top,
});

export const getScrollContentInsetsStyle = (bottom: number): ViewStyle => ({
  paddingBottom: Math.max(bottom, 24) + 16,
});

export const getProgressFillWidthStyle = (percent: number): ViewStyle => ({
  width: `${percent}%` as DimensionValue,
});
