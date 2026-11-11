/**
 * Component: ComplianceHeader
 * Migrated from internal StyleSheet to external styles module.
 * Uses shared design tokens from src/shared/theme.ts.
 */

import { StyleSheet } from "react-native";
import { BrandColors } from "@/shared/theme";

export const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E2E8F0",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  titleText: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  placeholderBox: {
    width: 38,
  },
  progressLineTrack: {
    height: 3,
    width: "100%",
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  progressLineBar: {
    height: "100%",
    width: "100%",
    backgroundColor: BrandColors.PRIMARY_ORANGE,
  },
  cardWrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  infoIconBox: {
    paddingTop: 1,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18.5,
    fontWeight: "500",
  },
});

export const getContainerStyle = (isDark: boolean, topInset: number) => ({
  backgroundColor: isDark ? "#0F172A" : BrandColors.WHITE,
  paddingTop: Math.max(topInset, 12),
});

export const getBackButtonThemeStyle = (isDark: boolean) => ({
  backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
});

export const getTitleThemeStyle = (isDark: boolean) => ({
  color: isDark ? "#F8FAFC" : "#0F172A",
});

export const getInfoCardThemeStyle = (isDark: boolean) => ({
  backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
  borderColor: isDark ? "#334155" : "#E2E8F0",
});

export const getInfoTextThemeStyle = (isDark: boolean) => ({
  color: isDark ? "#CBD5E1" : "#475569",
});
