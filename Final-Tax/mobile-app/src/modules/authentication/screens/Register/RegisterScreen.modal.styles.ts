/** Create Profile / Register: picker modal and option styles. */

import { Platform } from "react-native";
import {
  BrandColors,
  BorderRadius,
  Spacing,
  Typography,
} from "@/shared/theme";

export const modalStyles = {
  customerTypeOption: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.sm + 2,
    marginBottom: 4,
  },
  customerTypeOptionSelected: {
    backgroundColor: "#FFF7ED",
  },
  customerTypeOptionLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  customerTypeOptionText: {
    fontSize: Typography.fontSize.md,
    color: "#334155",
    fontWeight: Typography.fontWeight.medium,
  },
  customerTypeOptionTextSelected: {
    color: BrandColors.PRIMARY_ORANGE,
    fontWeight: Typography.fontWeight.bold,
  },
  selectedBadge: {
    backgroundColor: "#FFEDD5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  selectedBadgeText: {
    fontSize: Typography.fontSize.xs,
    color: BrandColors.PRIMARY_ORANGE_DARK,
    fontWeight: Typography.fontWeight.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingHorizontal: Spacing.lg,
  },
  customerTypeModalContent: {
    width: "100%" as const,
    maxWidth: 360,
    backgroundColor: BrandColors.WHITE,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
      default: {},
    }),
  },
  calendarHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: Spacing.base,
  },
  calendarTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  stateModalContent: {
    width: "100%" as const,
    maxWidth: 380,
    height: "78%" as const,
    backgroundColor: BrandColors.WHITE,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
      default: {},
    }),
  },
  stateSearchBox: {
    height: 44,
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  stateSearchInput: {
    flex: 1,
    fontSize: 14,
    color: BrandColors.TEXT_PRIMARY,
    marginLeft: 8,
  },
  stateItem: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F8FAFC",
    borderRadius: 8,
  },
  stateItemSelected: {
    backgroundColor: "#FFF7ED",
  },
  stateItemText: {
    fontSize: 14.5,
    color: BrandColors.TEXT_PRIMARY,
  },
  stateItemTextSelected: {
    color: BrandColors.PRIMARY_ORANGE,
    fontWeight: Typography.fontWeight.bold,
  },
  genderModalContent: {
    width: "100%" as const,
    maxWidth: 340,
    backgroundColor: BrandColors.WHITE,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
      default: {},
    }),
  },
  genderOption: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    borderRadius: 8,
  },
  genderOptionSelected: {
    backgroundColor: "#FFF7ED",
  },
  genderOptionText: {
    fontSize: 15,
    color: BrandColors.TEXT_PRIMARY,
  },
  genderOptionTextSelected: {
    color: BrandColors.PRIMARY_ORANGE,
    fontWeight: Typography.fontWeight.bold,
  },
};
