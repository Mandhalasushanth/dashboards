import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#0B1F3A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 5,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 9,
  },
  labelCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  labelText: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  valueText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0B1F3A",
  },
  rightAlignedGroup: {
    alignItems: "flex-end",
  },
  daysLeftText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#EA580C",
    marginTop: 2,
  },
  riskBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  riskBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#16A34A",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
  },
});
