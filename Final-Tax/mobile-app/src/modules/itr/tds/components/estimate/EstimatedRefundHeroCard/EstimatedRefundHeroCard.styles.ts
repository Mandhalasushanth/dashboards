import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF7ED",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FED7AA",
    borderLeftWidth: 4,
    borderLeftColor: "#F97316",
    paddingVertical: 18,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    ...Platform.select({
      ios: {
        shadowColor: "#F97316",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
      default: {},
    }),
  },
  contentLeft: {
    flex: 1,
    paddingRight: 8,
  },
  label: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#F97316",
  },
  amount: {
    fontSize: 32,
    fontWeight: "900",
    color: "#F97316",
    letterSpacing: -0.5,
    marginVertical: 3,
  },
  caption: {
    fontSize: 11,
    color: "#64748B",
    lineHeight: 15,
    fontWeight: "400",
  },
  illustrationWrapper: {
    width: 110,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
});
