import { StyleSheet, Platform } from "react-native";
import {
  BrandColors,
  BorderRadius,
  BorderWidth,
  Spacing,
  Typography,
} from "@/shared/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.BACKGROUND,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.base,
    paddingBottom: 10,
    backgroundColor: BrandColors.WHITE,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    borderWidth: BorderWidth.thin,
    borderColor: BrandColors.BORDER,
    backgroundColor: BrandColors.WHITE,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleGroup: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  headerTitle: {
    fontSize: Typography.fontSize.base + 1,
    fontWeight: Typography.fontWeight.bold,
    color: BrandColors.TEXT_PRIMARY,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: BrandColors.PRIMARY_ORANGE,
    marginTop: 1,
  },
  headerRightSpacer: {
    width: 38,
  },
  progressTrack: {
    height: 3,
    backgroundColor: "#E2E8F0",
    width: "100%",
  },
  progressFill: {
    height: "100%",
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    width: "75%", // Step 3 of 4
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: 40,
  },

  // Payment Methods Section
  sectionHeader: {
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: BrandColors.TEXT_PRIMARY,
  },
  sectionSubtitle: {
    fontSize: Typography.fontSize.xs,
    color: BrandColors.TEXT_SECONDARY,
    marginTop: 2,
  },

  // Security Badge
  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BrandColors.PRIMARY_LIGHT_BLUE,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.sm,
    marginVertical: 16,
    gap: 6,
  },
  securityText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: BrandColors.PRIMARY_BLUE,
  },

  // Error / Failure State Banner
  errorBanner: {
    backgroundColor: "#FEF2F2",
    borderRadius: BorderRadius.md,
    padding: 14,
    borderWidth: BorderWidth.thin,
    borderColor: "#FECACA",
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  errorIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
  },
  errorTextBox: {
    flex: 1,
  },
  errorTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: "#B91C1C",
  },
  errorDesc: {
    fontSize: Typography.fontSize.xs,
    color: "#DC2626",
    marginTop: 2,
  },
  retryButton: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
  },
  retryButtonText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: BrandColors.WHITE,
  },

  // Sticky Bottom Bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: BrandColors.WHITE,
    paddingHorizontal: Spacing.base,
    paddingTop: 10,
    borderTopWidth: BorderWidth.thin,
    borderTopColor: "#F1F5F9",
    ...Platform.select({
      ios: {
        shadowColor: "#0B1F3A",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
      default: {},
    }),
  },
  payButton: {
    height: 50,
    borderRadius: BorderRadius.base,
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  payButtonDisabled: {
    opacity: 0.65,
  },
  payButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: BrandColors.WHITE,
  },
});
