import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
  container: {
    marginTop: 22,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0B1F3A",
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  stepNode: {
    alignItems: "center",
    width: 60,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -6,
    zIndex: 2,
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: "#F97316",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  circle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#0B1F3A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#0B1F3A",
    textAlign: "center",
    lineHeight: 13,
  },
  connector: {
    flex: 1,
    height: 1,
    borderWidth: 0.8,
    borderColor: "#F97316",
    borderStyle: "dashed",
    marginTop: 22,
    marginHorizontal: -4,
  },
});
