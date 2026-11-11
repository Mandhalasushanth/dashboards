import { StyleSheet } from "react-native";
import { Spacing } from "../../../../shared/theme";

export const styles = StyleSheet.create({
  biometricCard: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    borderRadius: 20,
    backgroundColor: "rgba(2, 132, 199, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(2, 132, 199, 0.12)",
    marginBottom: Spacing.md,
  },
  biometricIconRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(245, 130, 32, 0.1)",
    borderWidth: 2,
    borderColor: "rgba(245, 130, 32, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  biometricLabel: {
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
  },
  biometricSub: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    opacity: 0.75,
    marginBottom: Spacing.lg,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 10,
    borderWidth: 1.5,
    marginBottom: Spacing.md,
  },
  retryBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
  switchToPasscodeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  switchToPasscodeText: {
    fontSize: 13,
    fontWeight: "500",
    textDecorationLine: "underline",
    opacity: 0.75,
  },
});
