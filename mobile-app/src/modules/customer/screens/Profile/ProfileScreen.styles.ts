/**
 * Screen: Profile & Settings
 * Module-owned styles.
 * Uses shared design tokens from src/shared/theme.ts.
 */

import { StyleSheet, Platform } from "react-native";
import {
  BrandColors,
  BorderRadius,
  BorderWidth,
  Spacing,
  Typography,
} from "@/shared/theme";

export const styles = StyleSheet.create({
  container: { flex: 1 },

  /* Hero */
  hero: {
    alignItems: "center",
    paddingBottom: 42,
    paddingHorizontal: Spacing.lg,
    position: "relative",
    overflow: "hidden",
  },
  avatarWrap: { width: 88, height: 88 },
  avatarBg: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: BorderWidth.thick,
    borderColor: "rgba(255,255,255,0.4)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: { width: "100%", height: "100%" },
  avatarLoading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  editBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: BorderWidth.thick,
    borderColor: BrandColors.WHITE,
  },
  heroName: {
    color: BrandColors.WHITE,
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.extraBold,
    marginTop: 14,
  },
  heroId: {
    color: "#C3D5EA",
    fontSize: Typography.fontSize.sm + 0.5,
    fontWeight: Typography.fontWeight.medium,
    marginTop: Spacing.xs,
  },
  pillRow: { flexDirection: "row", gap: 10, marginTop: 14 },
  pill: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  pillOutline: { backgroundColor: "transparent", borderWidth: BorderWidth.thin },
  pillText: {
    color: BrandColors.WHITE,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },

  /* Stats */
  statsCard: {
    flexDirection: "row",
    marginHorizontal: Spacing.base,
    marginTop: -26,
    borderRadius: BorderRadius.base,
    borderWidth: BorderWidth.thin,
    paddingVertical: Spacing.base,
    ...Platform.select({
      ios: { shadowColor: "#04203F", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 10 },
      android: { elevation: 4 },
      default: {},
    }),
  },
  statCell: { flex: 1, alignItems: "center" },
  statValue: { fontSize: Typography.fontSize.xl - 1, fontWeight: Typography.fontWeight.extraBold },
  statLabel: { fontSize: Typography.fontSize.xs - 0.5, fontWeight: Typography.fontWeight.semiBold, marginTop: 3 },

  /* Menu */
  menuArea: { paddingHorizontal: Spacing.base, paddingTop: 18, gap: 6 },
  sectionLabel: {
    fontSize: Typography.fontSize.xs - 1,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.8,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  sectionCard: { borderRadius: BorderRadius.base - 2, borderWidth: BorderWidth.thin, overflow: "hidden" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  rowBorderTop: { borderTopWidth: StyleSheet.hairlineWidth },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.sm + 2,
    justifyContent: "center",
    alignItems: "center",
  },
  rowLabel: { flex: 1, fontSize: Typography.fontSize.base - 2, fontWeight: Typography.fontWeight.semiBold },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    height: 50,
    borderRadius: BorderRadius.base - 2,
    borderWidth: BorderWidth.regular,
    marginTop: Spacing.lg,
  },
  logoutText: { fontSize: Typography.fontSize.base - 1, fontWeight: Typography.fontWeight.bold },

  /* Modals */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(5,39,80,0.45)",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  modalContainer: {
    borderRadius: 18,
    padding: Spacing.base,
    maxHeight: "85%",
    alignSelf: "center",
    width: "100%",
    maxWidth: 420,
  },
  modalTitle: { fontSize: Typography.fontSize.lg, fontWeight: Typography.fontWeight.extraBold, marginBottom: 6 },
  /* Dialog title row: icon, title and the close button side by side, above the content. */
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingBottom: 12,
    marginBottom: Spacing.xs,
    borderBottomWidth: 1,
  },
  modalHeaderIcon: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  modalHeaderTitle: { flex: 1, fontSize: Typography.fontSize.lg, fontWeight: Typography.fontWeight.bold },
  modalHeaderClose: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  modalBody: { paddingVertical: Spacing.xs },
  modalScroll: { flexGrow: 0 },
  readOnlyNote: { fontSize: Typography.fontSize.xs, marginBottom: Spacing.sm },
  editField: { marginBottom: Spacing.sm },
  editLabel: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.semiBold, marginBottom: 5 },
  editInput: {
    minHeight: 44,
    borderWidth: BorderWidth.thin,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: Typography.fontSize.base,
    backgroundColor: BrandColors.WHITE,
  },
  fieldError: { color: "#DC2626", fontSize: Typography.fontSize.xs, marginTop: 4 },
  formError: { color: "#DC2626", fontSize: Typography.fontSize.sm, marginBottom: Spacing.sm },
  personalActions: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  cancelEditButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: BorderRadius.md,
    borderWidth: BorderWidth.thin,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelEditText: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.bold },
  saveEditButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: BorderRadius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  saveEditText: { color: BrandColors.WHITE, fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.bold },
  modalNote: {
    fontSize: Typography.fontSize.xs - 0.5,
    fontWeight: Typography.fontWeight.medium,
    lineHeight: 17,
    marginBottom: 14,
  },
  /* One detail: label on the left (fixed share), value on the right; long values wrap instead of overlapping. */
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.base,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(8,59,117,0.08)",
  },
  infoRowLast: { borderBottomWidth: 0 },
  infoKey: { flexShrink: 0, maxWidth: "42%", fontSize: Typography.fontSize.sm + 1, fontWeight: Typography.fontWeight.medium },
  infoValue: { flex: 1, fontSize: Typography.fontSize.sm + 1, fontWeight: Typography.fontWeight.semiBold, textAlign: "right", lineHeight: 20 },
  statusLabelContainer: { flexDirection: "row", alignItems: "center", gap: 5 },
  statusLabelText: { fontSize: Typography.fontSize.xs, fontWeight: Typography.fontWeight.extraBold },
  fetchingContainer: { paddingVertical: 24, alignItems: "center" },
  fetchingText: { marginTop: 12, fontSize: 13 },
  profileScrollContent: { paddingBottom: 0 },

  /* Incomplete Profile Banner */
  completeProfileBanner: {
    marginHorizontal: Spacing.base,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
    padding: Spacing.base,
    borderRadius: BorderRadius.base,
    borderWidth: BorderWidth.thin,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  bannerHeader: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.md },
  bannerIconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  bannerHeaderText: { flex: 1 },
  bannerTitle: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.bold, marginBottom: 3 },
  bannerSubtitle: { fontSize: Typography.fontSize.xs + 0.5, lineHeight: 18 },
  bannerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 42,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  bannerBtnText: { color: BrandColors.WHITE, fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.bold },

  /* Incomplete Profile Modal View */
  incompleteModalBox: { width: "100%", alignItems: "center", paddingTop: Spacing.xs, paddingBottom: 0 },
  incompleteIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  incompleteTitle: { fontSize: Typography.fontSize.lg, fontWeight: Typography.fontWeight.bold, marginBottom: 4, textAlign: "center" },
  incompleteSubtitle: { fontSize: Typography.fontSize.xs + 1, textAlign: "center", lineHeight: 18, marginBottom: Spacing.sm },

  /* Progress Bar for Incomplete Profile */
  progressContainer: { width: "100%", marginBottom: Spacing.sm },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 5 },
  progressLabel: { fontSize: Typography.fontSize.xs, fontWeight: Typography.fontWeight.bold },
  progressPercent: { fontSize: Typography.fontSize.xs, fontWeight: Typography.fontWeight.bold },
  progressBarBg: { width: "100%", height: 6, borderRadius: 3, backgroundColor: "#E2E8F0", overflow: "hidden" },
  progressBarFill: { height: "100%", borderRadius: 3 },

  incompleteCard: {
    width: "100%",
    borderRadius: BorderRadius.md,
    borderWidth: BorderWidth.thin,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  incompleteRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 5 },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E6F5F0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  verifiedText: { fontSize: Typography.fontSize.xs - 1, color: "#059669", fontWeight: Typography.fontWeight.bold },
  pendingBadge: { backgroundColor: "#FEF0E6", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  pendingText: { fontSize: Typography.fontSize.xs - 1, color: "#EA580C", fontWeight: Typography.fontWeight.bold },
  modalActionBtn: { flex: 1, height: 46, borderRadius: 12 },
  completeActionBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  completeActionBtnText: { color: BrandColors.WHITE, fontSize: Typography.fontSize.sm + 1, fontWeight: Typography.fontWeight.bold },
  modalScrollArea: { maxHeight: 300, marginVertical: Spacing.sm },
  appItemCard: { marginBottom: Spacing.sm },
  appSubText: { fontSize: 11, marginTop: 4 },
  flexOne: { flex: 1 },
});

/** paddingBottom for the profile ScrollView. Pass SCREEN_BOTTOM_PADDING at call-site. */
export const getProfileScrollStyle = (bottomPadding: number) => ({
  paddingBottom: bottomPadding,
});

/** Dynamic border and text colour for the KYC status pill. */
export const getKycPillStyle = (
  kycVerified: boolean,
  colors: { orange: string }
) => ({
  borderColor: kycVerified ? "#7BE0A8" : colors.orange,
  color: kycVerified ? "#7BE0A8" : colors.orange,
});

/** Dynamic theme styling for Profile Hero shifted to screen top */
export const getProfileHeroThemedStyle = (
  _primaryDark: string,
  topInset: number
) => ({
  paddingTop: topInset + Spacing.md,
});
