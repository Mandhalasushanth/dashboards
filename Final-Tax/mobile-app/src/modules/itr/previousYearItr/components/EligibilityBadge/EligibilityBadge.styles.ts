import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 4.5,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.1,
  },
  selectedBadge: {
    backgroundColor: "#EA580C",
  },
  selectedText: {
    color: "#FFFFFF",
  },
  eligibleBadge: {
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FDBA74",
  },
  eligibleText: {
    color: "#EA580C",
  },
  closedBadge: {
    backgroundColor: "#F1F5F9",
  },
  closedText: {
    color: "#64748B",
  },
});
