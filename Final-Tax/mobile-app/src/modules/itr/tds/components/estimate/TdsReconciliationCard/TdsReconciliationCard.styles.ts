import { StyleSheet } from "react-native";
import {
  BrandColors,
  BorderRadius,
  BorderWidth,
  Spacing,
  Typography,
} from "@/shared/theme";

export const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.base,
    padding: Spacing.base,
    marginBottom: 16,
    borderWidth: BorderWidth.thin,
  },
  containerMismatch: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FCD34D",
  },
  containerMatch: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  headerTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
  },
  titleMismatch: {
    color: "#B45309",
  },
  titleMatch: {
    color: "#15803D",
  },
  subtitle: {
    fontSize: Typography.fontSize.xs + 1,
    color: BrandColors.TEXT_SECONDARY,
    marginBottom: 12,
  },
  itemsList: {
    gap: 8,
    marginTop: 4,
  },
  itemBox: {
    backgroundColor: BrandColors.WHITE,
    borderRadius: BorderRadius.sm,
    padding: 10,
    borderWidth: BorderWidth.thin,
    borderColor: BrandColors.BORDER,
  },
  itemSource: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: BrandColors.TEXT_PRIMARY,
    marginBottom: 4,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  itemLabel: {
    fontSize: Typography.fontSize.xs,
    color: BrandColors.TEXT_SECONDARY,
  },
  itemValue: {
    fontSize: Typography.fontSize.xs + 1,
    fontWeight: Typography.fontWeight.semiBold,
    color: BrandColors.TEXT_PRIMARY,
  },
  diffValue: {
    color: "#DC2626",
    fontWeight: Typography.fontWeight.bold,
  },
});
