import { StyleSheet, Platform, ViewStyle } from "react-native";
import {
  BrandColors,
  BorderRadius,
  BorderWidth,
  Spacing,
  Typography,
} from "../../../../../shared/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.BACKGROUND,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
  },
  titleSection: {
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: Typography.fontSize.lg + 4,
    fontWeight: Typography.fontWeight.extraBold,
    color: "#0B1F3A",
    letterSpacing: -0.2,
  },
  pageSubtitle: {
    fontSize: Typography.fontSize.sm + 0.5,
    color: BrandColors.TEXT_SECONDARY,
    marginTop: Spacing.xs,
    lineHeight: 18,
    fontWeight: Typography.fontWeight.regular,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: Spacing.base,
    borderWidth: BorderWidth.thin,
    borderColor: "#E2E8F0",
    marginBottom: Spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: "#0B1F3A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
      default: {},
    }),
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: "#083B75",
  },
  cardDescription: {
    fontSize: Typography.fontSize.xs,
    color: "#64748B",
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  sectionHeader: {
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0B1F3A",
  },
  reasonNotice: {
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  reasonNoticeText: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "500",
  },
  infoIconSpacing: {
    marginLeft: 6,
  },
  buttonWrapper: {
    marginTop: "auto",
    paddingTop: 24,
    marginBottom: 20,
  },
  continueButton: {
    height: 52,
    borderRadius: BorderRadius.base,
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: BrandColors.PRIMARY_ORANGE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      default: {},
    }),
  },
  continueButtonText: {
    color: BrandColors.WHITE,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.2,
  },
});

export const getContainerInsetsStyle = (top: number): ViewStyle => ({
  paddingTop: top,
});

export const getScrollContentInsetsStyle = (bottom: number): ViewStyle => ({
  paddingBottom: Math.max(bottom, 24) + 16,
});
