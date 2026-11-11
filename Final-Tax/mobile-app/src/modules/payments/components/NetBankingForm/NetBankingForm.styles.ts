import { StyleSheet } from "react-native";
import { BrandColors } from "@/shared/theme";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EEF2F6",
    gap: 10,
  },
  heading: {
    fontSize: 13.5,
    fontWeight: "700",
    color: BrandColors.TEXT_PRIMARY,
  },
  subHeading: {
    fontSize: 12,
    color: "#64748B",
    marginTop: -4,
  },
  bankGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  bankPill: {
    width: "48.5%",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bankPillActive: {
    borderColor: BrandColors.PRIMARY_ORANGE,
    backgroundColor: "#FEF0E6",
  },
  bankName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
    flex: 1,
  },
  bankNameActive: {
    color: BrandColors.PRIMARY_ORANGE,
    fontWeight: "700",
  },
  fieldGroup: {
    gap: 4,
    marginTop: 4,
  },
  label: {
    fontSize: 12.5,
    fontWeight: "600",
    color: BrandColors.TEXT_PRIMARY,
  },
  input: {
    height: 48,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    fontSize: 14,
    color: BrandColors.TEXT_PRIMARY,
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  errorText: {
    fontSize: 11.5,
    color: "#DC2626",
    marginTop: 2,
    fontWeight: "500",
  },
});
