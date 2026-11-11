import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  headerWrapper: {
    backgroundColor: "#FFFFFF",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  circleBackButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  titleText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0B1B36",
    textAlign: "center",
  },
  stepText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FF6500",
    marginTop: 2,
    textAlign: "center",
  },
  rightSpacer: {
    width: 36,
    height: 36,
  },
  progressTrack: {
    height: 3.5,
    backgroundColor: "#E2E8F0",
    borderRadius: 2,
    marginHorizontal: 16,
    marginTop: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FF6500",
    borderRadius: 2,
  },
});
