import { StyleSheet } from "react-native";
import { BorderRadius, Typography, Spacing } from "../../../../shared/theme";

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(12, 35, 64, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.lg,
    paddingVertical: 24,
    paddingHorizontal: 28,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 180,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  message: {
    marginTop: 14,
    fontSize: Typography.fontSize.sm + 0.5,
    fontWeight: Typography.fontWeight.semiBold,
    color: "#0C2340",
    textAlign: "center",
  },
});
