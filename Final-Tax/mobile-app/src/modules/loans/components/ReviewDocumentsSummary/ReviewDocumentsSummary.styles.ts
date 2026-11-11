import { StyleSheet } from "react-native";
import { BorderRadius, BrandColors, Shadows, Spacing, Typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: BrandColors.WHITE,
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: Spacing.base + 2,
    marginBottom: Spacing.base,
    ...Shadows.sm,
  },
  cardError: {
    borderColor: "#FECACA",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    marginBottom: 12,
  },
  titleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#F0F5FA",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: BrandColors.PRIMARY_BLUE,
  },
  count: {
    fontSize: Typography.fontSize.sm,
    color: BrandColors.TEXT_SECONDARY,
    marginTop: 1,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    backgroundColor: BrandColors.PRIMARY_LIGHT_BLUE,
  },
  editText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: BrandColors.PRIMARY_BLUE,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 7,
  },
  itemName: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    color: BrandColors.TEXT_PRIMARY,
    fontWeight: Typography.fontWeight.medium,
  },
  itemNameMissing: {
    color: BrandColors.TEXT_SECONDARY,
  },
  itemTag: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semiBold,
    color: BrandColors.TEXT_MUTED,
  },
  itemTagMissing: {
    color: "#B91C1C",
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: 8,
  },
  errorText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: "#B91C1C",
  },
});
