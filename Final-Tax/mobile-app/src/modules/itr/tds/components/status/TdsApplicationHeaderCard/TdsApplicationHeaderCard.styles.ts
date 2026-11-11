import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    marginHorizontal: 16,
    marginTop: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#0B1F3A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
      default: {},
    }),
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  idGroup: {
    flex: 1,
  },
  idLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  idValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.3,
    marginTop: 4,
  },
  badgePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "#EDE9FE",
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#7C3AED",
    marginRight: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#7C3AED",
  },
  detailsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  detailCol: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748B",
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  progressSection: {
    marginTop: 16,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#059669",
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748B",
    textAlign: "right",
    marginTop: 8,
  },
});

export const getBadgeBgStyle = (bgColor: string) => ({
  backgroundColor: bgColor,
});

export const getBadgeDotStyle = (dotColor: string) => ({
  backgroundColor: dotColor,
});

export const getBadgeTextStyle = (textColor: string) => ({
  color: textColor,
});

export const getProgressFillStyle = (percent: number) => ({
  width: `${percent}%` as const,
});


