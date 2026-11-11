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
  inputGroup: {
    marginBottom: 4,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  infoIconSpacing: {
    marginLeft: 6,
  },
  inputLabel: {
    fontSize: Typography.fontSize.sm + 1,
    fontWeight: Typography.fontWeight.bold,
    color: "#0B1F3A",
    marginBottom: 6,
  },
  inputLabelInline: {
    fontSize: Typography.fontSize.sm + 1,
    fontWeight: Typography.fontWeight.bold,
    color: "#0B1F3A",
    marginBottom: 0,
  },
  requiredStar: {
    color: "#DC2626",
  },
  textInput: {
    height: 48,
    backgroundColor: "#F8FAFC",
    borderRadius: BorderRadius.md,
    borderWidth: BorderWidth.thin,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    fontSize: Typography.fontSize.base,
    color: "#0B1F3A",
    fontWeight: Typography.fontWeight.semiBold,
  },
  inputError: {
    borderColor: "#DC2626",
    backgroundColor: "#FEF2F2",
  },
  errorText: {
    fontSize: Typography.fontSize.xs + 1.5,
    color: "#DC2626",
    marginTop: Spacing.xs,
    fontWeight: Typography.fontWeight.medium,
  },
  dropdownSelector: {
    height: 48,
    backgroundColor: "#F8FAFC",
    borderRadius: BorderRadius.md,
    borderWidth: BorderWidth.thin,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownValue: {
    fontSize: Typography.fontSize.base,
    color: "#0B1F3A",
    fontWeight: Typography.fontWeight.semiBold,
  },
  dropdownPlaceholder: {
    fontSize: Typography.fontSize.base,
    color: "#94A3B8",
    fontWeight: Typography.fontWeight.regular,
  },
  dropdownMenu: {
    backgroundColor: BrandColors.WHITE,
    borderRadius: BorderRadius.md,
    borderWidth: BorderWidth.thin,
    borderColor: "#E2E8F0",
    marginTop: 6,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#0B1F3A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: BorderWidth.thin,
    borderBottomColor: "#F1F5F9",
  },
  dropdownItemText: {
    fontSize: Typography.fontSize.sm + 1.5,
    color: "#0B1F3A",
    fontWeight: Typography.fontWeight.medium,
  },
  dropdownItemActive: {
    color: BrandColors.PRIMARY_ORANGE,
    fontWeight: Typography.fontWeight.bold,
  },
  fieldSpacer: {
    height: 16,
  },
  buttonWrapper: {
    marginTop: "auto",
    paddingTop: 24,
    marginBottom: 20,
  },
  ctaButton: {
    height: 52,
    borderRadius: BorderRadius.base,
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.sm,
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
  ctaButtonDisabled: {
    backgroundColor: "#CBD5E1",
    ...Platform.select({
      ios: {
        shadowOpacity: 0,
      },
      android: {
        elevation: 0,
      },
      default: {},
    }),
  },
  ctaButtonText: {
    color: BrandColors.WHITE,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.2,
  },
  ctaButtonTextDisabled: {
    color: "#64748B",
  },
});

export const getContainerInsetsStyle = (top: number): ViewStyle => ({
  paddingTop: top,
});

export const getScrollContentInsetsStyle = (bottom: number): ViewStyle => ({
  paddingBottom: Math.max(bottom, 24) + 16,
});
