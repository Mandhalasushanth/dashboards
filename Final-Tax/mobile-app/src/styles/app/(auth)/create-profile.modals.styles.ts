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
  calendarModalContent: {
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
  monthYearNav: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: Spacing.base,
  },
  navArrow: {
    padding: 8,
  },
  monthYearDisplay: {
    flexDirection: "row" as const,
    gap: 8,
  },
  monthPickerBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#F1F5F9",
  },
  monthPickerText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: BrandColors.PRIMARY_BLUE_DARK,
  },
  yearPickerBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#F1F5F9",
  },
  yearPickerText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: BrandColors.PRIMARY_BLUE_DARK,
  },
  weekDaysRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    marginBottom: 8,
  },
  weekDayText: {
    width: 38,
    textAlign: "center" as const,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semiBold,
    color: BrandColors.TEXT_SECONDARY,
  },
  daysGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    justifyContent: "space-between" as const,
  },
  dayCell: {
    width: 38,
    height: 38,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginBottom: 6,
    borderRadius: 19,
  },
  dayCellSelected: {
    backgroundColor: BrandColors.PRIMARY_ORANGE,
  },
  dayCellToday: {
    borderWidth: 1,
    borderColor: BrandColors.PRIMARY_ORANGE,
  },
  dayText: {
    fontSize: Typography.fontSize.sm,
    color: BrandColors.TEXT_PRIMARY,
  },
  dayTextSelected: {
    color: BrandColors.WHITE,
    fontWeight: Typography.fontWeight.bold,
  },
  dayTextDisabled: {
    color: "#CBD5E1",
  },
  calendarFooter: {
    flexDirection: "row" as const,
    justifyContent: "flex-end" as const,
    gap: 12,
    marginTop: Spacing.base,
  },
  calendarCancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  calendarCancelText: {
    color: BrandColors.TEXT_SECONDARY,
    fontWeight: Typography.fontWeight.semiBold,
  },
  calendarConfirmBtn: {
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.sm,
  },
  calendarConfirmText: {
    color: BrandColors.WHITE,
    fontWeight: Typography.fontWeight.bold,
  },
  yearPickerScroll: {
    maxHeight: 240,
    width: "100%" as const,
  },
  yearOption: {
    paddingVertical: 10,
    alignItems: "center" as const,
    borderRadius: 8,
  },
  yearOptionSelected: {
    backgroundColor: "#FFF7ED",
  },
  yearText: {
    fontSize: Typography.fontSize.md,
    color: BrandColors.TEXT_PRIMARY,
  },
  yearTextSelected: {
    color: BrandColors.PRIMARY_ORANGE,
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
