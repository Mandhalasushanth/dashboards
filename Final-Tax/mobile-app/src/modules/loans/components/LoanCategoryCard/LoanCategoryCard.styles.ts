import { StyleSheet, Platform } from "react-native";
import { BrandColors, BorderRadius, Shadows, Spacing, Typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: BrandColors.CARD,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: BrandColors.BORDER,
    paddingVertical: 14,
    paddingHorizontal: Spacing.base,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    ...Shadows.sm,
  },
  iconWrapper: {
    width: 54,
    height: 54,
    borderRadius: BorderRadius.base,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  iconImage: {
    width: 54,
    height: 54,
  },
  detailsCol: {
    flex: 1,
    justifyContent: "center",
    paddingRight: Spacing.sm,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: "#0F3567",
    letterSpacing: -0.2,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  description: {
    fontSize: Typography.fontSize.sm + 1,
    color: BrandColors.TEXT_SECONDARY,
    lineHeight: 18,
    marginTop: 3,
    fontWeight: Typography.fontWeight.regular,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif" }),
  },
  chevronWrapper: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
});
