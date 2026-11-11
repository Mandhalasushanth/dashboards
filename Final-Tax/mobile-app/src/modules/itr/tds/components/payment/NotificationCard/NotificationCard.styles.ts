import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF7ED",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#FED7AA",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconCircle: {
    marginRight: 10,
  },
  text: {
    flex: 1,
    fontSize: 12,
    color: "#0B1F3A",
    fontWeight: "500",
    lineHeight: 16,
  },
  securityBanner: {
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DBEAFE",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
  },
  securityText: {
    fontSize: 12,
    color: "#0B1F3A",
    fontWeight: "500",
  },
});
