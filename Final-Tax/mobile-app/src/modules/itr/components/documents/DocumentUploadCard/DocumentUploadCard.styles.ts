import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1.2,
    borderColor: "#E2E8F0",
    ...Platform.select({
      ios: {
        shadowColor: "#0B1F3A",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
      default: {},
    }),
  },
  cardUploaded: {
    backgroundColor: "#F0FDF4",
    borderColor: "#86EFAC",
  },
  cardError: {
    borderColor: "#DC2626",
    backgroundColor: "#FFFDFD",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainerUploaded: {
    backgroundColor: "#DCFCE7",
  },
  titleContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  title: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.1,
  },
  requiredAsterisk: {
    color: "#DC2626",
    fontWeight: "700",
  },
  optionalLabel: {
    fontSize: 12,
    fontWeight: "400",
    color: "#64748B",
  },
  subtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  uploadedFileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  checkDot: {
    marginRight: 4,
  },
  uploadedFileName: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#047857",
    flex: 1,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 4,
  },
  uploadButtonText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#4338CA",
  },
  uploadedActionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 10,
    gap: 8,
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 5,
  },
  viewButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1E3A8A",
  },
  changeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 5,
  },
  changeButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#D97706",
  },
  trashButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
  },
  inlineErrorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#FEE2E2",
  },
  errorIcon: {
    marginRight: 5,
  },
  inlineErrorText: {
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "500",
  },
});
