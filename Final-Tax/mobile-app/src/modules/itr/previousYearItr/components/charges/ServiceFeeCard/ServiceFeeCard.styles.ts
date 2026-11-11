import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    ...Platform.select({
      ios: {
        shadowColor: "#0B1F3A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
      default: {},
    }),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFF7ED",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0B1F3A",
  },
  rowsList: {
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 11.5,
    color: "#64748B",
    fontWeight: "500",
    flex: 1,
    paddingRight: 4,
  },
  value: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#0B1F3A",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 14,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0B1F3A",
    flex: 1,
  },
  totalValue: {
    fontSize: 17,
    fontWeight: "900",
    color: "#EA580C",
    letterSpacing: -0.2,
  },
  noteContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 8,
    marginTop: 2,
  },
  noteIconCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
    marginTop: 1,
  },
  noteText: {
    fontSize: 10,
    color: "#64748B",
    lineHeight: 14,
    flex: 1,
    fontWeight: "400",
  },
});
