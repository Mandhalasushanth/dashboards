import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(11, 31, 58, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  dialogCard: {
    width: "100%",
    maxWidth: 390,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#0B1F3A",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
      default: {},
    }),
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  headerTextGroup: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0B1F3A",
  },
  subtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 3,
    lineHeight: 16,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F8F9FB",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
  },
  otpInputsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  otpBox: {
    width: 44,
    height: 50,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#F8FAFC",
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: "#0B1F3A",
  },
  otpBoxFilled: {
    borderColor: "#F97316",
    backgroundColor: "#FFF7ED",
  },
  resendRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  resendPrompt: {
    fontSize: 12,
    color: "#64748B",
  },
  resendLink: {
    fontSize: 12,
    fontWeight: "700",
    color: "#F97316",
  },
  verifyButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: "#059669",
    justifyContent: "center",
    alignItems: "center",
  },
  verifyButtonDisabled: {
    backgroundColor: "#A7F3D0",
    opacity: 0.8,
  },
  verifyButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
