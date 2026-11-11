import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: "#0B1F3A",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
      default: {},
    }),
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0B1F3A",
    marginBottom: 12,
  },
  itemBlock: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  itemBlockLast: {
    borderBottomWidth: 0,
    paddingBottom: 2,
  },
  particularTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0B1F3A",
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 2.5,
  },
  label: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  value: {
    fontSize: 12.5,
    color: "#0B1F3A",
    fontWeight: "600",
  },
  changeValue: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#EA580C",
  },
  neutralChange: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#64748B",
  },
});
