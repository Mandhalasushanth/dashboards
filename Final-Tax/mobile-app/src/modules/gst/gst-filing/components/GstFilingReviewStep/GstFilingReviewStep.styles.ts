import { Platform, StyleSheet } from "react-native";
import { BrandColors } from "@/shared/theme";

export const styles = StyleSheet.create({
  container: {
    paddingTop: 4,
    gap: 14,
    paddingBottom: 20,
  },

  readyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BrandColors.PRIMARY_BLUE,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },

  readyIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  readyTextCol: {
    flex: 1,
  },

  readyHeading: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif-medium",
    }),
  },

  readySub: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.85)",
    marginTop: 2,
    lineHeight: 16,
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif",
    }),
  },

  caBannerCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    gap: 10,
  },
  caBannerHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  caBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  caBannerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: BrandColors.PRIMARY_BLUE_DARK,
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif-medium",
    }),
  },
  caBannerText: {
    fontSize: 13,
    color: "#1E3A8A",
    lineHeight: 18,
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif",
    }),
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EEF2F6",
  },

  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: BrandColors.TEXT_PRIMARY,
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif-medium",
    }),
  },

  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: BrandColors.PRIMARY_ORANGE,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },

  editBtnText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: BrandColors.PRIMARY_ORANGE,
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif-medium",
    }),
  },

  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
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
    color: "#64748B",
    flex: 1,
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif",
    }),
  },

  value: {
    fontSize: 13,
    fontWeight: "600",
    color: BrandColors.TEXT_PRIMARY,
    textAlign: "right",
    flex: 1.2,
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif-medium",
    }),
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FEF0E6",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 6,
  },

  totalLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: BrandColors.PRIMARY_ORANGE,
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif-medium",
    }),
  },

  totalValue: {
    fontSize: 17,
    fontWeight: "800",
    color: BrandColors.PRIMARY_ORANGE,
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif-medium",
    }),
  },

  // Documents Section - Missing and Verified states
  missingDocsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  missingAlertBox: {
    flex: 1.25,
    backgroundColor: "#FFF1F2",
    borderRadius: 10,
    padding: 12,
    flexDirection: "row",
    gap: 8,
    borderWidth: 1,
    borderColor: "#FFE4E6",
  },

  missingAlertTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#E11D48",
  },

  missingAlertSub: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
    lineHeight: 15,
  },

  reuploadBtn: {
    flex: 0.95,
    minHeight: 58,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: BrandColors.PRIMARY_ORANGE,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },

  reuploadBtnText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: BrandColors.PRIMARY_ORANGE,
  },

  allDocsUploadedBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 10,
    padding: 12,
  },

  allDocsUploadedTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#065F46",
  },

  allDocsUploadedSub: {
    fontSize: 11.5,
    color: "#047857",
    marginTop: 1,
  },

  requestChangesBtn: {
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: BrandColors.PRIMARY_ORANGE,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },

  requestChangesText: {
    fontSize: 14,
    fontWeight: "700",
    color: BrandColors.PRIMARY_ORANGE,
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif-medium",
    }),
  },

  // Modal Styles for Tax Computation Editing
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(10, 35, 70, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalBox: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },

  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: BrandColors.TEXT_PRIMARY,
  },

  modalSub: {
    fontSize: 12.5,
    color: "#64748B",
    lineHeight: 17,
    marginBottom: 16,
  },

  inputGroup: {
    marginBottom: 14,
  },

  inputLabel: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },

  modalInput: {
    height: 46,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: "600",
    color: BrandColors.TEXT_PRIMARY,
    backgroundColor: "#F8FAFC",
  },

  modalSummaryBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 12,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 6,
  },

  modalSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  modalSummaryLabel: {
    fontSize: 12.5,
    color: "#64748B",
  },

  modalSummaryVal: {
    fontSize: 13,
    fontWeight: "600",
    color: BrandColors.TEXT_PRIMARY,
  },

  modalBtnRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },

  modalSecondaryBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },

  modalSecondaryBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },

  modalPrimaryBtn: {
    flex: 1.6,
    height: 44,
    borderRadius: 10,
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    justifyContent: "center",
    alignItems: "center",
  },

  modalPrimaryBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  alertIconTopMargin: {
    marginTop: 2,
  },
  flex1Col: {
    flex: 1,
  },
  valueMissing: {
    color: "#E11D48",
    fontWeight: "700",
  },
  valueSuccess: {
    color: "#16A34A",
  },
  modalSummaryValHighlight: {
    color: BrandColors.PRIMARY_ORANGE,
    fontWeight: "700",
  },
  syncBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  syncBannerText: {
    fontSize: 13,
    color: "#1E40AF",
    fontWeight: "500",
  },
  modalInputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  modalErrorText: {
    fontSize: 11.5,
    color: "#DC2626",
    marginTop: 4,
    fontWeight: "500",
  },
  statusPendingBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPendingText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#D97706",
  },
});