import { StyleSheet } from "react-native";
import { BrandColors, Spacing, Typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: BrandColors.WHITE,
    borderRadius: 16,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: BrandColors.CARD_BORDER,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize.sm + 1,
    fontWeight: "700",
    color: BrandColors.PRIMARY_BLUE,
  },
});
