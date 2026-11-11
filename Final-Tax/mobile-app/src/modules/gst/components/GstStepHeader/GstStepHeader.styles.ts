import { StyleSheet } from "react-native";
import { BrandColors, Typography, Spacing } from "@/shared/theme";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },
  titleCenter: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: Spacing.xs,
  },
  mainTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: "#0B1F3A",
  },
  subTitle: {
    fontSize: Typography.fontSize.xs,
    color: BrandColors.PRIMARY_ORANGE,
    fontWeight: Typography.fontWeight.semiBold,
    marginTop: 2,
  },
  rightSpacer: {
    width: 40,
  },
  progressBarTrack: {
    height: 3,
    backgroundColor: "#E2E8F0",
    width: "100%",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: BrandColors.PRIMARY_ORANGE,
  },
});
