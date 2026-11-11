import { StyleSheet } from "react-native";
import { BrandColors } from "@/shared/theme";

export const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingBottom: 24,
  },
  readyCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#86EFAC",
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  readyCardDark: {
    backgroundColor: "#064E3B",
    borderColor: "#059669",
  },
  readyIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
  },
  readyTextCol: {
    flex: 1,
  },
  readyHeading: {
    fontSize: 14,
    fontWeight: "700",
    color: "#166534",
  },
  readyHeadingDark: {
    color: "#86EFAC",
  },
  readySub: {
    fontSize: 12.5,
    color: "#15803D",
    marginTop: 2,
    lineHeight: 18,
  },
  readySubDark: {
    color: "#BBF7D0",
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardLight: {
    backgroundColor: BrandColors.WHITE,
    borderColor: "#E2E8F0",
  },
  cardDark: {
    backgroundColor: "#1E293B",
    borderColor: "#334155",
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
  },
  cardTitleDark: {
    color: "#F8FAFC",
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "rgba(255, 122, 0, 0.1)",
  },
  editBtnText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: BrandColors.PRIMARY_ORANGE,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 2,
  },
  dividerDark: {
    backgroundColor: "#334155",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 4,
    gap: 12,
  },
  label: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
    flex: 1,
  },
  labelDark: {
    color: "#94A3B8",
  },
  value: {
    fontSize: 13.5,
    color: BrandColors.TEXT_PRIMARY,
    fontWeight: "600",
    textAlign: "right",
    flex: 1.2,
  },
  valueDark: {
    color: "#F8FAFC",
  },
  valueMultiline: {
    textAlign: "right",
    lineHeight: 18,
  },
  valueSuccess: {
    color: "#16A34A",
  },
  valueMissing: {
    color: "#EF4444",
  },
  docRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  docRowDark: {
    borderBottomColor: "#334155",
  },
  docLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  docIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
  },
  docIconWrapEmpty: {
    backgroundColor: "#FEF2F2",
  },
  docTextCol: {
    flex: 1,
  },
  docTitleText: {
    fontSize: 13,
    fontWeight: "600",
    color: BrandColors.TEXT_PRIMARY,
  },
  docTitleTextDark: {
    color: "#F8FAFC",
  },
  docMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 2,
    gap: 4,
  },
  docFileName: {
    fontSize: 11.5,
    color: "#64748B",
    flexShrink: 1,
  },
  docFileNameDark: {
    color: "#94A3B8",
  },
  docFileSizeBadge: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#475569",
    flexShrink: 0,
  },
  docFileSizeBadgeDark: {
    color: "#CBD5E1",
  },
  docStatusMissing: {
    color: "#DC2626",
    fontWeight: "500",
  },
  docViewBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 6,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  docViewBtnDark: {
    backgroundColor: "#1E3A8A",
    borderColor: "#2563EB",
  },
  docViewBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1D4ED8",
  },
  docViewBtnTextDark: {
    color: "#93C5FD",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  previewCard: {
    width: "100%",
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
    minHeight: 240,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  previewImage: {
    width: "100%",
    height: 300,
    borderRadius: 8,
  },
  pdfWebContainer: {
    width: "100%",
    height: 380,
    borderRadius: 8,
    overflow: "hidden",
  },
  webActionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
    width: "100%",
  },
  webActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  webActionBtnDark: {
    backgroundColor: "#1E3A8A",
    borderColor: "#2563EB",
  },
  webActionBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1D4ED8",
  },
  webActionBtnTextDark: {
    color: "#93C5FD",
  },
  nativeFallbackBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 8,
    width: "100%",
    gap: 12,
  },
  nativeDocInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    width: "100%",
  },
  nativeDocInfoCardDark: {
    backgroundColor: "#0F172A",
    borderColor: "#334155",
  },
  nativeDocDetailsCol: {
    flex: 1,
  },
  nativeDocTitle: {
    fontSize: 12.5,
    fontWeight: "600",
    color: BrandColors.TEXT_PRIMARY,
  },
  nativeDocTitleDark: {
    color: "#F8FAFC",
  },
  nativeDocMeta: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  nativeDocMetaDark: {
    color: "#94A3B8",
  },
  nativeNoticeText: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 16,
    maxWidth: 300,
  },
  nativeNoticeTextDark: {
    color: "#94A3B8",
  },
  externalShareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginTop: 4,
  },
  externalShareBtnDisabled: {
    opacity: 0.6,
  },
  externalShareBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  nativeErrorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 8,
    backgroundColor: "#FEF2F2",
    borderRadius: 6,
    marginTop: 6,
    width: "100%",
  },
  nativeErrorBoxDark: {
    backgroundColor: "#450A0A",
  },
  nativeErrorText: {
    fontSize: 11.5,
    color: "#DC2626",
    flex: 1,
  },
  nativeErrorTextDark: {
    color: "#FCA5A5",
  },
  previewDoneBtn: {
    margin: 14,
    marginTop: 0,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },
  previewDoneBtnDark: {
    backgroundColor: "#334155",
  },
  previewDoneBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  previewDoneBtnTextDark: {
    color: "#F1F5F9",
  },
});
