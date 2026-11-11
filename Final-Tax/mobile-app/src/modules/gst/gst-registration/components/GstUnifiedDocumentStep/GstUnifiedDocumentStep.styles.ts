/**
 * Component: GstUnifiedDocumentStep
 * Migrated from internal StyleSheet to external styles module.
 * Uses shared design tokens from src/shared/theme.ts.
 */

import { StyleSheet, Dimensions } from "react-native";
import { BrandColors } from "@/shared/theme";

const SCREEN_HEIGHT = Dimensions.get("window").height;

export const styles = StyleSheet.create({
  container: {
    paddingTop: 4,
    paddingBottom: 20,
  },
  progressCard: {
    backgroundColor: BrandColors.WHITE,
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
  progressTitleCol: {
    flex: 1,
    paddingRight: 10,
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
    backgroundColor: BrandColors.WHITE,
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
  addressProofPickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    paddingVertical: 2,
  },
  docSubtitleLink: {
    color: BrandColors.PRIMARY_BLUE,
    marginTop: 0,
  },
  dropdownIcon: {
    marginLeft: 4,
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
  statusSpinner: {
    transform: [{ scale: 0.6 }],
  },
  statusUploaded: {
    backgroundColor: "#ECFDF5",
  },
  statusPending: {
    backgroundColor: "#F8FAFC",
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  statusUploadedText: {
    color: "#059669",
  },
  statusPendingText: {
    color: "#94A3B8",
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
    color: BrandColors.WHITE,
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

  // ─── Per-document upload state (selected file preview + status) ─────────
  docCardError: {
    borderColor: "#FCA5A5",
    backgroundColor: "#FFFBFB",
  },
  filePreviewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 12,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  fileThumb: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: "#E2E8F0",
  },
  fileThumbPdf: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
  },
  fileMetaCol: {
    flex: 1,
  },
  fileNameText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#06152D",
  },
  fileMetaText: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 2,
  },
  processingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#FFF7ED",
  },
  processingText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0F3567",
  },
  statusReady: {
    backgroundColor: "#FFF7ED",
  },
  statusReadyText: {
    color: "#C2410C",
  },
  statusBusy: {
    backgroundColor: "#EFF6FF",
  },
  statusBusyText: {
    color: "#0F3567",
  },
  statusError: {
    backgroundColor: "#FEF2F2",
  },
  statusErrorText: {
    color: "#B91C1C",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#FEF2F2",
  },
  errorBoxText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: "#B91C1C",
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#FF7A00",
  },
  retryBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  actionDisabled: {
    opacity: 0.45,
  },
});

export const getIconBoxStyle = (backgroundColor: string) => ({
  backgroundColor,
});
