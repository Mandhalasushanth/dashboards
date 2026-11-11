import { StyleSheet } from "react-native";
import { BrandColors, Typography, Spacing, BorderRadius } from "@/shared/theme";

export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.base,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    width: "100%",
    maxWidth: 420,
    maxHeight: "82%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    flex: 1,
  },
  modalTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: "#0F172A",
    flexShrink: 1,
  },
  closeBtn: {
    padding: 4,
  },
  description: {
    fontSize: Typography.fontSize.xs,
    color: "#475569",
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  fieldsContainer: {
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  fieldsSectionTitle: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: "#083B75",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  fieldItem: {
    backgroundColor: "#F8FAFC",
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 2,
  },
  fieldLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  fieldLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: "#0F172A",
  },
  fieldDetail: {
    fontSize: 11,
    color: "#475569",
    lineHeight: 16,
  },
  confirmBtn: {
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    borderRadius: BorderRadius.sm,
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.xs,
  },
  confirmBtnText: {
    color: "#FFFFFF",
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
});
