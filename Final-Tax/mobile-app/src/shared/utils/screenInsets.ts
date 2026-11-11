import { ViewStyle } from "react-native";
 
/**
 * Common safe-area insets style helpers for screens.
 */
 
/**
 * Applies top safe-area padding to the container view.
 */
export const getContainerInsetsStyle = (topInset: number): ViewStyle => ({
  paddingTop: topInset,
});
 
/**
 * Applies bottom safe-area padding for scrollable content with standard bottom offset.
 */
export const getScrollContentInsetsStyle = (bottomInset: number): ViewStyle => ({
  paddingBottom: bottomInset + 90,
});
 
/**
 * Applies bottom safe-area padding to bottom action bars ensuring minimum padding.
 */
export const getBottomBarInsetsStyle = (bottomInset: number): ViewStyle => ({
  paddingBottom: Math.max(bottomInset, 12),
});
 
 