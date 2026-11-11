import { StyleSheet, Platform } from "react-native";
import {
  BrandColors,
  BorderRadius,
  BorderWidth,
  Spacing,
  Typography,
} from "@/shared/theme";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: BrandColors.WHITE,
    borderRadius: BorderRadius.base,
    padding: Spacing.base,
    borderWidth: BorderWidth.thin,
    borderColor: BrandColors.BORDER,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  cardTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: BrandColors.TEXT_PRIMARY,
    marginBottom: 16,
  },
  timelineList: {
    gap: 0,
  },
  stageItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  leftColumn: {
    alignItems: "center",
    width: 32,
    marginRight: 12,
  },
  stepCircleCompleted: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#16A34A",
    justifyContent: "center",
    alignItems: "center",
  },
  stepCircleActive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: BrandColors.PRIMARY_LIGHT_ORANGE,
    borderWidth: 2,
    borderColor: BrandColors.PRIMARY_ORANGE,
    justifyContent: "center",
    alignItems: "center",
  },
  activeInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BrandColors.PRIMARY_ORANGE,
  },
  stepCircleUpcoming: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
  },
  connectorLine: {
    width: 2,
    height: 36,
    backgroundColor: "#E2E8F0",
    marginVertical: 3,
  },
  connectorCompleted: {
    backgroundColor: "#16A34A",
  },
  connectorActive: {
    backgroundColor: BrandColors.PRIMARY_ORANGE,
  },
  rightColumn: {
    flex: 1,
    paddingBottom: 16,
  },
  stageTitle: {
    fontSize: Typography.fontSize.sm + 0.5,
    fontWeight: Typography.fontWeight.semiBold,
    color: BrandColors.TEXT_PRIMARY,
  },
  stageTitleActive: {
    color: BrandColors.PRIMARY_ORANGE_DARK,
    fontWeight: Typography.fontWeight.bold,
  },
  stageTitleUpcoming: {
    color: BrandColors.TEXT_MUTED,
  },
  stageDesc: {
    fontSize: Typography.fontSize.xs,
    color: BrandColors.TEXT_SECONDARY,
    marginTop: 2,
    lineHeight: 16,
  },
  badgePill: {
    alignSelf: "flex-start",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    marginTop: 4,
  },
  badgeCompleted: {
    backgroundColor: "#F0FDF4",
  },
  badgeCompletedText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#16A34A",
  },
  badgeActive: {
    backgroundColor: BrandColors.PRIMARY_LIGHT_ORANGE,
  },
  badgeActiveText: {
    fontSize: 10,
    fontWeight: "700",
    color: BrandColors.PRIMARY_ORANGE_DARK,
  },
});
