import { StyleSheet, Platform, Animated } from "react-native";

export const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
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
  selectedCard: {
    backgroundColor: "#FFFBF7",
    borderWidth: 1.5,
    borderColor: "#F97316",
    ...Platform.select({
      ios: {
        shadowColor: "#F97316",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 5,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  eligibleCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  disabledCard: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    opacity: 0.85,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  selectedIconBox: {
    backgroundColor: "#FFF7ED",
  },
  eligibleIconBox: {
    backgroundColor: "#F0F5FA",
  },
  disabledIconBox: {
    backgroundColor: "#F1F5F9",
  },
  textGroup: {
    flex: 1,
    marginRight: 8,
  },
  yearTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0B1F3A",
    letterSpacing: -0.2,
  },
  disabledYearTitle: {
    color: "#64748B",
  },
  subtitle: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 2.5,
    lineHeight: 15.5,
    fontWeight: "400",
  },
  disabledSubtitle: {
    color: "#94A3B8",
  },
  rightGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkmarkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#EA580C",
    justifyContent: "center",
    alignItems: "center",
  },
});

export const getScaleTransformStyle = (scaleAnim: Animated.Value): any => ({
  transform: [{ scale: scaleAnim }],
});
