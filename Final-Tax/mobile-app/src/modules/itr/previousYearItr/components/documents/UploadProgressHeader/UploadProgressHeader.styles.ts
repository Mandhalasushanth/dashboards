import { StyleSheet, DimensionValue, ViewStyle } from "react-native";

export const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  counterText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0B1F3A",
  },
  badge: {
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FED7AA",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 3.5,
  },
  badgeText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#EA580C",
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E2E8F0",
    marginTop: 8,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: "#F97316",
    borderRadius: 3,
  },
});

export const getFillWidthStyle = (percent: number): ViewStyle => ({
  width: `${Math.max(percent, 0)}%` as DimensionValue,
});
