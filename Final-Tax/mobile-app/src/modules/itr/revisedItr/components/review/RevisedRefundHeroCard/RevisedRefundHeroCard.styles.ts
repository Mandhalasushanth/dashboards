import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F0FDF4",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#DCFCE7",
    padding: 16,
    marginBottom: 14,
  },
  cardPayable: {
    backgroundColor: "#FFF7ED",
    borderColor: "#FFEDD5",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  iconCirclePayable: {
    backgroundColor: "#FFEDD5",
  },
  rupeeIcon: {
    fontSize: 18,
    fontWeight: "800",
    color: "#16A34A",
  },
  rupeeIconPayable: {
    color: "#EA580C",
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#16A34A",
  },
  labelPayable: {
    color: "#EA580C",
  },
  amount: {
    fontSize: 26,
    fontWeight: "900",
    color: "#0B1F3A",
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "#DCFCE7",
    marginVertical: 8,
  },
  dividerPayable: {
    backgroundColor: "#FED7AA",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  detailLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#0B1F3A",
  },
  changeValue: {
    color: "#DC2626",
  },
  disclaimerText: {
    fontSize: 11,
    color: "#64748B",
    lineHeight: 15,
    marginTop: 10,
    fontStyle: "italic",
  },
});
