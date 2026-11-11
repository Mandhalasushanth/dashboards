import { StyleSheet } from "react-native";
import { BorderRadius, BrandColors, Shadows, Spacing, Typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: BrandColors.CARD,
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    borderColor: BrandColors.BORDER,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  cardUploaded: {
    borderColor: "#BBF7D0",
    backgroundColor: "#F8FFFA",
  },
  cardError: {
    borderColor: "#FECACA",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: BrandColors.PRIMARY_LIGHT_BLUE,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBoxUploaded: {
    backgroundColor: "#DCFCE7",
  },
  textCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  name: {
    flexShrink: 1,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: BrandColors.TEXT_PRIMARY,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  badgeRequired: {
    backgroundColor: BrandColors.PRIMARY_LIGHT_ORANGE,
  },
  badgeOptional: {
    backgroundColor: "#F1F5F9",
  },
  badgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semiBold,
  },
  badgeRequiredText: {
    color: BrandColors.PRIMARY_ORANGE_DARK,
  },
  badgeOptionalText: {
    color: BrandColors.TEXT_SECONDARY,
  },
  description: {
    marginTop: 4,
    fontSize: Typography.fontSize.sm,
    lineHeight: 17,
    color: BrandColors.TEXT_SECONDARY,
  },
  uploadedLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: Spacing.sm,
  },
  uploadedText: {
    flexShrink: 1,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: "#166534",
  },
  fileMeta: {
    marginTop: 2,
    fontSize: Typography.fontSize.xs,
    color: BrandColors.TEXT_SECONDARY,
  },
  actionRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  primaryAction: {
    flex: 1,
    minHeight: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: BrandColors.PRIMARY_BLUE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  primaryActionText: {
    color: BrandColors.WHITE,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
  },
  secondaryAction: {
    flex: 1,
    minHeight: 44,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: BrandColors.BORDER,
    backgroundColor: BrandColors.WHITE,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryActionText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: BrandColors.PRIMARY_BLUE,
  },
  removeActionText: {
    color: "#B91C1C",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginTop: Spacing.md,
  },
  errorText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: "#B91C1C",
  },
});
