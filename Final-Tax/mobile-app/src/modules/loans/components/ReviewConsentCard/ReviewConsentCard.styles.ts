import { StyleSheet } from "react-native";
import { BrandColors } from "@/shared/theme";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    marginBottom: 20,
    shadowColor: "#083B75",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  consentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#94A3B8",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    backgroundColor: "#FFFFFF",
  },
  checkboxChecked: {
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    borderColor: BrandColors.PRIMARY_ORANGE,
  },
  consentTextWrapper: {
    flex: 1,
  },
  consentTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: BrandColors.PRIMARY_BLUE,
    marginBottom: 4,
  },
  consentText: {
    fontSize: 13,
    color: "#334155",
    lineHeight: 18,
  },
  trustBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  trustText: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
  },
  errorText: {
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "500",
    marginTop: 8,
  },
});
