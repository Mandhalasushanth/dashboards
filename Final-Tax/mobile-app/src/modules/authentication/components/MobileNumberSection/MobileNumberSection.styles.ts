import { StyleSheet } from "react-native";
import { BrandColors, BorderRadius, Typography, Spacing } from "../../../../shared/theme";

export const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
  },
  changeNumberBtn: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  changeNumberText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: BrandColors.PRIMARY_BLUE,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "100%",
  },
  disabledField: {
    opacity: 0.85,
  },
  codeBox: {
    height: 50,
    width: 58,
    borderWidth: 1.5,
    borderRadius: BorderRadius.sm + 2,
    justifyContent: "center",
    alignItems: "center",
  },
  codeText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1.5,
    borderRadius: BorderRadius.sm + 2,
    paddingHorizontal: Spacing.base - 2,
    fontSize: Typography.fontSize.md,
  },
  error: {
    fontSize: Typography.fontSize.sm + 0.5,
    marginTop: 6,
    fontWeight: Typography.fontWeight.semiBold,
  },
  continueBtn: {
    marginTop: 18,
    height: 50,
  },
});

export const getThemedStyles = (
  colors: {
    text: string;
    textSecondary: string;
    backgroundElement: string;
    border: string;
    error: string;
  },
  isFocused: boolean,
  isReadOnly: boolean,
  error?: string | null
) => ({
  label: {
    color: colors.text,
  },
  codeBox: {
    borderColor: isFocused && !isReadOnly ? BrandColors.PRIMARY_BLUE : colors.border,
    backgroundColor: colors.backgroundElement,
  },
  codeText: {
    color: isReadOnly ? colors.textSecondary : colors.text,
  },
  input: {
    color: isReadOnly ? colors.textSecondary : colors.text,
    backgroundColor: colors.backgroundElement,
    borderColor: error
      ? colors.error
      : isFocused && !isReadOnly
      ? BrandColors.PRIMARY_BLUE
      : colors.border,
  },
  error: {
    color: colors.error,
  },
});
