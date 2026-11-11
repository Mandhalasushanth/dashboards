import { StyleSheet } from "react-native";
import { BrandColors, BorderRadius, BorderWidth, Spacing, Typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  reviewCard: {
    backgroundColor: BrandColors.WHITE,
    borderRadius: BorderRadius.base,
    padding: Spacing.base,
    marginBottom: 16,
    borderWidth: BorderWidth.thin,
    borderColor: BrandColors.BORDER,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: BorderWidth.thin,
    borderBottomColor: "#F1F5F9",
  },
  cardTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: BrandColors.TEXT_PRIMARY,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
    backgroundColor: BrandColors.PRIMARY_LIGHT_ORANGE,
    borderWidth: BorderWidth.thin,
    borderColor: "#FFD8B2",
    gap: 4,
  },
  editButtonText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: BrandColors.PRIMARY_ORANGE_DARK,
  },
});
