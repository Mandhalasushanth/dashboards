import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  label: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0B1F3A",
    letterSpacing: -0.1,
  },
  requiredAsterisk: {
    color: "#DC2626",
    fontWeight: "700",
  },
  countText: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "500",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.2,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  inputWrapperFocused: {
    borderColor: "#083B75",
    backgroundColor: "#FFFFFF",
  },
  inputWrapperError: {
    borderColor: "#DC2626",
    backgroundColor: "#FFFDFD",
  },
  currencyBox: {
    paddingRight: 8,
    marginRight: 6,
    borderRightWidth: 1,
    borderRightColor: "#E2E8F0",
  },
  currencyText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0B1F3A",
  },
  input: {
    flex: 1,
    fontSize: 14.5,
    color: "#0B1F3A",
    fontWeight: "500",
    padding: 0,
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
