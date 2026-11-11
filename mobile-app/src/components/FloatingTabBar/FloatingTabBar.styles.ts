import { StyleSheet, Platform } from "react-native";
import type { IconName } from "@/types/domain";

export const FLOATING_TAB_HEIGHT = 64;
export const FLOATING_TAB_GAP = 12;

export const BAR_BG = "#FFFFFF"; // Floating white rounded pill container
export const ACTIVE_PILL_BG = "#0B2B59"; // Deep-blue rounded capsule
export const ACTIVE_ICON_COLOR = "#FFFFFF"; // White active icon
export const ACTIVE_LABEL_COLOR = "#FFFFFF"; // White active label
export const INACTIVE_ICON_COLOR = "#1E3A5F"; // Navy-blue inactive icon
export const INACTIVE_LABEL_COLOR = "#334155"; // Navy-slate inactive label

export const HIDDEN_FROM_BAR = new Set(["gst", "documents"]);

export interface TabMeta {
  label: string;
  icon: IconName;
  iconOutline: IconName;
}

export const FALLBACK_META: TabMeta = {
  label: "Tab",
  icon: "ellipse",
  iconOutline: "ellipse-outline",
};

export const TAB_META: Record<string, TabMeta> = {
  home: { label: "Home", icon: "home", iconOutline: "home-outline" },
  applications: {
    label: "My Applications",
    icon: "grid",
    iconOutline: "grid-outline",
  },
  payments: { label: "Payment", icon: "card", iconOutline: "card-outline" },
  profile: { label: "Profile", icon: "person", iconOutline: "person-outline" },
};

export function metaFor(routeName: string): TabMeta {
  return (
    TAB_META[routeName] ??
    TAB_META[routeName.replace(/\/index$/, "")] ??
    TAB_META[routeName.split("/")[0]] ??
    FALLBACK_META
  );
}

export const SPRING = { damping: 18, stiffness: 200, mass: 0.6 };

export const styles = StyleSheet.create({
  navBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    elevation: 20,
  },
  backdropGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  floatingWrapper: {
    position: "absolute",
    left: 14,
    right: 14,
    alignItems: "center",
  },
  capsuleContainer: {
    width: "100%",
    height: FLOATING_TAB_HEIGHT,
    backgroundColor: BAR_BG,
    borderRadius: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 6,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.8)",
    ...Platform.select({
      ios: {
        shadowColor: "#0A192F",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
      default: {},
    }),
  },
  tabItem: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  activePill: {
    backgroundColor: ACTIVE_PILL_BG,
    width: "92%",
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
    ...Platform.select({
      ios: {
        shadowColor: "#0B2B59",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      default: {},
    }),
  },
  inactivePill: {
    width: "100%",
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
  },
  activeLabel: {
    fontSize: 9.5,
    fontWeight: "700",
    color: ACTIVE_LABEL_COLOR,
    marginTop: 2,
    textAlign: "center",
  },
  inactiveLabel: {
    fontSize: 9.5,
    fontWeight: "600",
    color: INACTIVE_LABEL_COLOR,
    marginTop: 2,
    textAlign: "center",
  },
});

export const getBackdropGradientThemedStyle = (height: number) => ({
  height,
});

export const getFloatingWrapperThemedStyle = (bottom: number) => ({
  bottom,
});
