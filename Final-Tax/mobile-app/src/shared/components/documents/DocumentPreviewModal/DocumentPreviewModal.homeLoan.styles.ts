import { StyleSheet } from "react-native";
import { BrandColors, Typography, Spacing, BorderRadius } from "@/shared/theme";

/**
 * Home Loan variant: same layout and keys as the default Loans styles in
 * DocumentPreviewModal.styles.ts, with the Home Loan appearance (darker
 * backdrop, radius 20, 85% max height, no shadow, larger title).
 */
export const homeLoanStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.base,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  title: {
    fontSize: Typography.fontSize.base,
    fontWeight: "700",
    color: "#0F172A",
    flexShrink: 1,
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    padding: Spacing.base,
    alignItems: "center",
  },
  imagePreview: {
    width: "100%",
    height: 320,
    borderRadius: BorderRadius.sm,
    backgroundColor: "#F8FAFC",
  },
  docCard: {
    width: "100%",
    padding: Spacing.base,
    backgroundColor: "#F8FAFC",
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FEF0E6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  fileName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 4,
  },
  fileMeta: {
    fontSize: Typography.fontSize.xs,
    color: "#64748B",
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#166534",
  },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#FEF0E6",
    borderWidth: 1,
    borderColor: BrandColors.PRIMARY_ORANGE || "#EA580C",
  },
  shareBtnText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: "700",
    color: BrandColors.PRIMARY_ORANGE_DARK || "#EA580C",
  },
  footer: {
    paddingHorizontal: Spacing.base,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  closeActionBtn: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  closeActionText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: "600",
    color: "#475569",
  },
});
