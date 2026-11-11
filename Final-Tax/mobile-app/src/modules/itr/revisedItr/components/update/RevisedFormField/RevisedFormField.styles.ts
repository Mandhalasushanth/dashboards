import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0B1F3A",
  },
  star: {
    color: "#DC2626",
  },
  infoIconSpacing: {
    marginLeft: 6,
  },
  helperText: {
    fontSize: 11.5,
    color: "#64748B",
    marginBottom: 10,
    lineHeight: 16,
  },
  stackedBody: {
    gap: 8,
  },
  stackedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  fieldSubLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  originalValueText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#334155",
  },
  inputGroup: {
    marginTop: 2,
  },
  inputSubLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0B1F3A",
    marginBottom: 6,
  },
  input: {
    height: 48,
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#0B1F3A",
    fontWeight: "600",
  },
  errorInput: {
    borderColor: "#DC2626",
    backgroundColor: "#FEF2F2",
  },
  errorText: {
    fontSize: 11.5,
    color: "#DC2626",
    marginTop: 4,
    fontWeight: "500",
  },
});
