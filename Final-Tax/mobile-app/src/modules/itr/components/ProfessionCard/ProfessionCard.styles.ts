import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
  card: {
    width: "48%",
    borderRadius: 16,
    padding: 14,
    minHeight: 146,
    justifyContent: "space-between",
    position: "relative",
    marginBottom: 12,
  },
  unselectedCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.2,
    borderColor: "#E2E8F0",
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
  selectedCard: {
    backgroundColor: "#0B1F3A",
    borderWidth: 2,
    borderColor: "#F97316",
    ...Platform.select({
      ios: {
        shadowColor: "#F97316",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      default: {},
    }),
  },
  checkBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#F97316",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 10,
    letterSpacing: -0.1,
  },
  unselectedTitle: {
    color: "#0B1F3A",
  },
  selectedTitle: {
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: "400",
    marginTop: 2,
  },
  unselectedSubtitle: {
    color: "#64748B",
  },
  selectedSubtitle: {
    color: "#CBD5E1",
  },
  formTypeTag: {
    fontSize: 13,
    fontWeight: "800",
    color: "#F97316",
    marginTop: 6,
  },
});
