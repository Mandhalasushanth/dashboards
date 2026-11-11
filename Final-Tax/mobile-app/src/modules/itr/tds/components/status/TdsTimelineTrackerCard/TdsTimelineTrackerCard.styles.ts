import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
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
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  indicatorColumn: {
    alignItems: "center",
    width: 32,
    marginRight: 14,
  },
  circleBase: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  circleCompleted: {
    backgroundColor: "#059669",
  },
  circleActive: {
    backgroundColor: "#059669",
  },
  circlePending: {
    backgroundColor: "#E2E8F0",
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: "700",
  },
  stepNumberActive: {
    color: "#FFFFFF",
  },
  stepNumberPending: {
    color: "#94A3B8",
  },
  connectingLine: {
    width: 2,
    minHeight: 28,
    marginVertical: 4,
  },
  connectingLineCompleted: {
    backgroundColor: "#059669",
  },
  connectingLinePending: {
    backgroundColor: "#E2E8F0",
  },
  contentColumn: {
    flex: 1,
    paddingTop: 3,
    paddingBottom: 22,
  },
  contentColumnLast: {
    paddingBottom: 4,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.1,
  },
  stepTitleCompleted: {
    color: "#0F172A",
  },
  stepTitleActive: {
    color: "#0F172A",
  },
  stepTitlePending: {
    color: "#94A3B8",
  },
  stepSubtitle: {
    fontSize: 12,
    fontWeight: "400",
    marginTop: 3,
    lineHeight: 16,
  },
  stepSubtitleCompleted: {
    color: "#64748B",
  },
  stepSubtitleActive: {
    color: "#64748B",
  },
  stepSubtitlePending: {
    color: "#94A3B8",
  },
});
