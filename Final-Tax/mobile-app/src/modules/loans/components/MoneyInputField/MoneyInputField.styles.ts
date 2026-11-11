import { StyleSheet } from "react-native";
import { BrandColors, Spacing, Typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.fontSize.xs + 1,
    fontWeight: "600",
    color: BrandColors.TEXT_PRIMARY,
    marginBottom: 6,
  },
  requiredStar: {
    color: "#EF4444",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 48,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  rowError: {
    borderColor: "#DC2626",
    backgroundColor: "#FEF2F2",
  },
  prefix: {
    fontSize: Typography.fontSize.md,
    fontWeight: "700",
    color: BrandColors.PRIMARY_BLUE,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSize.sm + 1,
    fontWeight: "600",
    color: BrandColors.TEXT_PRIMARY,
    paddingVertical: 0,
  },
  errorText: {
    fontSize: Typography.fontSize.xs,
    color: "#DC2626",
    marginTop: 4,
    marginLeft: 2,
  },
});
