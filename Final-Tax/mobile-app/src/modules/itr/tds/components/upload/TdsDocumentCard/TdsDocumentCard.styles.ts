import { StyleSheet } from "react-native";
import {
  BrandColors,
  BorderRadius,
  BorderWidth,
  Spacing,
  Typography,
} from "@/shared/theme";

export const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: BrandColors.WHITE,
    borderRadius: BorderRadius.base,
    borderWidth: BorderWidth.thin,
    borderColor: BrandColors.BORDER,
    padding: Spacing.base,
    marginBottom: 12,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardContainerHighlighted: {
    borderColor: BrandColors.PRIMARY_ORANGE,
  },
  cardContainerError: {
    borderColor: "#DC2626",
    backgroundColor: "#FEF2F2",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleGroup: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: Spacing.sm,
  },
  docIconWrap: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: BrandColors.PRIMARY_LIGHT_BLUE,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  titleTexts: {
    flex: 1,
  },
  docTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: BrandColors.TEXT_PRIMARY,
  },
  docSubtitle: {
    fontSize: Typography.fontSize.xs + 1,
    color: BrandColors.TEXT_SECONDARY,
    marginTop: 2,
  },
  badgeRequired: {
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
    borderWidth: BorderWidth.thin,
    borderColor: "#FECACA",
  },
  badgeRequiredText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semiBold,
    color: "#DC2626",
  },
  badgeOptional: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
  },
  badgeOptionalText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: BrandColors.TEXT_SECONDARY,
  },

  // Upload Trigger Area
  uploadArea: {
    marginTop: Spacing.md,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.md,
    backgroundColor: BrandColors.PRIMARY_LIGHT_ORANGE,
    borderWidth: BorderWidth.thin,
    borderColor: "#FFD8B2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  uploadAreaText: {
    fontSize: Typography.fontSize.sm + 0.5,
    fontWeight: Typography.fontWeight.semiBold,
    color: BrandColors.PRIMARY_ORANGE_DARK,
  },

  // Uploading State
  uploadingContainer: {
    marginTop: Spacing.md,
  },
  uploadingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  uploadingText: {
    fontSize: Typography.fontSize.xs + 1,
    fontWeight: Typography.fontWeight.medium,
    color: BrandColors.TEXT_SECONDARY,
  },
  uploadingPercent: {
    fontSize: Typography.fontSize.xs + 1,
    fontWeight: Typography.fontWeight.bold,
    color: BrandColors.PRIMARY_ORANGE,
  },
  progressTrack: {
    height: 5,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    borderRadius: 3,
  },

  // Uploaded State
  uploadedContainer: {
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: BorderWidth.thin,
    borderTopColor: "#F1F5F9",
  },
  uploadedFileInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  uploadedFileLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: Spacing.sm,
  },
  uploadedSuccessBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
    borderWidth: BorderWidth.thin,
    borderColor: "#BBF7D0",
    marginRight: 8,
    gap: 3,
  },
  uploadedSuccessText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: "#16A34A",
  },
  uploadedFileName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: BrandColors.TEXT_PRIMARY,
    flex: 1,
  },
  uploadedFileSize: {
    fontSize: Typography.fontSize.xs,
    color: BrandColors.TEXT_SECONDARY,
  },

  // Action Buttons Row: [View] [Change] [Delete]
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 10,
    gap: 8,
  },
  viewBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    backgroundColor: "#F8FAFC",
    borderWidth: BorderWidth.thin,
    borderColor: BrandColors.BORDER,
    gap: 4,
  },
  viewBtnText: {
    fontSize: Typography.fontSize.xs + 1,
    fontWeight: Typography.fontWeight.semiBold,
    color: BrandColors.TEXT_PRIMARY,
  },
  changeBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    backgroundColor: BrandColors.PRIMARY_LIGHT_ORANGE,
    borderWidth: BorderWidth.thin,
    borderColor: "#FFD8B2",
    gap: 4,
  },
  changeBtnText: {
    fontSize: Typography.fontSize.xs + 1,
    fontWeight: Typography.fontWeight.bold,
    color: BrandColors.PRIMARY_ORANGE_DARK,
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    backgroundColor: "#FEF2F2",
    borderWidth: BorderWidth.thin,
    borderColor: "#FECACA",
    gap: 4,
  },
  deleteBtnText: {
    fontSize: Typography.fontSize.xs + 1,
    fontWeight: Typography.fontWeight.bold,
    color: "#DC2626",
  },

  // Inline Error
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 5,
  },
  errorText: {
    fontSize: Typography.fontSize.xs,
    color: "#DC2626",
    fontWeight: Typography.fontWeight.medium,
  },
});
