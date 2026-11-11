/**
 * Component: RequestTypeSection
 * Migrated from internal StyleSheet to external styles module.
 * Uses shared design tokens from src/shared/theme.ts.
 */

import { StyleSheet } from "react-native";
import { BrandColors } from "@/shared/theme";

export const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 8,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1.2,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 14,
    marginBottom: 16,
  },
  cardLight: {
    backgroundColor: BrandColors.WHITE,
    borderColor: "#E2E8F0",
  },
  cardDark: {
    backgroundColor: "#1E293B",
    borderColor: "#334155",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  sectionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#FFF7ED",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionIconBoxDark: {
    backgroundColor: "#7C2D12",
  },
  sectionTitleWrap: {
    flex: 1,
  },
  sectionMainTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
    color: "#0F172A",
  },
  sectionMainTitleDark: {
    color: "#F8FAFC",
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 1,
  },
  sectionSubtitleDark: {
    color: "#94A3B8",
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  optionalTag: {
    fontSize: 12,
    fontWeight: "400",
  },
  star: {
    color: "#EF4444",
  },
  textInput: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1.2,
    paddingHorizontal: 14,
    fontSize: 14.5,
  },
  textAreaInput: {
    minHeight: 84,
    borderRadius: 12,
    borderWidth: 1.2,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14.5,
  },
  errorText: {
    fontSize: 12,
    color: "#DC2626",
    marginTop: 6,
    fontWeight: "500",
  },
});

export const getSectionHeaderColor = (isDark: boolean) => ({
  color: isDark ? "#F8FAFC" : "#0F172A",
});
