import { StyleSheet } from "react-native";
import { BrandColors, BorderRadius, Spacing, Typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(11, 31, 58, 0.45)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.xl,
    maxHeight: "88%",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  headerTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: "#083B75",
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.xs,
    color: "#64748B",
    marginBottom: Spacing.sm,
    lineHeight: 16,
  },
  formContainer: {
    paddingBottom: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.sm,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: "#334155",
  },
  mandatoryStar: {
    color: "#DC2626",
    marginLeft: 2,
    fontSize: Typography.fontSize.xs,
  },
  inputBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: Spacing.sm,
    height: 44,
    justifyContent: "center",
  },
  textInput: {
    fontSize: Typography.fontSize.xs,
    color: "#0F172A",
  },
  saveBankBtn: {
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    paddingVertical: 13,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.xs,
  },
  saveBankBtnText: {
    color: "#FFFFFF",
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  inputBoxError: {
    borderColor: "#DC2626",
  },
  ifscTextInput: {
    width: "100%",
  },
  errorText: {
    fontSize: Typography.fontSize.xs,
    color: "#DC2626",
    marginTop: 2,
  },
});
