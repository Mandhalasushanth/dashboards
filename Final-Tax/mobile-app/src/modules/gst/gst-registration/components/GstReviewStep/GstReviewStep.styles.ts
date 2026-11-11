/**
 * Component: GstReviewStep
 * Migrated from internal StyleSheet to external styles module.
 * Uses shared design tokens from src/shared/theme.ts.
 */

import { StyleSheet, Platform, Dimensions } from "react-native";
import { BrandColors } from "@/shared/theme";

const SCREEN_HEIGHT = Dimensions.get("window").height;

export const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
    gap: 14,
  },
  loadingContainer: {
    paddingVertical: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: BrandColors.TEXT_PRIMARY,
  },
  loadingSubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: BrandColors.TEXT_SECONDARY,
  },
  card: {
    backgroundColor: BrandColors.WHITE,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BrandColors.BORDER,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    color: BrandColors.TEXT_PRIMARY,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  editText: {
    fontSize: 13,
    fontWeight: "700",
    color: BrandColors.PRIMARY_ORANGE,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  docCountText: {
    fontSize: 13,
    fontWeight: "700",
    color: BrandColors.PRIMARY_ORANGE,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  editDocsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEF0E6",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FDBA74",
  },
  editDocsButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: BrandColors.PRIMARY_ORANGE,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  divider: {
    height: 1,
    backgroundColor: BrandColors.CARD_BORDER,
    marginVertical: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    color: BrandColors.TEXT_SECONDARY,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif" }),
  },
  value: {
    fontSize: 13,
    fontWeight: "600",
    color: BrandColors.TEXT_PRIMARY,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  valueMultiline: {
    maxWidth: "60%",
    textAlign: "right",
  },
  docProgressBar: {
    height: 5,
    backgroundColor: BrandColors.CARD_BORDER,
    borderRadius: 3,
    marginTop: 12,
    overflow: "hidden",
  },
  docProgressFill: {
    height: "100%",
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    borderRadius: 3,
  },
  uploadedDocList: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: BrandColors.CARD_BORDER,
    gap: 10,
  },
  uploadedDocItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    gap: 10,
  },
  uploadedDocTextCol: {
    flex: 1,
  },
  uploadedDocName: {
    fontSize: 13.5,
    color: BrandColors.TEXT_PRIMARY,
    fontWeight: "500",
    fontFamily: Platform.select({ ios: "System", android: "sans-serif" }),
  },
  uploadedDocSubtitle: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  eyeIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#EAF1FE",
    justifyContent: "center",
    alignItems: "center",
  },
  declarationCard: {
    flexDirection: "row",
    backgroundColor: "#FEF0E6",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FFD8BF",
    gap: 12,
    alignItems: "flex-start",
    marginBottom: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "#94A3B8",
    backgroundColor: BrandColors.WHITE,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    borderColor: BrandColors.PRIMARY_ORANGE,
  },
  declarationText: {
    flex: 1,
    fontSize: 12,
    color: "#9A3412",
    lineHeight: 18,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif" }),
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: BrandColors.WHITE,
    borderRadius: 20,
    overflow: "hidden",
    maxHeight: SCREEN_HEIGHT * 0.85,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalHeaderInfo: {
    flex: 1,
    marginRight: 10,
  },
  modalDocTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: BrandColors.TEXT_PRIMARY,
  },
  modalDocSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  modalImageContainer: {
    width: "100%",
    height: SCREEN_HEIGHT * 0.52,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  modalImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  modalPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  modalPlaceholderText: {
    marginTop: 10,
    fontSize: 13,
    color: "#94A3B8",
  },
  modalFooterBtn: {
    margin: 14,
    height: 46,
    backgroundColor: BrandColors.PRIMARY_BLUE,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalFooterBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: BrandColors.WHITE,
  },
});

export const getDocProgressFillStyle = (progressPercent: number) => ({
  width: `${progressPercent}%` as any,
});
