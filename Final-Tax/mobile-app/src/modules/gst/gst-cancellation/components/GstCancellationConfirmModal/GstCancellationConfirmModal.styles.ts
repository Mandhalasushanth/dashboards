/**
 * Component: GstCancellationConfirmModal
 * Migrated from internal StyleSheet to external styles module.
 * Uses shared design tokens from src/shared/theme.ts.
 */

import { StyleSheet, Platform } from "react-native";
import { BrandColors } from "@/shared/theme";

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    backgroundColor: BrandColors.WHITE,
    borderRadius: 22,
    padding: 24,
    alignItems: "center",
    width: "100%",
    maxWidth: 340,
    gap: 8,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FEF0E6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: BrandColors.TEXT_PRIMARY,
    textAlign: "center",
    marginBottom: 4,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  bodyText: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
  },
  boldText: {
    fontWeight: "700",
    color: BrandColors.TEXT_PRIMARY,
  },
  warningSubText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#D97706",
    textAlign: "center",
    marginVertical: 2,
  },
  btnStack: {
    width: "100%",
    gap: 10,
    marginTop: 14,
  },
  cancelBtn: {
    width: "100%",
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: BrandColors.WHITE,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748B",
  },
  confirmBtn: {
    width: "100%",
    height: 48,
    borderRadius: 24,
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: BrandColors.PRIMARY_ORANGE,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: BrandColors.WHITE,
  },
});
