import { StyleSheet, Platform } from "react-native";
import { BrandColors, Typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#0B1F3A",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
      default: {},
    }),
  },
  cardSelected: {
    borderColor: BrandColors.PRIMARY_ORANGE,
    backgroundColor: "#FFFBF7",
  },
  cardUnselected: {
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconBoxSelected: {
    backgroundColor: "#FFF7ED",
  },
  iconBoxUnselected: {
    backgroundColor: "#F0F5FA",
  },
  textGroup: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: "#0F172A",
  },
  subtitle: {
    fontSize: Typography.fontSize.xs,
    color: "#64748B",
    marginTop: 2.5,
    lineHeight: 16,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  radioOuterSelected: {
    borderColor: BrandColors.PRIMARY_ORANGE,
  },
  radioOuterUnselected: {
    borderColor: "#CBD5E1",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: BrandColors.PRIMARY_ORANGE,
  },
});
