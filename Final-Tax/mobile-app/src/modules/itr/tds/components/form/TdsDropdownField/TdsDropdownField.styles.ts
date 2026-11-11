import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0B1F3A",
    letterSpacing: -0.1,
    marginBottom: 6,
  },
  requiredAsterisk: {
    color: "#DC2626",
    fontWeight: "700",
  },
  fieldWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.2,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
  },
  fieldWrapperError: {
    borderColor: "#DC2626",
    backgroundColor: "#FFFDFD",
  },
  valueText: {
    fontSize: 14.5,
    color: "#0B1F3A",
    fontWeight: "500",
    flex: 1,
    marginRight: 8,
  },
  placeholderText: {
    color: "#94A3B8",
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  errorIcon: {
    marginRight: 4,
  },
  errorText: {
    fontSize: 11.5,
    color: "#DC2626",
    fontWeight: "500",
  },
});
