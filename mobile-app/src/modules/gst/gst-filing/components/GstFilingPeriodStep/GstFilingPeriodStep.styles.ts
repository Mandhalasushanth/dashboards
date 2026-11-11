import { Platform, StyleSheet } from "react-native";
import { BrandColors } from "@/shared/theme";

export const styles = StyleSheet.create({
  container: {
    paddingTop: 4,
    paddingBottom: 16,
  },

  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    padding: 16,
    marginBottom: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },

  sectionIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#FFF7ED",
    justifyContent: "center",
    alignItems: "center",
  },

  sectionTitleWrap: {
    flex: 1,
  },

  sectionMainTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },

  sectionSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 1,
  },

  fieldGroup: {
    marginBottom: 14,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },

  label: {
    fontSize: 13.5,
    fontWeight: "600",
    color: BrandColors.TEXT_PRIMARY,
    marginBottom: 6,
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif-medium",
    }),
  },

  star: {
    color: "#EF4444",
  },

  periodPillsRow: {
    flexDirection: "row",
    gap: 8,
  },

  frequencyHint: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 6,
    lineHeight: 16,
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif",
    }),
  },

  periodPill: {
    flex: 1,
    height: 44,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },

  periodPillActive: {
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    borderColor: BrandColors.PRIMARY_ORANGE,
  },

  periodPillText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif",
    }),
  },

  periodPillTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  selectInput: {
    height: 50,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectText: {
    fontSize: 14,
    color: BrandColors.TEXT_PRIMARY,
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif",
    }),
    flex: 1,
    marginRight: 8,
  },

  placeholderText: {
    color: "#94A3B8",
  },

  input: {
    height: 50,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 16,
    fontSize: 14,
    color: BrandColors.TEXT_PRIMARY,
    fontWeight: "600",
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif",
    }),
  },

  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },

  errorText: {
    fontSize: 11.5,
    color: "#DC2626",
    marginTop: 4,
    fontWeight: "500",
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif",
    }),
  },

  lookupIndicator: {
    marginTop: 5,
    alignSelf: "flex-start",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  modalContent: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    maxHeight: 400,
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: BrandColors.TEXT_PRIMARY,
    marginBottom: 14,
    textAlign: "center",
  },

  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    borderRadius: 10,
  },

  modalOptionSelected: {
    backgroundColor: "#FEF0E6",
  },

  modalOptionText: {
    fontSize: 13.5,
    color: BrandColors.TEXT_PRIMARY,
    fontWeight: "500",
    flex: 1,
    marginRight: 8,
  },

  modalOptionTextSelected: {
    color: BrandColors.PRIMARY_ORANGE,
    fontWeight: "700",
  },

  verifiedCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    padding: 12,
    marginTop: 8,
  },

  verifiedTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  verifiedBadgeText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#15803D",
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif-medium",
    }),
  },

  verifiedStateText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif",
    }),
  },

  verifiedTradeName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#14532D",
    marginBottom: 2,
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif-medium",
    }),
  },

  verifiedLegalName: {
    fontSize: 12,
    color: "#4B5563",
    marginBottom: 6,
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif",
    }),
  },

  schemePill: {
    alignSelf: "flex-start",
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  schemePillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0369A1",
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif-medium",
    }),
  },

  methodContent: {
    flex: 1,
    marginLeft: 10,
  },

  methodCardSecond: {
    marginTop: 8,
  },

  methodCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
  },

  methodCardActive: {
    borderColor: BrandColors.PRIMARY_ORANGE,
    backgroundColor: "#FFF7F0",
  },

  methodTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: BrandColors.TEXT_PRIMARY,
    marginBottom: 4,
  },

  methodSubtitle: {
    fontSize: 11.5,
    lineHeight: 16,
    color: "#64748B",
  },

  estimatesContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  estimateInputRow: {
    marginBottom: 12,
  },

  estimateLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: BrandColors.TEXT_PRIMARY,
    marginBottom: 6,
  },

  estimateInput: {
    height: 46,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 12,
    fontSize: 13,
    color: BrandColors.TEXT_PRIMARY,
  },
});
