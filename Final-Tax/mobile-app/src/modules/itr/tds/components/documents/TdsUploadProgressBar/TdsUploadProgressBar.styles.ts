import { StyleSheet, ViewStyle } from "react-native";

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  countText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  percentageText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#059669",
  },
  track: {
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: "#059669",
    borderRadius: 3,
  },
});

export const getProgressFillStyle = (percentage: number): ViewStyle => ({
  width: `${percentage}%`,
});
