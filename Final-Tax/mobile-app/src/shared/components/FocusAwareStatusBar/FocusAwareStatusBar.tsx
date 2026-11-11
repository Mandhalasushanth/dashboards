import React from "react";
import { StatusBar, type StatusBarProps } from "react-native";
import { useIsFocused } from "expo-router";

/**
 * Global status-bar policy for Finsolz.
 *
 * React Native keeps a stack of every mounted <StatusBar>, and the most
 * recently mounted entry wins. Screens underneath the current one (tab
 * screens, earlier stack screens) stay mounted, so a plain <StatusBar> on
 * Home ("light-content") used to leak onto white inner screens and made the
 * status-bar icons invisible (white on white).
 *
 * Rules:
 * 1. <RootStatusBar /> is rendered once in the root layout. It sets the
 *    app-wide default: dark icons, which suit the light Finsolz screens.
 * 2. Screens or headers that need a different style (dark headers) render
 *    <FocusAwareStatusBar />. It only exists in the stack while its screen is
 *    focused, so it can never leak onto another screen.
 *
 * On Android the app is edge-to-edge, so the bar is always drawn over the
 * app content; only the icon style is applied (background colour and
 * translucency are ignored by the OS). Screens keep using safe-area insets.
 */
export const DEFAULT_STATUS_BAR_STYLE: NonNullable<StatusBarProps["barStyle"]> =
  "dark-content";

export function RootStatusBar() {
  return <StatusBar barStyle={DEFAULT_STATUS_BAR_STYLE} hidden={false} />;
}

export interface FocusAwareStatusBarProps extends StatusBarProps {
  backgroundColor?: string;
  translucent?: boolean;
}

export function FocusAwareStatusBar(props: FocusAwareStatusBarProps) {
  const isFocused = useIsFocused();
  return isFocused ? <StatusBar {...props} /> : null;
}

export default FocusAwareStatusBar;
