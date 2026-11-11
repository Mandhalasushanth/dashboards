import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0B1F3A",
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  timelineList: {
    paddingLeft: 4,
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  indicatorColumn: {
    alignItems: "center",
    width: 32,
    marginRight: 10,
  },
  completedNode: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#EA580C",
    justifyContent: "center",
    alignItems: "center",
  },
  numberNode: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
  },
  activeNumberNode: {
    borderColor: "#EA580C",
    backgroundColor: "#FFFFFF",
  },
  upcomingNumberNode: {
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
  },
  numberNodeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  activeNumberText: {
    color: "#EA580C",
  },
  upcomingNumberText: {
    color: "#64748B",
  },
  verticalLine: {
    width: 2,
    height: 60,
    marginTop: 4,
  },
  orangeLine: {
    backgroundColor: "#EA580C",
  },
  greyLine: {
    backgroundColor: "#E2E8F0",
  },
  contentColumn: {
    flex: 1,
  },
  compactFirstStep: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 2,
  },
  firstStepNumberBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  firstStepNumberText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2563EB",
  },
  firstStepTextGroup: {
    flex: 1,
  },
  firstStepTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0B1F3A",
  },
  completedStatusText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#16A34A",
    marginTop: 1,
  },
  bubbleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#0B1F3A",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.02,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
      default: {},
    }),
  },
  cardTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0B1F3A",
  },
  cardStatus: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1.5,
    fontWeight: "500",
  },
  cardDescription: {
    fontSize: 11.5,
    color: "#475569",
    lineHeight: 16,
    marginTop: 4,
  },
});
