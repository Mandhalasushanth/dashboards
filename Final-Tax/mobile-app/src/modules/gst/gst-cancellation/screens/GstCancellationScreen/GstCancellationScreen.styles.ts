/**
 * GST Cancellation (REG-16) - Styles & Constants
 * Same UI/design tokens, compressed implementation.
 */
import { Platform, StyleSheet } from "react-native";
import {
  BrandColors,
  BorderRadius,
  BorderWidth,
  Spacing,
  Typography,
} from "@/shared/theme";

export const CANCELLATION_REASONS = [
  "Discontinuance / Closure of Business",
  "Annual Turnover Fell Below GST Exemption Limit (₹40L/₹20L)",
  "Transfer of Business / Demerger / Amalgamation",
  "Death of Sole Proprietor",
  "Change in Legal Constitution",
  "Other Valid Reason",
];

export const ACCEPTED_PROOFS = [
  "Business Closure Proof",
  "Sale / Transfer Agreement",
  "Merger / Amalgamation Document",
  "Revised Constitution / Partnership Document",
  "Death Certificate",
  "Other Relevant Supporting Document",
];

const white = BrandColors.WHITE;
const primary = BrandColors.TEXT_PRIMARY;
const orange = BrandColors.PRIMARY_ORANGE;
const blue = BrandColors.PRIMARY_BLUE;
const border = "#E2E8F0";
const slate = "#64748B";
const light = "#F8FAFC";
const radius = BorderRadius.md;
const thin = BorderWidth.thin;

const center = {
  justifyContent: "center" as const,
  alignItems: "center" as const,
};

const pill = {
  height: 50,
  borderRadius: 25,
  justifyContent: "center" as const,
  alignItems: "center" as const,
};

const shadow = {
  shadowColor: "#0F172A",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.03,
  shadowRadius: 4,
  elevation: 1,
};

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: white },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.base,
    paddingBottom: 12,
    backgroundColor: white,
  },
  backButton: { width: 38, height: 38, ...center },
  roundBackButton: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "#F1F5F9", ...center,
  },
  headerTitleWrap: { alignItems: "center" },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: primary,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  headerMainTitle: { fontSize: 18, fontWeight: "800", color: primary },
  headerSubtitle: { fontSize: 12, color: slate, marginTop: 2, fontWeight: "500" },
  placeholderBox: { width: 38 },
  scrollView: { flex: 1 },
  scrollContent: { padding: Spacing.base, paddingBottom: 40, gap: 14 },

  formSectionTitle: {
    fontSize: 16, fontWeight: "800", color: "#0F172A",
    marginTop: 4, marginBottom: -4,
  },
  fieldGroup: { gap: 6 },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  label: {
    fontSize: Typography.fontSize.sm + 1,
    fontWeight: Typography.fontWeight.semiBold,
    color: primary,
  },
  star: { color: "#EF4444" },

  input: {
    height: 48, backgroundColor: BrandColors.BACKGROUND,
    borderRadius: radius, borderWidth: thin, borderColor: border,
    paddingHorizontal: 14, fontSize: Typography.fontSize.base, color: primary,
  },
  textArea: {
    minHeight: 88, backgroundColor: white, borderRadius: radius,
    borderWidth: thin, borderColor: border, padding: 12,
    fontSize: Typography.fontSize.sm + 1.5, color: primary,
    textAlignVertical: "top",
  },
  counterRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  charCount: { fontSize: Typography.fontSize.xs + 1, color: "#94A3B8" },
  selectBox: {
    height: 48, backgroundColor: white, borderRadius: radius,
    borderWidth: thin, borderColor: border, paddingHorizontal: 14,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  calendarIconBox: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: "#E0F2FE", alignItems: "center", justifyContent: "center",
  },
  selectText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: primary,
  },
  placeholderText: {
    color: "#94A3B8",
    fontWeight: Typography.fontWeight.regular,
  },
  declarationRow: {
    flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 4,
  },
  checkbox: {
    width: 20, height: 20, borderRadius: 6, borderWidth: 1.5,
    borderColor: "#94A3B8", backgroundColor: white, marginTop: 2, ...center,
  },
  checkboxActive: { backgroundColor: orange, borderColor: orange },
  declarationLabel: {
    fontSize: Typography.fontSize.xs + 2.5,
    fontWeight: Typography.fontWeight.semiBold,
    color: primary,
  },
  declarationSubText: {
    fontSize: Typography.fontSize.xs + 1.5,
    color: BrandColors.TEXT_SECONDARY,
    marginTop: 1,
  },
  inputError: { borderColor: "#EF4444", backgroundColor: "#FEF2F2" },
  errorText: {
    fontSize: Typography.fontSize.xs + 1.5,
    color: "#DC2626",
    fontWeight: Typography.fontWeight.medium,
  },

  proofCard: {
    backgroundColor: white, borderRadius: 14, borderWidth: 1, borderColor: border,
    padding: 16, gap: 14, ...shadow,
  },
  proofDescText: { fontSize: 13.5, color: slate, lineHeight: 20 },
  uploadActionsRow: { flexDirection: "row", gap: 12 },
  uploadBtn: {
    flex: 1, height: 48, borderRadius: 12, borderWidth: 1.5,
    borderColor: "#083B75", backgroundColor: white,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  uploadBtnText: { fontSize: 14, fontWeight: "700", color: "#083B75" },
  docPreviewRow: {
    flexDirection: "row", alignItems: "center", backgroundColor: light,
    borderRadius: 10, borderWidth: 1, borderColor: border, padding: 12,
  },
  docPreviewIcon: {
    width: 36, height: 36, borderRadius: 8, backgroundColor: "#EAF1FE",
    marginRight: 10, ...center,
  },
  docPreviewInfo: { flex: 1, marginRight: 12, overflow: "hidden" },
  docPreviewName: { fontSize: 13.5, fontWeight: "700", color: "#0F172A" },
  docPreviewSize: { fontSize: 11.5, color: slate, marginTop: 2 },
  docDeleteBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  docDeleteText: { fontSize: 13, fontWeight: "700", color: "#DC2626" },

  acceptedProofsCard: {
    backgroundColor: "#FFF7ED", borderRadius: 14, borderWidth: 1,
    borderColor: "#FFEDD5", padding: 16, marginTop: 2,
  },
  acceptedProofsHeader: {
    flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 8,
  },
  acceptedProofsTitle: { fontSize: 15, fontWeight: "700", color: "#0F172A" },
  acceptedProofList: { marginTop: 2 },
  acceptedProofItem: {
    flexDirection: "row", alignItems: "flex-start", marginBottom: 8, paddingRight: 4,
  },
  acceptedProofBullet: {
    fontSize: 14, color: "#334155", marginRight: 8, lineHeight: 20,
  },
  acceptedProofText: {
    flex: 1, fontSize: 13.5, color: "#334155", lineHeight: 20, fontWeight: "400",
  },
  viewMoreBtn: {
    flexDirection: "row", alignItems: "center", alignSelf: "flex-end",
    marginTop: 4, paddingVertical: 4, paddingHorizontal: 2, gap: 4,
  },
  viewMoreText: { fontSize: 13, fontWeight: "700", color: orange },

  actionOrangeBtn: {
    height: 52, borderRadius: 26, backgroundColor: orange,
    ...center, shadowColor: orange, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 3, marginTop: Spacing.sm,
  },
  actionOrangeBtnText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: white,
  },
  primaryBtn: {
    ...pill, backgroundColor: orange,
    shadowColor: orange, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2, shadowRadius: 6, elevation: 2,
  },
  primaryBtnText: { fontSize: 15, fontWeight: "700", color: white },
  primaryBtnDisabled: { opacity: 0.65 },
  loadingRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  secondaryBtn: { ...pill, backgroundColor: "#F1F5F9" },
  secondaryBtnText: { fontSize: 15, fontWeight: "700", color: "#083B75" },
  bottomBar: {
    paddingHorizontal: Spacing.base, paddingTop: 12, backgroundColor: white,
    borderTopWidth: 1, borderTopColor: "#F1F5F9",
  },

  reviewCard: {
    backgroundColor: white, borderRadius: BorderRadius.lg, padding: Spacing.base,
    borderWidth: 1, borderColor: border, gap: 12,
  },
  reviewCardHeader: {
    flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4,
  },
  reviewCardTitle: { fontSize: 15, fontWeight: "700", color: "#083B75" },
  reviewRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "flex-start", paddingVertical: 2,
  },
  reviewKey: { fontSize: 13, color: slate, flex: 1 },
  reviewVal: {
    fontSize: 13, fontWeight: "600", color: primary,
    flex: 1.4, textAlign: "right",
  },
  reviewDivider: { height: 1, backgroundColor: "#F1F5F9" },
  reviewDeclarationBox: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    backgroundColor: light, padding: 14, borderRadius: radius,
    borderWidth: 1, borderColor: border,
  },
  reviewDeclarationText: {
    flex: 1, fontSize: 12.5, color: primary, lineHeight: 18, fontWeight: "500",
  },

  successContainer: { flex: 1, backgroundColor: light },
  successHero: {
    backgroundColor: blue, paddingHorizontal: 24, paddingBottom: 40,
    alignItems: "center", borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
  },
  successHeroIconBox: { marginBottom: 16 },
  successHeroCheckCircle: {
    width: 68, height: 68, borderRadius: 34, backgroundColor: "#16A34A",
    ...center, shadowColor: "#16A34A", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 4,
  },
  successHeroTitle: {
    fontSize: 22, fontWeight: "800", color: white, textAlign: "center",
  },
  successHeroSubtitle: {
    fontSize: 13, color: "#94A3B8", textAlign: "center", marginTop: 6, lineHeight: 18,
  },
  successCard: {
    backgroundColor: white, borderRadius: 18, marginHorizontal: 16, marginTop: -20,
    padding: 20, borderWidth: 1, borderColor: border,
    shadowColor: "#0F172A", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08, shadowRadius: 14, elevation: 4, gap: 10,
  },
  successRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingVertical: 3,
  },
  successRowKey: { fontSize: 13, color: slate },
  successRowVal: { fontSize: 13, fontWeight: "700", color: primary },
  successDivider: { height: 1, backgroundColor: "#F1F5F9" },
  successActionsWrap: {
    paddingHorizontal: 16, paddingTop: 16, backgroundColor: light, gap: 12,
  },
  homeBtn: {
    backgroundColor: '#F97316',
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  homeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  trackBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  trackBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  successScrollContent: {
    paddingBottom: 24,
  },
  rowGap12: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  flex1: {
    flex: 1,
  },
  previewRowLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  previewRowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  reviewBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: BrandColors.PRIMARY_BLUE,
  },
  previewModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
  },
  previewModalCloseBtn: {
    padding: 16,
    alignSelf: "flex-end",
    zIndex: 10,
  },
  previewImage: {
    flex: 1,
    resizeMode: "contain",
  },
  selectBoxChoice: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  selectBoxChoiceSelected: {
    borderColor: BrandColors.PRIMARY_ORANGE,
    backgroundColor: "#FFF7ED",
  },
  selectTextSelected: {
    color: BrandColors.PRIMARY_ORANGE,
    fontWeight: "700",
  },
  sectionCard: {
    backgroundColor: white,
    borderRadius: 16,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 14,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 2,
  },
  sectionIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitleWrap: {
    flex: 1,
  },
  sectionMainTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 1,
  },
  secondaryBtnDanger: {
    marginTop: 4,
    borderColor: "#EF4444",
    borderWidth: 1,
  },
  secondaryBtnTextDanger: {
    color: "#EF4444",
  },
  successRowValPrimary: {
    color: BrandColors.PRIMARY_BLUE,
  },
  successRowValSuccess: {
    color: "#16A34A",
  },
  // Edit button used in Review screen
  reviewCardEditRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  editOptionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFF1E8",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FED7AA",
  },
  editOptionText: {
    fontSize: 12.5,
    fontWeight: "700" as const,
    color: BrandColors.PRIMARY_ORANGE,
  },
});

export const getHeaderBarStyle = (topInset: number) => ({
  paddingTop: Math.max(topInset, 12) + 6,
});

export const getSuccessHeroStyle = (topInset: number) => ({
  paddingTop: topInset + 32,
});

export const getSuccessActionsWrapStyle = (bottomInset: number) => ({
  paddingBottom: Math.max(bottomInset, 16),
});