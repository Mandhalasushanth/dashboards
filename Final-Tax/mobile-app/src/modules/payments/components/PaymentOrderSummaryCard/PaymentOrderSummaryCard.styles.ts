import { StyleSheet } from "react-native";
import { BrandColors } from "@/shared/theme";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EEF2F6",
    overflow: "hidden",
  },
  heading: {
    fontSize: 15.5,
    fontWeight: "700",
    color: BrandColors.TEXT_PRIMARY,
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 12,
  },
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 14,
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
  },
  textCol: {
    flex: 1,
  },
  title: {
    fontSize: 14.5,
    fontWeight: "700",
    color: BrandColors.TEXT_PRIMARY,
  },
  subtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  calcList: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 14,
  },
  calcRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  calcLabel: {
    fontSize: 13,
    color: "#64748B",
  },
  calcValue: {
    fontSize: 13,
    fontWeight: "600",
    color: BrandColors.TEXT_PRIMARY,
  },
  totalBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FEF0E6",
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#FFD8BF",
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: BrandColors.PRIMARY_ORANGE,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "800",
    color: BrandColors.PRIMARY_ORANGE,
  },
});
