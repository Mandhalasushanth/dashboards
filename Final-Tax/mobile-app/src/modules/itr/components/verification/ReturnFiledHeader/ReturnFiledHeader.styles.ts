import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 10,
  },
  badgeWrapper: {
    width: 86,
    height: 86,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginRight: 10,
  },
  confettiSvg: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  outerCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#BBF7D0",
  },
  innerCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#16A34A",
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0B1F3A",
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 17,
    marginTop: 4,
    fontWeight: "400",
  },
});
