import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#FED7AA",
    borderStyle: "dashed",
    flexDirection: "row",
    alignItems: "center",
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
  cardError: {
    borderColor: "#DC2626",
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F0F5FA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textGroup: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#0B1F3A",
  },
  subtitle: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 2.5,
    fontWeight: "400",
  },
  actionButton: {
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadButton: {
    backgroundColor: "#EA580C",
  },
  uploadText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  uploadedButton: {
    backgroundColor: "#FFF7ED",
    borderWidth: 1.2,
    borderColor: "#F97316",
    paddingHorizontal: 12,
  },
  uploadedContent: {
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
