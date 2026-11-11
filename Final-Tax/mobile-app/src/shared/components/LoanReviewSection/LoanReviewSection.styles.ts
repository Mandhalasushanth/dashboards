import { StyleSheet } from "react-native";
import { BrandColors } from "../../theme";

export const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0B1B36",
  },
  editAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  editText: {
    fontSize: 12,
    fontWeight: "600",
    color: BrandColors.PRIMARY_BLUE,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  label: {
    fontSize: 13,
    color: "#64748B",
  },
  value: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0B1B36",
    textAlign: "right",
    flexShrink: 1,
    marginLeft: 12,
  },
  highlightValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FF6500",
    textAlign: "right",
    flexShrink: 1,
    marginLeft: 12,
  },
});
