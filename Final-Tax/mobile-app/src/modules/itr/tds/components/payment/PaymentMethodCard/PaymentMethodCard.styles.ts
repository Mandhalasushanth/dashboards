import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#0B1F3A",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.02,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
      default: {},
    }),
  },
  cardSelected: {
    borderColor: "#F97316",
    backgroundColor: "#FFF7ED",
  },
  cardUnselected: {
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  cardDisabled: {
    opacity: 0.75,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#F0F5FA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  iconBoxSelected: {
    backgroundColor: "#FFEDD5",
  },
  textGroup: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0B1F3A",
  },
  subtitle: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
    lineHeight: 14,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  radioOuterSelected: {
    borderColor: "#F97316",
  },
  radioOuterUnselected: {
    borderColor: "#CBD5E1",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#F97316",
  },
});
