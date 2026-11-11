import { Platform } from "react-native";
import type { ThemeTokens } from "@/shared/constants/theme";
import {
  BorderRadius,
  Spacing,
  Typography,
} from "@/shared/theme";

export const homeSectionStyles = {
  /* Generic card */
  card: {
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    paddingVertical: Spacing.base,
  },
  cardPadded: {
    paddingHorizontal: Spacing.base,
  },
  cardTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.extraBold,
  },
  viewAllText: {
    fontSize: 13.5,
    fontWeight: "700" as const,
    color: "#1455B8",
  },
  viewAllRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },

  /* Modern 3D Services Layout */
  servicesContainer: {
    gap: 12,
    marginBottom: Spacing.md,
  },
  servicesRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    gap: 12,
  },
  serviceCardGradient: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  serviceCard2Col: {
    flex: 1,
    minHeight: 144,
    borderRadius: 22,
    borderWidth: 1.2,
    padding: 13,
    justifyContent: "space-between" as const,
    position: "relative" as const,
    overflow: "hidden" as const,
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  serviceCardFullWidth: {
    width: "100%" as const,
    minHeight: 114,
    borderRadius: 22,
    borderWidth: 1.2,
    padding: 14,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    position: "relative" as const,
    overflow: "hidden" as const,
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  serviceCardContent2Col: {
    zIndex: 2,
    maxWidth: "58%" as const,
    justifyContent: "space-between" as const,
    flex: 1,
  },
  serviceCardContentFull: {
    zIndex: 2,
    maxWidth: "60%" as const,
  },
  serviceTitle: {
    fontSize: 15.5,
    fontWeight: "800" as const,
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  serviceDesc: {
    fontSize: 11,
    fontWeight: "500" as const,
    lineHeight: 15,
    marginBottom: 10,
  },
  serviceArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  serviceIllustration2Col: {
    position: "absolute" as const,
    right: 2,
    bottom: 4,
    width: 76,
    height: 76,
    zIndex: 1,
  },
  serviceIllustrationFull: {
    position: "absolute" as const,
    right: 6,
    bottom: 2,
    width: 110,
    height: 80,
    zIndex: 1,
  },

  /* Section headers */
  sectionHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginBottom: 10,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "800" as const,
    letterSpacing: -0.3,
  },

  /* Need help */
  helpCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 14,
    backgroundColor: "#0B5B41",
    borderRadius: 20,
    padding: Spacing.base,
    marginTop: 6,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      default: {},
    }),
  },
  helpIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.16)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  helpText: {
    flex: 1,
  },
  helpTitle: {
    color: "#FFFFFF",
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.extraBold,
  },
  helpDesc: {
    color: "#C7E5D8",
    fontSize: Typography.fontSize.sm + 0.5,
    fontWeight: Typography.fontWeight.medium,
  },
  helpBtn: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 14,
  },
  helpBtnText: {
    color: "#0B5B41",
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.extraBold,
  },

  /* Draft Card */
  draftBannerCard: {
    borderRadius: BorderRadius.base,
    borderWidth: 1.5,
    padding: Spacing.base,
    marginTop: 4,
    position: "relative" as const,
    overflow: "hidden" as const,
  },
  draftCard: {
    borderRadius: BorderRadius.base,
    borderWidth: 1.5,
    padding: Spacing.base,
    marginTop: 4,
    position: "relative" as const,
    overflow: "hidden" as const,
  },
  draftTopRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginBottom: 6,
  },
  draftHeaderRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginBottom: 6,
  },
  draftTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  draftTagText: {
    fontSize: 10,
    fontWeight: "800" as const,
    letterSpacing: 0.5,
    color: "#FFFFFF",
  },
  draftSavedTime: {
    fontSize: 11.5,
  },
  draftTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    marginBottom: 4,
  },
  draftSubtitle: {
    fontSize: 12.5,
    marginBottom: 12,
  },
  draftFooter: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    borderTopWidth: 1,
    paddingTop: 10,
  },
  draftResumeText: {
    fontSize: 13,
    fontWeight: "700" as const,
  },
};

export type { ThemeTokens };

export const getServiceCardBorderThemedStyle = (
  isDark: boolean,
  colors: ThemeTokens,
  borderColor: string
) => ({
  borderColor: isDark ? String(colors.border) : borderColor,
});

export const getServiceCardThemedStyle = (
  isDark: boolean,
  colors: ThemeTokens,
  bgColor: string,
  borderColor: string,
) => ({
  backgroundColor: isDark ? String(colors.backgroundElement) : bgColor,
  borderColor: isDark ? String(colors.border) : borderColor,
});

export const getServiceLabelThemedStyle = (isDark: boolean, colors: ThemeTokens) => ({
  color: isDark ? String(colors.text) : "#101C46",
});

export const getServiceDescThemedStyle = (isDark: boolean, colors: ThemeTokens) => ({
  color: isDark ? String(colors.textSecondary) : "#68758D",
});

export const getServiceArrowBtnThemedStyle = (isDark: boolean, colors: ThemeTokens) => ({
  backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
  borderColor: isDark ? String(colors.border) : "rgba(0,0,0,0.06)",
});

export const getDraftCardThemedStyle = (
  isDark: boolean,
  colors: ThemeTokens,
  accentColor: string,
  lightBg: string,
  lightBorder: string,
) => ({
  backgroundColor: isDark ? String(colors.backgroundElement) : lightBg,
  borderColor: accentColor,
  shadowColor: accentColor,
  borderTopColor: isDark ? String(colors.border) : lightBorder,
});

export const getHeroHeaderStyle = (colors: ThemeTokens, topInset: number) => ({
  backgroundColor: String(colors.primaryDark),
  paddingTop: topInset,
});

export const getThemedCardStyle = (colors: ThemeTokens) => ({
  backgroundColor: String(colors.backgroundElement),
  borderColor: String(colors.border),
});

export const getHomeContainerThemedStyle = (backgroundColor: string) => ({
  backgroundColor,
});

export const getScrollContentThemedStyle = (paddingBottom: number) => ({
  paddingBottom,
});

export const getSectionTitleThemedStyle = (color: string) => ({
  color,
});

export const getDraftTagThemedStyle = (backgroundColor: string) => ({
  backgroundColor,
});

export const getDraftFooterThemedStyle = (borderTopColor: string) => ({
  borderTopColor,
});

export const getThemedTextColorStyle = (color: string) => ({
  color,
});
