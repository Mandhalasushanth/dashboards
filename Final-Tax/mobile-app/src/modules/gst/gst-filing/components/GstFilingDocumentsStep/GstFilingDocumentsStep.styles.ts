import { Dimensions, StyleSheet, ViewStyle } from "react-native";
import { BrandColors } from "@/shared/theme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    paddingTop: 4,
    paddingBottom: 20,
  },

  banner: {
    flexDirection: "row",
    backgroundColor: "#EAF1FE",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    gap: 8,
    alignItems: "center",
    marginBottom: 16,
  },

  bannerText: {
    flex: 1,
    fontSize: 12,
    color: "#083B75",
    lineHeight: 17,
  },

  boldText: {
    fontWeight: "700",
  },

  progressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EEF2F6",
  },

  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  progressTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: BrandColors.TEXT_PRIMARY,
  },

  progressSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },

  countBadge: {
    backgroundColor: "#FEF0E6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },

  countText: {
    fontSize: 12,
    fontWeight: "700",
    color: BrandColors.PRIMARY_ORANGE,
  },

  progressBarTrack: {
    height: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 3,
    overflow: "hidden",
  },

  progressBarFill: {
    height: "100%",
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    borderRadius: 3,
  },

  categorySection: {
    marginBottom: 18,
  },

  categoryTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
    paddingHorizontal: 4,
  },

  docsList: {
    gap: 12,
  },

  docCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  docCardUploaded: {
    borderColor: "#CBD5E1",
  },

  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  docInfoCol: {
    flex: 1,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  docName: {
    fontSize: 14,
    fontWeight: "600",
    color: BrandColors.TEXT_PRIMARY,
  },

  requiredAsterisk: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "700",
  },

  docSubtitle: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 2,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
    marginLeft: 6,
  },

  statusBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },

  nilBanner: {
    flexDirection: "row",
    backgroundColor: "#F0FDF4",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    alignItems: "flex-start",
    marginBottom: 16,
  },

  nilBannerTextCol: {
    flex: 1,
    marginLeft: 10,
  },

  nilBannerTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#15803D",
    marginBottom: 2,
  },

  nilBannerSub: {
    fontSize: 12,
    color: "#166534",
    lineHeight: 17,
  },

  statusUploaded: {
    backgroundColor: "#ECFDF5",
  },

  statusUploadedText: {
    color: "#059669",
  },

  statusPending: {
    backgroundColor: "#F8FAFC",
  },

  statusRequired: {
    backgroundColor: "#FEF2F2",
  },

  statusRequiredText: {
    color: "#DC2626",
  },

  statusRecommended: {
    backgroundColor: "#FEF3C7",
  },

  statusRecommendedText: {
    color: "#D97706",
  },

  statusConditional: {
    backgroundColor: "#E0F2FE",
  },

  statusConditionalText: {
    color: "#2563EB",
  },

  statusOptional: {
    backgroundColor: "#F1F5F9",
  },

  statusOptionalText: {
    color: "#64748B",
  },

  uploadedActionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },

  viewBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 4,
  },

  viewBtnText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: BrandColors.PRIMARY_BLUE,
  },

  actionBtnDivider: {
    width: 1,
    height: 18,
    backgroundColor: "#E2E8F0",
  },

  replaceBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 4,
  },

  replaceBtnText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#64748B",
  },

  deleteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignItems: "center",
    justifyContent: "center",
  },

  uploadButtonsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },

  uploadBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FFD8BF",
    backgroundColor: "#FFF8F4",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },

  uploadBtnText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: BrandColors.PRIMARY_ORANGE,
  },

  uploadBtnPrimary: {
    borderColor: BrandColors.PRIMARY_ORANGE,
    backgroundColor: BrandColors.PRIMARY_ORANGE,
  },

  uploadBtnPrimaryText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  infoCallout: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF1FE",
    borderRadius: 14,
    padding: 14,
    gap: 12,
    marginTop: 6,
  },

  infoCalloutText: {
    flex: 1,
    fontSize: 12,
    color: BrandColors.PRIMARY_BLUE,
    lineHeight: 17,
    fontWeight: "500",
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },

  modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    maxHeight: SCREEN_HEIGHT * 0.82,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  modalHeaderInfo: {
    flex: 1,
    marginRight: 12,
  },

  modalDocTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: BrandColors.TEXT_PRIMARY,
  },

  modalDocMeta: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },

  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },

  modalImageContainer: {
    height: 340,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },

  modalImage: {
    width: "100%",
    height: "100%",
  },

  modalPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },

  modalPlaceholderText: {
    fontSize: 13,
    color: "#94A3B8",
    marginTop: 8,
  },

  modalFooter: {
    flexDirection: "row",
    padding: 14,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },

  modalReplaceBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EAF1FE",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  modalReplaceText: {
    fontSize: 13.5,
    fontWeight: "600",
    color: BrandColors.PRIMARY_BLUE,
  },

  modalDoneBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    alignItems: "center",
    justifyContent: "center",
  },

  modalDoneText: {
    fontSize: 13.5,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export const getProgressFillStyle = (progressPercent: number): ViewStyle => ({
  width: `${Math.min(100, Math.max(0, progressPercent))}%` as any,
});

export const getIconBoxStyle = (backgroundColor?: string): ViewStyle => ({
  backgroundColor: backgroundColor || "#FEF0E6",
});
