import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
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
  leftGroup: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    marginRight: 8,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0F5FA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    marginTop: 2,
  },
  textGroup: {
    flex: 1,
  },
  title: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0B1F3A",
  },
  subtitle: {
    fontSize: 10.5,
    color: "#64748B",
    marginTop: 2,
    lineHeight: 14,
  },
  buttonsColumn: {
    gap: 6,
  },
  executiveButton: {
    height: 32,
    backgroundColor: "#F97316",
    borderRadius: 8,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  executiveText: {
    color: "#FFFFFF",
    fontSize: 11.5,
    fontWeight: "700",
  },
  supportButton: {
    height: 32,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.2,
    borderColor: "#F97316",
    borderRadius: 8,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  supportText: {
    color: "#F97316",
    fontSize: 11.5,
    fontWeight: "700",
  },
});
