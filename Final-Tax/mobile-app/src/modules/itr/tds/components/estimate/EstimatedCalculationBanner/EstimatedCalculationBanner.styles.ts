import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  banner: {
    backgroundColor: "#FFF7ED",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FED7AA",
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 16,
    marginBottom: 16,
  },
  iconCircle: {
    marginRight: 10,
    marginTop: 1,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#EA580C",
  },
  description: {
    fontSize: 11.5,
    color: "#0B1F3A",
    lineHeight: 16.5,
    marginTop: 3,
    fontWeight: "400",
  },
});
