import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
  stepsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  stepNode: {
    alignItems: "center",
    width: 54,
  },
  completedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#16A34A",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  activeCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2.5,
    borderColor: "#F97316",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  activeInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F97316",
  },
  upcomingCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#E2E8F0",
    marginBottom: 10,
    marginTop: 2,
  },
  stepLabel: {
    fontSize: 10.5,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 13,
  },
  completedLabel: {
    color: "#16A34A",
  },
  activeLabel: {
    color: "#F97316",
  },
  upcomingLabel: {
    color: "#0B1F3A",
  },
  connector: {
    flex: 1,
    height: 2.5,
    marginTop: 11,
    marginHorizontal: -2,
  },
  completedConnector: {
    backgroundColor: "#16A34A",
  },
  upcomingConnector: {
    backgroundColor: "#E2E8F0",
  },
});
