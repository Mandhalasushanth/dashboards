import { StyleSheet, Platform } from "react-native";
import {
  BrandColors,
  BorderRadius,
  BorderWidth,
  Spacing,
  Typography,
} from "@/shared/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.base,
    paddingBottom: 10,
    backgroundColor: BrandColors.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    borderWidth: BorderWidth.thin,
    borderColor: "#E2E8F0",
    backgroundColor: BrandColors.WHITE,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#0B1F3A",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
      default: {},
    }),
  },
  headerTitleGroup: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  headerTitle: {
    fontSize: Typography.fontSize.base + 1,
    fontWeight: Typography.fontWeight.bold,
    color: "#0F172A",
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: BrandColors.PRIMARY_ORANGE,
    marginTop: 1,
  },
  headerRightSpacer: {
    width: 38,
  },
  progressTrack: {
    height: 3,
    backgroundColor: "#E2E8F0",
    width: "100%",
  },
  progressFill: {
    height: "100%",
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    width: "50%", // Step 1 of 2
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: 12,
  },

  // Live Estimate Banner
  previewEstimateBanner: {
    backgroundColor: "#0F172A",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  previewLeft: {
    flex: 1,
  },
  previewLabel: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  previewAmount: {
    fontSize: 20,
    fontWeight: "800",
    color: BrandColors.PRIMARY_ORANGE,
    marginTop: 2,
  },
  previewRight: {
    alignItems: "flex-end",
  },
  previewTag: {
    fontSize: 11,
    color: "#CBD5E1",
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    overflow: "hidden",
  },

  // Form Section Card
  sectionCard: {
    backgroundColor: BrandColors.WHITE,
    borderRadius: 14,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
      },
      android: {
        elevation: 1.5,
      },
      default: {},
    }),
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  sectionNumberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  sectionNumberText: {
    fontSize: 12,
    fontWeight: "700",
    color: BrandColors.PRIMARY_BLUE,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },

  // Field Groups & Inputs
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },
  requiredAsterisk: {
    color: "#DC2626",
  },
  textInput: {
    minHeight: 46,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#0F172A",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
  },
  textInputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  textInputReadOnly: {
    backgroundColor: "#F8FAFC",
    color: "#64748B",
  },
  errorText: {
    fontSize: 11,
    color: "#DC2626",
    marginTop: 4,
    fontWeight: "500",
  },

  // Responsive Field Rows
  fieldRow: {
    flexDirection: "row",
    gap: 10,
  },
  fieldRowItem: {
    flex: 1,
  },

  // IFSC Row & Lookup Badges
  ifscRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  ifscInputWrap: {
    flex: 1,
  },
  ifscLoadingBox: {
    marginTop: 6,
  },
  ifscLoadingText: {
    fontSize: 12,
    color: "#64748B",
    fontStyle: "italic",
  },
  ifscSuccessBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    marginTop: 6,
    gap: 6,
  },
  ifscSuccessText: {
    fontSize: 12,
    color: "#15803D",
    fontWeight: "600",
    flex: 1,
  },

  // Chips (Account Type & Yes/No)
  chipGroup: {
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
  },
  chipActive: {
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    borderColor: BrandColors.PRIMARY_ORANGE,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  chipTextActive: {
    color: "#FFFFFF",
  },

  // Regime Selector
  regimeSelector: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  regimeOption: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  regimeOptionActive: {
    borderColor: BrandColors.PRIMARY_ORANGE,
    backgroundColor: "#FFF7ED",
  },
  regimeTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  regimeTitleActive: {
    color: BrandColors.PRIMARY_ORANGE_DARK,
  },
  regimeDesc: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 2,
    textAlign: "center",
  },

  // Compact Yes/No Question Cards (Progressive Disclosure)
  toggleSection: {
    marginVertical: 6,
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  toggleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggleTextGroup: {
    flex: 1,
    marginRight: 10,
  },
  toggleQuestion: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  toggleSubtitle: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  toggleChips: {
    flexDirection: "row",
    gap: 6,
  },
  toggleChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    minWidth: 42,
    alignItems: "center",
  },
  toggleChipActive: {
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    borderColor: BrandColors.PRIMARY_ORANGE,
  },
  toggleChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  toggleChipTextActive: {
    color: "#FFFFFF",
  },
  conditionalFields: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },

  // Sticky Bottom CTA Bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: BrandColors.WHITE,
    paddingHorizontal: Spacing.base,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    ...Platform.select({
      ios: {
        shadowColor: "#0B1F3A",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
      default: {},
    }),
  },
  ctaButton: {
    height: 50,
    borderRadius: BorderRadius.base,
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  ctaButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: BrandColors.WHITE,
  },
});
