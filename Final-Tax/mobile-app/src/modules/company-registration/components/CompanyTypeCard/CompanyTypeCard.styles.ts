import { StyleSheet } from "react-native";
import { BrandColors } from "../../../../design-system/colors";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: BrandColors.CARD,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: BrandColors.BORDER,
    marginBottom: 12,
  },
  cardSelected: {
    borderColor: BrandColors.PRIMARY_BLUE_ACCENT,
    backgroundColor: BrandColors.PRIMARY_LIGHT_BLUE,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: BrandColors.PRIMARY_LIGHT_BLUE,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  titleCol: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: BrandColors.TEXT_PRIMARY,
  },
  description: {
    fontSize: 13,
    color: BrandColors.TEXT_SECONDARY,
    marginTop: 4,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: BrandColors.TEXT_SECONDARY,
    fontWeight: "500",
  },
  feeText: {
    fontSize: 15,
    fontWeight: "700",
    color: BrandColors.PRIMARY_ORANGE,
  },
});
