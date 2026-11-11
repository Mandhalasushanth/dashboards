import { StyleSheet, Platform } from "react-native";
import { BrandColors } from "@/shared/theme";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 1.5,
      },
    }),
  },

  // Header
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  headerBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    flexShrink: 1,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FED7AA",
    gap: 4,
    flexShrink: 0,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: BrandColors.PRIMARY_ORANGE_DARK,
  },

  // BUG_B23_004: error banner shown in read-only mode when personal validation fails
  personalErrorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEF2F2",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  personalErrorBannerText: {
    fontSize: 12,
    color: "#DC2626",
    flex: 1,
    lineHeight: 16,
  },

  // Info Rows (Read-Only)
  infoRowsList: {
    gap: 0,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F1F5F9",
  },
  infoRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 2,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#64748B",
    width: 96,
    flexShrink: 0,
    marginRight: 8,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
    textAlign: "right",
    flex: 1,
    flexShrink: 1,
    flexWrap: "wrap",
  },
  infoValueMissing: {
    color: "#94A3B8",
    fontWeight: "400",
    fontStyle: "italic",
  },
  addressValue: {
    lineHeight: 18,
  },

  // Incomplete details alert prompt
  missingBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
    justifyContent: "space-between",
  },
  missingBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
    gap: 6,
  },
  missingText: {
    fontSize: 12,
    color: "#B45309",
    flex: 1,
    fontWeight: "500",
  },
  completeProfileBtn: {
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    flexShrink: 0,
  },
  completeProfileBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // Skeleton loading state
  skeletonContainer: {
    paddingVertical: 4,
  },
  skeletonHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  skeletonBar: {
    height: 12,
    backgroundColor: "#E2E8F0",
    borderRadius: 6,
    marginVertical: 6,
  },
  skeletonBarTitle: {
    width: "45%",
    height: 16,
  },
  skeletonBarAction: {
    width: "20%",
    height: 24,
    borderRadius: 6,
  },
  skeletonBarShort: {
    width: "35%",
  },
  skeletonBarMedium: {
    width: "60%",
  },
  skeletonBarLong: {
    width: "85%",
  },
  skeletonBarFull: {
    width: "100%",
  },

  // Fetch error state
  errorContainer: {
    paddingVertical: 14,
    alignItems: "center",
  },
  errorIconContainer: {
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 13,
    color: "#DC2626",
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 12,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    gap: 6,
  },
  retryButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#B91C1C",
  },

  // Inline Edit Form State
  editFormContainer: {
    marginTop: 4,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  fieldRow: {
    flexDirection: "row",
    gap: 10,
  },
  fieldRowItem: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 4,
  },
  requiredAsterisk: {
    color: "#EF4444",
  },
  textInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 13,
    color: "#0F172A",
  },
  textInputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  fieldErrorText: {
    fontSize: 11,
    color: "#DC2626",
    marginTop: 3,
  },
  editActionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: BrandColors.PRIMARY_BLUE,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  saveButtonDisabled: {
    opacity: 0.65,
  },
  saveButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
