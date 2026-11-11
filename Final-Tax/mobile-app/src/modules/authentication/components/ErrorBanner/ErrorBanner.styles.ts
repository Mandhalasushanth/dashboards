import { StyleSheet } from "react-native";
import { Spacing, BorderRadius, Typography } from "../../../../shared/theme";

export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    marginBottom: Spacing.md,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    flex: 1,
    color: "#B91C1C",
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    lineHeight: 18,
  },
});
