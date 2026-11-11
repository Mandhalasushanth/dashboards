/** Accepts digits or correctly grouped Indian rupee digits; empty is allowed while editing. */
export const isValidWholeRupeeInput = (text: string): boolean =>
  text.length === 0 ||
  /^\d+$/.test(text) ||
  /^\d{1,2}(?:,\d{2})*,\d{3}$/.test(text);

/** Parses valid whole-rupee input without turning malformed text into an amount. */
export function parseWholeRupeeAmount(text: string): number | null {
  const raw = text.trim().replace(/^₹\s*/, "");
  if (!raw) return null;

  const isDigits = /^\d+$/.test(raw);
  const isIndianGrouped = /^\d{1,2}(?:,\d{2})*,\d{3}$/.test(raw);
  if (!isDigits && !isIndianGrouped) return null;

  const amount = Number(raw.replace(/,/g, ""));
  return Number.isSafeInteger(amount) ? amount : null;
}

/**
 * Normalizes money input text for storage in loan form state.
 *
 * Requirements:
 * - Empty / whitespace -> ""
 * - Standard Indian currency formatted whole-rupee values (e.g. "50,000", "₹50,000", "₹ 50,000", "1,00,000", "2,500")
 *   normalize to pure whole-rupee digits (e.g. "50000", "100000", "2500").
 * - Pure whole-rupee digits (e.g. "25000", "10000000") remain pure digits.
 * - Leading zeros are cleaned except for "0" itself.
 * - Invalid values (decimals "50,000.75", scientific notation "1e9", negative "-50000",
 *   special characters "50@000", "50#000", "50$000", "50%000", "50abc", embedded whitespace "50 000", "50\n000")
 *   are preserved without corruption so the validation layer can reject them with actionable errors.
 */
export const normalizeMoneyInput = (text: string): string => {
  const single = text.replace(/[\u0000-\u001F\u007F-\u009F]+/g, " ").trim();
  if (!single) return "";

  // Strip optional leading currency symbol if present
  const withoutSymbol = single.replace(/^₹\s*/, "").trim();

  // Pure digits: remove leading zeros (except single "0")
  if (/^\d+$/.test(withoutSymbol)) {
    return withoutSymbol.replace(/^0+(?=\d)/, "");
  }

  // Standard Indian comma grouping: "50,000", "1,00,000", "2,500", "10,00,000", "1,00,00,000"
  if (/^\d{1,2}(?:,\d{2})*,\d{3}$/.test(withoutSymbol)) {
    return withoutSymbol.replace(/,/g, "");
  }

  // Preserve invalid string so validation can inspect and reject it
  return withoutSymbol;
};
