import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  supportButton: {
    height: 52,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    ...Platform.select({
      ios: {
        shadowColor: "#0B1F3A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  supportButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#059669",
    letterSpacing: -0.1,
  },
});
