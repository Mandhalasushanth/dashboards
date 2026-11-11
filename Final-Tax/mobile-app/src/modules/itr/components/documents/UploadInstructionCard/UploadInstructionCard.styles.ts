import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#0B1F3A",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  iconWrapper: {
    marginRight: 14,
    marginTop: 2,
  },
  contentWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0B1F3A",
    letterSpacing: -0.1,
  },
  description: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
    marginBottom: 8,
    lineHeight: 17,
    fontWeight: "400",
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  orangeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#F97316",
    marginRight: 7,
  },
  bulletText: {
    fontSize: 11.5,
    color: "#0B1F3A",
    fontWeight: "500",
  },
});
