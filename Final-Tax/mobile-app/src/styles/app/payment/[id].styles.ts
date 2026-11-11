/**
 * Screen: Payment / Checkout Screen
 * Extracted stylesheet module for src/app/payment/[id].tsx.
 * Uses shared design tokens from src/shared/theme.ts.
 */

import { StyleSheet } from "react-native";
import type { ThemeTokens } from "@/shared/constants/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  errorContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
  },
  errorText: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },

  /* Order summary */
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 14,
  },
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  serviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  serviceText: {
    flex: 1,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: "700",
  },
  serviceMeta: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 3,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 7,
  },
  summaryLabel: {
    fontSize: 13.5,
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 13.5,
    fontWeight: "700",
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginTop: 12,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "700",
  },
  totalValue: {
    fontSize: 19,
    fontWeight: "800",
  },

  /* Method picker */
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 22,
    marginBottom: 12,
  },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  methodText: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 14.5,
    fontWeight: "700",
  },
  methodSub: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },

  /* Method details */
  detailCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginTop: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 7,
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14.5,
    fontWeight: "500",
  },
  fieldRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
  },
  fieldHalf: {
    flex: 1,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: "600",
  },

  /* Net banking option row */
  bankOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  bankText: {
    fontSize: 14,
    fontWeight: "600",
  },

  /* Reassurance */
  secureNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    borderRadius: 12,
    padding: 13,
    marginTop: 18,
  },
  secureText: {
    flex: 1,
    fontSize: 11.5,
    fontWeight: "500",
    lineHeight: 17,
  },

  /* Pay bar */
  payBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
});

export type { ThemeTokens };

/** Dynamic styles for payment method card */
export const getMethodCardThemedStyle = (
  selected: boolean,
  colors: ThemeTokens
) => ({
  backgroundColor: selected ? "#EEF4FB" : String(colors.backgroundElement),
  borderColor: selected ? String(colors.primary) : String(colors.border),
  borderWidth: selected ? 1.6 : 1,
});

/** Dynamic styles for text input */
export const getInputThemedStyle = (colors: ThemeTokens) => ({
  color: String(colors.text),
  borderColor: String(colors.border),
  backgroundColor: String(colors.background),
});

/** Dynamic styles for detail card container */
export const getThemedCardStyle = (colors: ThemeTokens) => ({
  backgroundColor: String(colors.backgroundElement),
  borderColor: String(colors.border),
});

/** Dynamic styles for total row */
export const getTotalRowThemedStyle = (colors: ThemeTokens) => ({
  backgroundColor: "#E8EFF7",
  color: String(colors.primary),
});

/** Dynamic styles for UPI quick chips */
export const getUpiChipThemedStyle = (colors: ThemeTokens) => ({
  backgroundColor: String(colors.background),
  borderColor: String(colors.border),
  color: String(colors.primary),
});

/** Dynamic styles for sticky pay bar */
export const getPayBarThemedStyle = (colors: ThemeTokens, bottomInset: number) => ({
  backgroundColor: String(colors.backgroundElement),
  borderTopColor: String(colors.border),
  paddingBottom: bottomInset + 12,
});
