import { StyleSheet, Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
export const TOOLTIP_WIDTH = Math.min(300, SCREEN_WIDTH - 32);

export const styles = StyleSheet.create({
  container: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  iconButton: {
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    position: "absolute",
    top: -2000,
    left: -2000,
    width: 5000,
    height: 5000,
    zIndex: 9998,
    backgroundColor: "transparent",
  },
  tooltipBubble: {
    position: "absolute",
    backgroundColor: "#0F172A",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: "#334155",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
    zIndex: 9999,
  },
  arrowUp: {
    position: "absolute",
    top: -7,
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderBottomWidth: 7,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#0F172A",
    zIndex: 10001,
  },
  arrowDown: {
    position: "absolute",
    bottom: -7,
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 7,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#0F172A",
    zIndex: 10001,
  },
  tooltipHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
    gap: 6,
  },
  tooltipHeaderIcon: {
    marginRight: 2,
  },
  tooltipTitle: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: "700",
    color: "#F8FAFC",
    letterSpacing: 0.2,
  },
  closeBtn: {
    padding: 2,
  },
  tooltipText: {
    fontSize: 12,
    lineHeight: 17,
    color: "#E2E8F0",
    fontWeight: "400",
  },
});
