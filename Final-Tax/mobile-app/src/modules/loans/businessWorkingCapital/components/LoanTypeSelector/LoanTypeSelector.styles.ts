import { StyleSheet } from "react-native";
import { BrandColors, Spacing, Typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.base,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: "700",
    color: BrandColors.TEXT_PRIMARY,
    marginBottom: Spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: Typography.fontSize.xs,
    color: BrandColors.TEXT_SECONDARY,
    marginBottom: Spacing.sm,
  },
  cardGrid: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  card: {
    flex: 1,
    backgroundColor: BrandColors.WHITE,
    borderRadius: 14,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: BrandColors.CARD_BORDER,
    alignItems: "flex-start",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardActive: {
    borderColor: BrandColors.PRIMARY_BLUE,
    backgroundColor: "#F8FAFF",
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: Spacing.xs + 2,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBoxActive: {
    backgroundColor: BrandColors.PRIMARY_BLUE,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleActive: {
    borderColor: BrandColors.PRIMARY_ORANGE,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BrandColors.PRIMARY_ORANGE,
  },
  cardTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: "700",
    color: BrandColors.TEXT_PRIMARY,
    marginBottom: 4,
  },
  cardTitleActive: {
    color: BrandColors.PRIMARY_BLUE,
  },
  cardDesc: {
    fontSize: Typography.fontSize.xs - 1,
    color: BrandColors.TEXT_SECONDARY,
    lineHeight: 16,
  },
});
