import { StyleSheet } from "react-native";
import { BrandColors, Spacing } from "@/shared/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.BACKGROUND,
  },
  content: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
  },
  cardList: {
    paddingBottom: Spacing.base,
  },
});
