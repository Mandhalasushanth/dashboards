import { StyleSheet } from "react-native";
import { BrandColors, BorderRadius, Typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  formSectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 4,
    marginBottom: 6,
  },
  proofCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.base,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  proofDescText: {
    fontSize: Typography.fontSize.xs + 1,
    color: "#64748B",
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 14,
  },
  uploadActionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FDBA74",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.base,
  },
  uploadBtnText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: "700",
    color: "#EA580C",
  },
  docPreviewRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 14,
  },
  previewRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  docPreviewIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  docPreviewInfo: {
    flex: 1,
  },
  docPreviewName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: "700",
    color: "#0F172A",
  },
  docPreviewSize: {
    fontSize: Typography.fontSize.xs,
    color: "#64748B",
    marginTop: 2,
  },
  previewRowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  reviewBtnText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: "700",
    color: BrandColors.PRIMARY_BLUE,
  },
  docDeleteBtn: {
    padding: 4,
  },
  docDeleteText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: "700",
    color: "#EF4444",
  },
  previewModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  previewModalCloseBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
  },
  previewImageWrap: {
    width: "90%",
    height: "75%",
    justifyContent: "center",
    alignItems: "center",
  },
  fullPreviewImage: {
    width: "100%",
    height: "100%",
  },
});
