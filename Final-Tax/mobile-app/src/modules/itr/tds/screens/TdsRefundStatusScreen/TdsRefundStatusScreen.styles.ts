import { StyleSheet, Platform, ViewStyle } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },
  scrollContent: {
    paddingBottom: 24,
  },
  bottomBar: {
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    ...Platform.select({
      ios: {
        shadowColor: "#0B1F3A",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
      default: {},
    }),
  },
});

export const getContainerInsetsStyle = (topInset: number): ViewStyle => ({
  paddingTop: 0, // Handled inside custom top header nav
});

export const getScrollContentInsetsStyle = (bottomInset: number): ViewStyle => ({
  paddingBottom: Math.max(bottomInset, 16) + 70,
});

export const getBottomBarInsetsStyle = (bottomInset: number): ViewStyle => ({
  paddingBottom: Math.max(bottomInset, 14),
});
