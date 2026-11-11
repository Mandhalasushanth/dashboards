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
  },
  proofErrorBorder: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
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
  errorText: {
    fontSize: Typography.fontSize.xs + 1,
    color: "#EF4444",
    fontWeight: "600",
    marginTop: 6,
  },
  selectedDocCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  docIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  docInfoWrap: {
    flex: 1,
  },
  docNameText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: "700",
    color: "#0F172A",
  },
  docSizeText: {
    fontSize: Typography.fontSize.xs,
    color: "#64748B",
    marginTop: 2,
  },
  deleteDocBtn: {
    padding: 6,
  },
  acceptedProofsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    marginTop: 12,
  },
  acceptedProofsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  acceptedProofsTitle: {
    fontSize: Typography.fontSize.sm + 1,
    fontWeight: "700",
    color: "#0F172A",
  },
  acceptedProofList: {
    gap: 6,
  },
  acceptedProofItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  acceptedProofBullet: {
    fontSize: Typography.fontSize.sm,
    color: BrandColors.PRIMARY_ORANGE,
    marginRight: 6,
    marginTop: -1,
  },
  acceptedProofText: {
    fontSize: Typography.fontSize.xs + 1,
    color: "#475569",
    fontWeight: "500",
    flex: 1,
  },
  viewMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 10,
    alignSelf: "flex-start",
  },
  viewMoreText: {
    fontSize: Typography.fontSize.xs + 1,
    fontWeight: "700",
    color: BrandColors.PRIMARY_ORANGE,
  },
});
