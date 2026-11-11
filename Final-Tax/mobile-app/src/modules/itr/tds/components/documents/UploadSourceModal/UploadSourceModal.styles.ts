import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      default: {},
    }),
  },
  header: {
    marginBottom: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12.5,
    fontWeight: "400",
    color: "#64748B",
    marginTop: 4,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 18,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    padding: 14,
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
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  filesIconBox: {
    backgroundColor: "#E0F2FE",
  },
  galleryIconBox: {
    backgroundColor: "#F3E8FF",
  },
  cameraIconBox: {
    backgroundColor: "#DCFCE7",
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.1,
  },
  optionSubtitle: {
    fontSize: 12,
    fontWeight: "400",
    color: "#64748B",
    marginTop: 2,
  },
  cancelButton: {
    height: 48,
    backgroundColor: "#F8FAFC",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
});
