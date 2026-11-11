import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  headerBanner: {
    backgroundColor: "#4338CA",
    paddingHorizontal: 16,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleGroup: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "#E0E7FF",
    marginTop: 1,
  },
  rightPlaceholder: {
    width: 38,
  },
});

export const getContainerTopInsetStyle = (topInset: number) => ({
  paddingTop: Math.max(topInset, 10),
});

