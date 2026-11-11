import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
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
  textGroup: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#0B1F3A",
    lineHeight: 18,
  },
  subtitle: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 3,
    fontWeight: "400",
  },
  uploadButton: {
    borderWidth: 1.2,
    borderColor: "#F97316",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 7,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#EA580C",
  },
  uploadedBadge: {
    backgroundColor: "#FFF7ED",
    borderWidth: 1.2,
    borderColor: "#F97316",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  uploadedText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#EA580C",
  },
});
