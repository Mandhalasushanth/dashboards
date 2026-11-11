import { StyleSheet } from "react-native";
import { BrandColors, BorderRadius, Typography } from "@/shared/theme";

export const ACCEPTED_PROOFS = [
  "Closure of Business: Proof of closure / surrender of business premises",
  "Transfer / Merger: Copy of partnership deed / amalgamation agreement",
  "Death of Sole Proprietor: Copy of death certificate of proprietor",
  "Change in Constitution: Fresh PAN copy of new legal entity",
  "Voluntary: Undertaking declaring business turnover below threshold",
];

export const styles = StyleSheet.create({
  acceptedProofsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    marginBottom: 20,
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
