import { StyleSheet, ViewStyle } from "react-native";
import { SCREEN_BOTTOM_PADDING } from "../../../../shared/components/ScreenLayout/ScreenLayout";
import type { ThemeColors } from "../../../../constants/theme";

export const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: SCREEN_BOTTOM_PADDING,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  card: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },
  themeInfoText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  linkRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  switchLabelGroup: {
    flex: 1,
    paddingRight: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  subLabel: {
    fontSize: 12.5,
    lineHeight: 16,
  },
  appInfoContainer: {
    alignItems: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  appInfoText: {
    fontSize: 12,
    fontWeight: "500",
  },
  backendStatusText: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: "600",
  },
});

export const getCardThemedStyle = (colors: ThemeColors): ViewStyle => ({
  backgroundColor: colors.backgroundElement,
  borderColor: colors.border,
});

export const getLinkRowThemedStyle = (border: string): ViewStyle => ({
  borderTopColor: border,
});
