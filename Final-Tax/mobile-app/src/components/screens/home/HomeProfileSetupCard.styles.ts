import { StyleSheet, Platform, type ViewStyle } from "react-native";
import { BrandColors, Spacing, BorderRadius, Typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#FFFBF8",
    borderRadius: BorderRadius.lg,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginHorizontal: Spacing.base,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: "#FCE7D8",
    flexDirection: "row",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#0B1F3A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FEF0E6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  contentColumn: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  cardTitle: {
    fontSize: Typography.fontSize.sm + 1,
    fontWeight: Typography.fontWeight.bold,
    color: "#0B1F3A",
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: Typography.fontSize.xs,
    color: "#64748B",
    marginBottom: 6,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressTrack: {
    flex: 1,
    height: 5,
    backgroundColor: "#F1F5F9",
    borderRadius: 3,
    overflow: "hidden",
    marginRight: Spacing.xs + 2,
  },
  progressFill: {
    height: "100%",
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    borderRadius: 3,
  },
  progressPercent: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: "#0B1F3A",
  },
  completeBtn: {
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    paddingVertical: 7,
    paddingHorizontal: Spacing.md,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  completeBtnText: {
    color: "#FFFFFF",
    fontSize: Typography.fontSize.xs + 1,
    fontWeight: Typography.fontWeight.bold,
  },
});

export const getProgressFillThemedStyle = (percentage: number): ViewStyle => ({
  width: `${Math.min(Math.max(percentage, 0), 100)}%`,
});
