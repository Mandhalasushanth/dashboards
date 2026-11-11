import { StyleSheet } from "react-native";
import { BrandColors } from "../../theme";

export const styles = StyleSheet.create({
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },
  requiredStar: {
    color: "#EF4444",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#0F172A",
    backgroundColor: "#FFFFFF",
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  radioRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 4,
  },
  radioChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#F8FAFC",
  },
  radioChipActive: {
    borderColor: "#FF6500",
    backgroundColor: "#FFF7ED",
  },
  radioText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#475569",
  },
  radioTextActive: {
    fontWeight: "700",
    color: "#FF6500",
  },
});
