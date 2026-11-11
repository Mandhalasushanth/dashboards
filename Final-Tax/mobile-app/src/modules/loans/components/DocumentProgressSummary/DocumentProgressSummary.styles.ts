import { StyleSheet } from "react-native";
import { BorderRadius, BrandColors, Spacing, Typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: BrandColors.PRIMARY_LIGHT_BLUE,
    borderRadius: BorderRadius.base,
    padding: Spacing.base,
    marginBottom: Spacing.base,
  },
  title: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: BrandColors.PRIMARY_BLUE,
  },
  subtitle: {
    marginTop: 2,
    fontSize: Typography.fontSize.sm,
    color: BrandColors.TEXT_SECONDARY,
  },
  track: {
    marginTop: Spacing.md,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#CFE0F8",
    overflow: "hidden",
  },
  fill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: BrandColors.PRIMARY_ORANGE,
  },
  fillDone: {
    backgroundColor: "#16A34A",
  },
});
