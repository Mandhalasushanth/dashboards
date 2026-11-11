import { Dimensions, Platform } from "react-native";
import {
  BrandColors,
  BorderRadius,
  Spacing,
  Typography,
} from "@/shared/theme";

const { width } = Dimensions.get("window");
export const H_PADDING = Spacing.base;
export const BANNER_HEIGHT = 182;
export const CARD_WIDTH = width - H_PADDING * 2;
export const GRID_GAP = 12;

export const homeHeaderStyles = {
  container: {
    flex: 1,
    backgroundColor: "#F8F9FE",
  },

  /* Fixed unified single header */
  fixedHeader: {
    paddingHorizontal: H_PADDING,
    paddingBottom: 18,
    position: "relative" as const,
    overflow: "hidden" as const,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#061D3D",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
      default: {},
    }),
  },

  /* Fixed sticky top bar (compat) */
  fixedTopBar: {
    paddingHorizontal: H_PADDING,
    paddingBottom: Spacing.sm,
    backgroundColor: "#061D3D",
  },

  /* Header (compat) */
  heroHeader: {
    paddingHorizontal: H_PADDING,
    paddingBottom: 18,
    position: "relative" as const,
    overflow: "hidden" as const,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerSvgBg: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topHeaderRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    zIndex: 2,
  },
  brandContainer: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
  },
  logoBox: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.sm,
    backgroundColor: BrandColors.WHITE,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      default: {},
    }),
  },
  logo: {
    width: 28,
    height: 28,
  },
  brandText: {
    color: BrandColors.WHITE,
    fontSize: Typography.fontSize.lg + 1,
    fontWeight: Typography.fontWeight.extraBold,
    letterSpacing: 1.2,
  },
  brandSubText: {
    color: "#B9CBE4",
    fontSize: Typography.fontSize.xs - 2,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 2,
    marginTop: 1,
  },
  headerIcons: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    zIndex: 2,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  badge: {
    position: "absolute" as const,
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backgroundColor: "#FF791B",
    borderWidth: 2,
    borderColor: "#082B59",
  },
  badgeText: {
    color: BrandColors.WHITE,
    fontSize: 10,
    fontWeight: Typography.fontWeight.extraBold,
  },

  greetingRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginTop: 14,
    zIndex: 2,
  },
  greetingContainer: {
    flex: 1,
  },
  welcomeText: {
    color: BrandColors.WHITE,
    fontSize: Typography.fontSize.xxl + 2,
    fontWeight: Typography.fontWeight.extraBold,
    letterSpacing: -0.3,
  },
  welcomeSubText: {
    color: "#CBD9EA",
    fontSize: Typography.fontSize.base,
    marginTop: 4,
    fontWeight: Typography.fontWeight.medium,
  },

  scrollGreetingContainer: {
    paddingHorizontal: H_PADDING,
    paddingBottom: Spacing.md,
    paddingTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },

  /* Plain Single Screen Scroll & Body */
  homeBodyContainer: {
    paddingHorizontal: H_PADDING,
    gap: 14,
  },
  bannerContainer: {
    paddingHorizontal: H_PADDING,
  },
  curvedCanvas: {
    width: "100%",
  },
  canvasSectionWrap: {
    paddingHorizontal: H_PADDING,
  },

  /* Scroll body */
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 24,
    gap: 16,
  },

  /* Banner Card */
  loansBanner: {
    width: "100%" as const,
    height: BANNER_HEIGHT,
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    overflow: "hidden" as const,
    position: "relative" as const,
    ...Platform.select({
      ios: {
        shadowColor: "#082B59",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.22,
        shadowRadius: 14,
      },
      android: {
        elevation: 5,
      },
      default: {},
    }),
  },
  bannerSvgBg: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bannerLeft: {
    flex: 1.35,
    justifyContent: "center" as const,
    zIndex: 2,
  },
  bannerBadgeWrap: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    borderRadius: 14,
    paddingHorizontal: 9,
    paddingVertical: 4,
    alignSelf: "flex-start" as const,
    marginBottom: 8,
  },
  bannerBadgeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#10B981",
    marginRight: 6,
  },
  bannerBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700" as const,
    letterSpacing: 0.2,
  },
  bannerTitle: {
    color: BrandColors.WHITE,
    fontSize: 27,
    fontWeight: "800" as const,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  bannerDesc: {
    color: "rgba(255, 255, 255, 0.88)",
    fontSize: 12,
    lineHeight: 16.5,
    fontWeight: "500" as const,
    marginBottom: 12,
  },
  exploreButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-start" as const,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      default: {},
    }),
  },
  exploreText: {
    color: "#082B59",
    fontWeight: "700" as const,
    fontSize: 13,
  },
  bannerRight: {
    flex: 0.95,
    alignItems: "flex-end" as const,
    justifyContent: "center" as const,
    zIndex: 2,
  },
  bannerImage3D: {
    width: 104,
    height: 104,
  },
  bannerPage: {
    width,
    paddingHorizontal: H_PADDING,
  },

  /* Carousel Dots */
  dotsRow: {
    flexDirection: "row" as const,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    gap: 6,
    marginTop: 12,
  },
  pageDot: {
    height: 6,
    borderRadius: 3,
  },
};

export const getFixedHeaderThemedStyle = (topInset: number) => ({
  paddingTop: topInset,
});

export const getFixedTopBarThemedStyle = (topInset: number) => ({
  paddingTop: topInset,
});

export const getHeroHeaderThemedStyle = (topInset: number) => ({
  paddingTop: topInset,
});

export const getScrollGreetingThemedStyle = (backgroundColor: string) => ({
  backgroundColor,
});

export const getPageDotThemedStyle = (isActive: boolean) => ({
  width: isActive ? 20 : 6,
  backgroundColor: isActive ? "#1455B8" : "#CBD5E1",
});

export const getBannerPageStyle = (width: number) => ({
  width,
});
