import { StyleSheet, Dimensions } from "react-native";
import { BrandColors, BorderRadius, Spacing } from "@/shared/theme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  cardContainerEmpty: {
    backgroundColor: BrandColors.WHITE,
    borderColor: "#E2E8F0",
  },
  cardContainerUploaded: {
    backgroundColor: "#F0FDF4",
    borderColor: "#86EFAC",
  },
  cardContainerDarkEmpty: {
    backgroundColor: "#1E293B",
    borderColor: "#334155",
  },
  cardContainerDarkUploaded: {
    backgroundColor: "#064E3B",
    borderColor: "#059669",
  },
  cardContainerError: {
    borderColor: "#EF4444",
  },

  cardTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  iconBoxEmpty: {
    backgroundColor: "#EFF6FF",
  },
  iconBoxUploaded: {
    backgroundColor: "#DCFCE7",
  },

  textCol: {
    flex: 1,
    marginLeft: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    color: BrandColors.TEXT_PRIMARY,
  },
  cardTitleDark: {
    color: "#F8FAFC",
  },
  star: {
    fontSize: 14,
    color: "#EF4444",
    fontWeight: "700",
    marginLeft: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
    lineHeight: 16,
  },
  cardSubtitleDark: {
    color: "#94A3B8",
  },

  uploadedInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    gap: 5,
  },
  uploadedFileName: {
    fontSize: 12,
    color: "#15803D",
    fontWeight: "500",
    flexShrink: 1,
  },
  uploadedFileNameDark: {
    color: "#4ADE80",
  },

  bottomActionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },

  // Upload button in empty state
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  uploadBtnDark: {
    backgroundColor: "#1E3A8A",
    borderColor: "#2563EB",
  },
  uploadBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1D4ED8",
  },
  uploadBtnTextDark: {
    color: "#93C5FD",
  },

  // Uploaded state action buttons
  viewBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: BrandColors.WHITE,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  viewBtnDark: {
    backgroundColor: "#1E293B",
    borderColor: "#475569",
  },
  viewBtnText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#334155",
  },
  viewBtnTextDark: {
    color: "#E2E8F0",
  },

  changeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FED7AA",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  changeBtnDark: {
    backgroundColor: "#7C2D12",
    borderColor: "#EA580C",
  },
  changeBtnText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#EA580C",
  },
  changeBtnTextDark: {
    color: "#FDBA74",
  },

  deleteBtn: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  deleteBtnDark: {
    backgroundColor: "#7F1D1D",
    borderColor: "#DC2626",
  },

  // Uploading progress state
  uploadingBox: {
    paddingVertical: 8,
    gap: 6,
  },
  uploadingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  uploadingText: {
    fontSize: 13,
    fontWeight: "600",
    color: BrandColors.TEXT_PRIMARY,
  },
  uploadingPercent: {
    fontSize: 12,
    fontWeight: "700",
    color: BrandColors.PRIMARY_ORANGE,
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 4,
    backgroundColor: "#E2E8F0",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    borderRadius: 4,
  },

  // Error message
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  errorText: {
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "500",
  },

  // Source Selection Modal (Camera vs Gallery)
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "flex-end",
  },
  optionsSheet: {
    backgroundColor: BrandColors.WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    gap: 12,
    paddingBottom: 32,
  },
  optionsSheetDark: {
    backgroundColor: "#1E293B",
  },
  optionsSheetTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: BrandColors.TEXT_PRIMARY,
    marginBottom: 4,
  },
  optionsSheetTitleDark: {
    color: "#F8FAFC",
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 12,
  },
  optionItemDark: {
    backgroundColor: "#0F172A",
    borderColor: "#334155",
  },
  optionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  optionItemText: {
    fontSize: 14,
    fontWeight: "600",
    color: BrandColors.TEXT_PRIMARY,
  },
  optionItemTextDark: {
    color: "#F8FAFC",
  },
  cancelOptionBtn: {
    marginTop: 4,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
  },
  cancelOptionBtnDark: {
    backgroundColor: "#334155",
  },
  cancelOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  cancelOptionTextDark: {
    color: "#CBD5E1",
  },

  // Document Preview Modal
  previewModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  previewCard: {
    width: "100%",
    maxHeight: SCREEN_HEIGHT * 0.8,
    backgroundColor: BrandColors.WHITE,
    borderRadius: 16,
    overflow: "hidden",
  },
  previewCardDark: {
    backgroundColor: "#1E293B",
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  previewHeaderDark: {
    borderBottomColor: "#334155",
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: BrandColors.TEXT_PRIMARY,
    flex: 1,
    marginRight: 8,
  },
  previewTitleDark: {
    color: "#F8FAFC",
  },
  previewContent: {
    minHeight: 220,
    maxHeight: SCREEN_HEIGHT * 0.6,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  previewImage: {
    width: "100%",
    height: 300,
    borderRadius: 8,
  },
  pdfFallbackBox: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 30,
  },
  pdfFallbackText: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
  },
});
