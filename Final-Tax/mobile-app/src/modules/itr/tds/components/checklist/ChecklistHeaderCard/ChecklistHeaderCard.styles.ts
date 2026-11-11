import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: "#EFF6FF",
    borderRadius: 18,
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#DBEAFE",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
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
  leftInfoGroup: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    paddingRight: 6,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#0B1F3A",
    letterSpacing: -0.1,
  },
  description: {
    fontSize: 11.5,
    color: "#475569",
    marginTop: 3,
    lineHeight: 16,
    fontWeight: "400",
  },
  illustrationWrapper: {
    width: 90,
    height: 90,
    justifyContent: "center",
    alignItems: "center",
  },
});
