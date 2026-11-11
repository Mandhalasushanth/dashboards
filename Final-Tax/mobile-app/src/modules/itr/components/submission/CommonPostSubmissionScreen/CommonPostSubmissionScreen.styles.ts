import { StyleSheet, Platform, ViewStyle } from "react-native";
import { BrandColors, BorderRadius, BorderWidth, Spacing, Typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.BACKGROUND,
  },
  header: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.base,
    paddingVertical: 8,
    backgroundColor: BrandColors.WHITE,
    borderBottomWidth: BorderWidth.thin,
    borderBottomColor: "#F1F5F9",
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    borderWidth: BorderWidth.thin,
    borderColor: "#E5E7EB",
    backgroundColor: BrandColors.WHITE,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#0B1F3A",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
      default: {},
    }),
  },
  headerTitleGroup: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: "#0B1F3A",
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.sm + 0.5,
    fontWeight: Typography.fontWeight.medium,
    color: "#0B1F3A",
    marginTop: 2,
  },
  headerRightSpacer: {
    width: 38,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },

  // ── Success Celebration Banner ──────────────────────────────────────────
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    gap: 12,
  },
  successIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
  },
  successTextContainer: {
    flex: 1,
  },
  successTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#065F46",
  },
  successSubtitle: {
    fontSize: 12,
    color: "#047857",
    marginTop: 2,
    lineHeight: 16,
  },

  // ── Navy-Blue Application Details Card ──────────────────────────────────
  heroCard: {
    backgroundColor: BrandColors.PRIMARY_BLUE,
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
    shadowColor: "#083B75",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  heroAppIdLabel: {
    fontSize: 11.5,
    color: "rgba(255, 255, 255, 0.75)",
    fontWeight: "700",
    letterSpacing: 0.5,
    flexShrink: 0,
  },
  heroAppIdValue: {
    fontSize: 17,
    fontWeight: "800",
    color: BrandColors.WHITE,
    marginBottom: 14,
    letterSpacing: 0.3,
    flexShrink: 1,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  statusBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  statusBadgeText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#92400E",
  },
  heroDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    marginVertical: 10,
  },
  heroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowLabel: {
    fontSize: 12.5,
    color: "rgba(255, 255, 255, 0.75)",
  },
  rowValue: {
    fontSize: 13,
    fontWeight: "700",
    color: BrandColors.WHITE,
    textAlign: "right",
    flexShrink: 1,
    marginLeft: 12,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },

  // ── Navigation & Action Buttons ─────────────────────────────────────────
  actionButtonsCol: {
    gap: 12,
    marginTop: 4,
  },
  primaryHomeBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    shadowColor: BrandColors.PRIMARY_ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryHomeBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: BrandColors.WHITE,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  secondaryAppBtn: {
    height: 50,
    borderRadius: 25,
    backgroundColor: "#EAF1FE",
    borderWidth: 1,
    borderColor: "rgba(8, 59, 117, 0.18)",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  secondaryAppBtnText: {
    fontSize: 14.5,
    fontWeight: "700",
    color: BrandColors.PRIMARY_BLUE,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  contactSupportBtn: {
    height: 48,
    borderRadius: 24,
    backgroundColor: BrandColors.WHITE,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  contactSupportBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
    fontFamily: Platform.select({ ios: "System", android: "sans-serif" }),
  },

  // ── Unconfirmed / Missing Submission Alert Card ─────────────────────────
  unconfirmedCard: {
    backgroundColor: "#FEF2F2",
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: BorderWidth.thin,
    borderColor: "#FECACA",
    marginBottom: Spacing.md,
    alignItems: "center",
  },
  unconfirmedTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: "#991B1B",
    marginTop: Spacing.xs,
    marginBottom: 4,
  },
  unconfirmedDescription: {
    fontSize: Typography.fontSize.sm,
    color: "#7F1D1D",
    textAlign: "center",
    lineHeight: 18,
  },

  // ── Legacy Compatibility Aliases ────────────────────────────────────────
  bottomBar: {
    gap: Spacing.sm,
    paddingTop: 10,
    backgroundColor: BrandColors.WHITE,
  },
  primaryButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: BrandColors.WHITE,
  },
  secondaryButton: {
    height: 50,
    borderRadius: 25,
    backgroundColor: "#EAF1FE",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 14.5,
    fontWeight: "700",
    color: BrandColors.PRIMARY_BLUE,
  },
  tertiaryButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: BrandColors.WHITE,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  tertiaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
});

export const getContainerInsetsStyle = (topInset: number): ViewStyle => ({
  paddingTop: topInset,
});

export const getScrollContentInsetsStyle = (bottomInset: number, hasTertiaryCta = true): ViewStyle => ({
  paddingBottom: bottomInset + (hasTertiaryCta ? 184 : 135),
});

export const getBottomBarInsetsStyle = (bottomInset: number): ViewStyle => ({
  paddingBottom: Math.max(bottomInset, 12),
});
