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
    marginBottom: Spacing.sm,
  },
  requiredStar: {
    color: "#EF4444",
  },
  cardGrid: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  card: {
    flex: 1,
    backgroundColor: BrandColors.WHITE,
    borderRadius: 14,
    paddingVertical: 20,
    paddingHorizontal: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: BrandColors.CARD_BORDER,
    position: "relative",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardActive: {
    borderColor: "#F15927",
    backgroundColor: "#FFFFFF",
  },
  checkBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#F15927",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBox: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: "600",
    color: BrandColors.TEXT_PRIMARY,
  },
  cardTitleActive: {
    color: BrandColors.TEXT_PRIMARY,
    fontWeight: "700",
  },
});
