import { StyleSheet, Platform } from "react-native";
import { BrandColors } from "@/shared/theme";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  header: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#0B1F3A",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
      default: {},
    }),
  },
  titleGroup: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    left: 0,
    right: 0,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0B1F3A",
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "500",
    color: BrandColors.PRIMARY_ORANGE_DARK || "#C2410C",
    marginTop: 2,
  },
  rightSpacer: {
    width: 38,
    height: 38,
  },
  progressBarTrack: {
    height: 3,
    backgroundColor: "#E2E8F0",
    width: "100%",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: BrandColors.PRIMARY_ORANGE || "#F97316",
  },
});
