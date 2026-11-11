import { StyleSheet } from "react-native";
import { BrandColors } from "@/shared/theme";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewLight: {
    backgroundColor: "#F8FAFC",
  },
  scrollViewDark: {
    backgroundColor: "#0F172A",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 16,
    flexGrow: 1,
  },

  // Edit Mode Notification Bar
  editModeBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FDBA74",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  editModeBannerDark: {
    backgroundColor: "#7C2D12",
    borderColor: "#EA580C",
  },
  editModeBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  editModeBannerText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#C2410C",
  },
  editModeBannerTextDark: {
    color: "#FED7AA",
  },
  returnToReviewBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#EA580C",
  },
  returnToReviewBtnDisabled: {
    opacity: 0.5,
  },
  returnToReviewBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // Form Section Card
  card: {
    borderRadius: 18,
    borderWidth: 1.2,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 14,
  },
  cardLight: {
    backgroundColor: BrandColors.WHITE,
    borderColor: "#E2E8F0",
  },
  cardDark: {
    backgroundColor: "#1E293B",
    borderColor: "#334155",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  sectionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#FFF7ED",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionIconBoxDark: {
    backgroundColor: "#7C2D12",
  },
  sectionTitleWrap: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
    color: "#0F172A",
  },
  sectionTitleDark: {
    color: "#F8FAFC",
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 1,
  },
  sectionSubtitleDark: {
    color: "#94A3B8",
  },

  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  labelDark: {
    color: "#E2E8F0",
  },
  star: {
    color: "#EF4444",
  },

  selectorBox: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1.2,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: BrandColors.WHITE,
    borderColor: "#CBD5E1",
  },
  selectorBoxDark: {
    backgroundColor: "#0F172A",
    borderColor: "#334155",
  },
  selectorBoxError: {
    borderColor: "#EF4444",
  },
  selectorText: {
    fontSize: 14.5,
    fontWeight: "500",
    color: "#0F172A",
  },
  selectorTextDark: {
    color: "#F8FAFC",
  },
  selectorPlaceholder: {
    color: "#94A3B8",
  },
  selectorPlaceholderDark: {
    color: "#64748B",
  },

  errorText: {
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "500",
  },

  // Bottom action buttons
  submitWrapper: {
    marginTop: 8,
  },
  submitBtn: {
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    shadowColor: BrandColors.PRIMARY_ORANGE,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnDisabled: {
    opacity: 0.75,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: BrandColors.WHITE,
  },

  // Step Indicator
  stepIndicatorContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  stepIndicatorBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E2E8F0",
  },
  stepIndicatorBarActive: {
    backgroundColor: BrandColors.PRIMARY_ORANGE,
  },
  stepIndicatorBarDark: {
    backgroundColor: "#334155",
  },

  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  dialogCard: {
    width: "100%",
    borderRadius: 20,
    borderWidth: 1.2,
    padding: 22,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
    gap: 12,
    backgroundColor: BrandColors.WHITE,
    borderColor: "#E2E8F0",
  },
  dialogCardDark: {
    backgroundColor: "#1E293B",
    borderColor: "#334155",
  },
  dialogIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 122, 0, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  dialogIconWrapResume: {
    backgroundColor: "#EAF1FE",
  },
  dialogIconWrapResumeDark: {
    backgroundColor: "#0F172A",
  },
  dialogTitle: {
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    color: "#0F172A",
  },
  dialogTitleDark: {
    color: "#F8FAFC",
  },
  dialogMessage: {
    fontSize: 13.5,
    lineHeight: 19,
    textAlign: "center",
    marginBottom: 8,
    color: "#64748B",
  },
  dialogMessageDark: {
    color: "#94A3B8",
  },
  dialogActionsRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  dialogCancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
  },
  dialogCancelBtnDark: {
    backgroundColor: "#334155",
  },
  dialogCancelText: {
    fontSize: 14.5,
    fontWeight: "600",
    color: "#475569",
  },
  dialogCancelTextDark: {
    color: "#E2E8F0",
  },
  dialogConfirmBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    justifyContent: "center",
    alignItems: "center",
  },
  dialogResumeBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: BrandColors.PRIMARY_BLUE_ACCENT,
    justifyContent: "center",
    alignItems: "center",
  },
  dialogConfirmText: {
    fontSize: 14.5,
    fontWeight: "700",
    color: BrandColors.WHITE,
  },
});

export const getScrollContentStyle = (bottomInset: number) => ({
  paddingBottom: Math.max(bottomInset, 16) + 32,
});

export const getRootBgStyle = (isDark: boolean) => ({
  backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
});
