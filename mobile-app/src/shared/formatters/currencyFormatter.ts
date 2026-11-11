/**
 * Indian number / currency formatting (lakh-crore grouping: 42,58,088).
 *
 * Display strings only. API payloads must use raw numbers (or the raw numeric
 * strings produced by `toRawNumericString`), never these formatted values.
 *
 * Grouping is done in plain JS instead of `Intl`/`toLocaleString("en-IN")` so
 * the output is identical on every Android/iOS JS engine configuration.
 */

const RUPEE = "₹";

/** Groups an integer digit string the Indian way: "4258088" -> "42,58,088". */
export function groupIndianDigits(intDigits: string): string {
  const digits = intDigits.replace(/^0+(?=\d)/, "");
  if (digits.length <= 3) return digits;
  const lastThree = digits.slice(-3);
  const rest = digits.slice(0, -3);
  return `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",")},${lastThree}`;
}

const toNumber = (amount: number | string | null | undefined): number => {
  if (typeof amount === "number") return amount;
  if (amount == null) return NaN;
  const cleaned = String(amount).replace(/,/g, "").trim();
  return cleaned === "" ? NaN : parseFloat(cleaned);
};

/**
 * Formats a number with Indian grouping.
 * @param maxDecimals maximum fraction digits kept (trailing zeros removed).
 */
export function formatIndianNumber(
  amount: number | string | null | undefined,
  maxDecimals: number = 2
): string {
  const num = toNumber(amount);
  if (!Number.isFinite(num)) return "0";
  const negative = num < 0;
  const fixed = Math.abs(num).toFixed(Math.max(0, maxDecimals));
  const [intPart, fracPart = ""] = fixed.split(".");
  const trimmedFrac = fracPart.replace(/0+$/, "");
  const grouped = groupIndianDigits(intPart);
  const isZero = grouped === "0" && trimmedFrac === "";
  return `${negative && !isZero ? "-" : ""}${grouped}${trimmedFrac ? `.${trimmedFrac}` : ""}`;
}

/** "₹42,58,088" style currency display. Rounds to `maxDecimals` (default 0). */
export function formatIndianCurrency(
  amount: number | string | null | undefined,
  maxDecimals: number = 0
): string {
  const formatted = formatIndianNumber(amount, maxDecimals);
  return formatted.startsWith("-") ? `-${RUPEE}${formatted.slice(1)}` : `${RUPEE}${formatted}`;
}

/** Existing API: whole-rupee currency, e.g. 4258088 -> "₹42,58,088". */
export function formatCurrencyINR(amount: number | string): string {
  const num = toNumber(amount);
  if (!Number.isFinite(num)) return `${RUPEE}0`;
  return formatIndianCurrency(num, 0);
}

export const formatCurrency = formatCurrencyINR;

/** Existing API: plain number with Indian grouping (up to 3 decimals). */
export function formatNumberINR(amount: number | string): string {
  const num = toNumber(amount);
  if (!Number.isFinite(num)) return "0";
  return formatIndianNumber(num, 3);
}

// ─── Text-input helpers (display vs raw value) ──────────────────────────────

/**
 * Converts user-typed text into the raw numeric string stored in form state
 * and sent to the API: digits plus at most one decimal point, no commas.
 * "42,58,088" -> "4258088", "1,234.50" -> "1234.50".
 */
export function toRawNumericString(text: string | number | null | undefined, maxDecimals: number = 2): string {
  const value = String(text ?? "").replace(/[^\d.]/g, "");
  const firstDot = value.indexOf(".");
  if (firstDot === -1) return value;
  if (maxDecimals <= 0) return value.slice(0, firstDot);
  const intPart = value.slice(0, firstDot);
  const fracPart = value.slice(firstDot + 1).replace(/\./g, "").slice(0, maxDecimals);
  return `${intPart}.${fracPart}`;
}

/**
 * Formats a raw numeric string for display inside a TextInput while typing.
 * Keeps what the user typed after the decimal point (including a trailing
 * "."), so editing is never disrupted: "4258088" -> "42,58,088".
 */
export function formatIndianNumberInput(text: string | number | null | undefined, maxDecimals: number = 2): string {
  const raw = toRawNumericString(text, maxDecimals);
  if (raw === "") return "";
  const [intPart, fracPart] = raw.split(".");
  const groupedInt = intPart === "" ? "0" : groupIndianDigits(intPart);
  return fracPart !== undefined ? `${groupedInt}.${fracPart}` : groupedInt;
}

/** Parses formatted or raw text into a number (NaN when empty/invalid). */
export function parseIndianNumber(text: string | number | null | undefined): number {
  if (typeof text === "number") return text;
  const raw = toRawNumericString(text, 20);
  return raw === "" || raw === "." ? NaN : parseFloat(raw);
}


/**
 * Formats a raw integer or decimal number string into Indian comma grouping (lakh-crore grouping):
 * 1000 -> "1,000"
 * 100000 -> "1,00,000"
 * 10000000 -> "1,00,00,000"
 * -50000 -> "-50,000"
 * Empty / null / undefined -> ""
 */
export function formatIndianAmount(
  value: string | number | null | undefined,
  allowDecimals: boolean = false
): string {
  if (value === undefined || value === null) return "";
  const str = String(value).replace(/,/g, "").trim();
  if (str === "") return "";

  const isNegative = str.startsWith("-");
  const unsigned = isNegative ? str.slice(1) : str;

  if (allowDecimals && unsigned.includes(".")) {
    const [intPart, fracPart] = unsigned.split(".");
    const cleanInt = intPart.replace(/[^0-9]/g, "");
    const grouped = cleanInt === "" ? "0" : groupIndianDigits(cleanInt);
    const cleanFrac = fracPart.replace(/[^0-9]/g, "");
    const result = `${grouped}.${cleanFrac}`;
    return isNegative ? `-${result}` : result;
  }

  // Integer-only: strip currency prefix and any decimal point + fractional portion
  const noPrefix = unsigned.replace(/(?:rs|inr)\.?\s*/gi, "");
  const intString = noPrefix.includes(".") ? noPrefix.split(".")[0] : noPrefix;
  const cleanDigits = intString.replace(/[^0-9]/g, "");
  if (!cleanDigits) return isNegative ? "-" : "";
  const grouped = groupIndianDigits(cleanDigits);
  return isNegative ? `-${grouped}` : grouped;
}

/**
 * Parses user input (which may contain Indian commas, spaces, currency symbols)
 * into a clean, unformatted raw numeric string for state storage and API submission.
 * "1,000" -> "1000"
 * "1,00,000" -> "100000"
 * "1,00,00,000" -> "10000000"
 * "₹ 1,00,000" -> "100000"
 * "-50,000" -> "-50000" (if allowNegative is true)
 * "100.50" -> "100" (if allowDecimals is false, strips '.' and fraction)
 * "100.50" -> "100.50" (if allowDecimals is true)
 * Empty / null / undefined -> ""
 */
export function parseIndianAmount(
  value: string | number | null | undefined,
  allowDecimals: boolean = false,
  allowNegative: boolean = false
): string {
  if (value === undefined || value === null) return "";
  let clean = String(value).replace(/,/g, "").trim();
  if (clean === "") return "";

  const isNegative = allowNegative && clean.startsWith("-");
  if (isNegative) {
    clean = clean.slice(1);
  }

  if (allowDecimals) {
    clean = clean.replace(/[^0-9.]/g, "");
    const parts = clean.split(".");
    if (parts.length > 2) {
      clean = parts[0] + "." + parts.slice(1).join("");
    }
  } else {
    // Integer-only: reject decimal point and any fractional portion during typing and pasting.
    // Strip common currency abbreviations (e.g. "Rs.") first so abbreviation dots are not confused with decimals.
    clean = clean.replace(/(?:rs|inr)\.?\s*/gi, "");
    const dotIndex = clean.indexOf(".");
    if (dotIndex !== -1) {
      clean = clean.slice(0, dotIndex);
    }
    clean = clean.replace(/[^0-9]/g, "");
  }

  if (!clean) return isNegative ? "-" : "";
  clean = clean.replace(/^0+(?=\d)/, "");
  return isNegative ? `-${clean}` : clean;
}

/**
 * Computes where the cursor is positioned inside `cleanText` immediately after a user edit,
 * given the previous formatted text and the previous cursor position in that text.
 */
export function computeCursorInCleanText(
  oldFormatted: string,
  cleanText: string,
  oldCursor: number
): number {
  const oldLen = oldFormatted.length;
  const newLen = cleanText.length;

  if (newLen === 0) return 0;
  if (oldLen === 0) return newLen;

  // Typing or pasting at the end of the previous text
  if (oldCursor >= oldLen && cleanText.startsWith(oldFormatted)) {
    return newLen;
  }

  // Find longest common prefix
  let prefixLen = 0;
  while (
    prefixLen < oldLen &&
    prefixLen < newLen &&
    oldFormatted[prefixLen] === cleanText[prefixLen]
  ) {
    prefixLen++;
  }

  // Find longest common suffix that does not overlap with prefix
  let suffixLen = 0;
  while (
    suffixLen < oldLen - prefixLen &&
    suffixLen < newLen - prefixLen &&
    oldFormatted[oldLen - 1 - suffixLen] === cleanText[newLen - 1 - suffixLen]
  ) {
    suffixLen++;
  }

  const delta = newLen - oldLen;

  if (delta > 0) {
    // Characters inserted / pasted
    if (prefixLen === oldLen) {
      return newLen;
    }
    if (oldCursor >= prefixLen && oldCursor <= oldLen - suffixLen) {
      return oldCursor + delta;
    }
    return newLen - suffixLen;
  } else if (delta < 0) {
    // Characters deleted
    const deleted = oldLen - newLen;
    if (prefixLen === newLen) {
      return newLen;
    }
    if (oldCursor > prefixLen && oldCursor <= oldLen - suffixLen) {
      return Math.max(prefixLen, oldCursor - deleted);
    }
    return prefixLen;
  }

  // Same-length replacement
  return Math.min(newLen, Math.max(prefixLen, oldCursor));
}

/**
 * Calculates new cursor position after formatting to preserve cursor location.
 */
export function calculateIndianAmountCursor(
  oldFormatted: string,
  newText: string,
  newFormatted: string,
  cursorPosition: number
): number {
  if (cursorPosition <= 0) return 0;
  if (cursorPosition >= newText.length) return newFormatted.length;

  let effectiveNewText = newText;
  let effectiveCursor = cursorPosition;

  // Handle case where user pressed backspace on a comma: delete the preceding digit
  if (
    oldFormatted.length === newText.length + 1 &&
    cursorPosition >= 0 &&
    oldFormatted[cursorPosition] === ","
  ) {
    if (cursorPosition > 0) {
      effectiveNewText = newText.slice(0, cursorPosition - 1) + newText.slice(cursorPosition);
      effectiveCursor = cursorPosition - 1;
    }
  }

  // Count non-comma characters before effectiveCursor
  let rawChars = 0;
  for (let i = 0; i < effectiveCursor && i < effectiveNewText.length; i++) {
    if (effectiveNewText[i] !== ",") {
      rawChars++;
    }
  }

  if (rawChars === 0) return 0;

  // Locate the index in newFormatted where exactly rawChars non-comma characters exist
  let count = 0;
  for (let i = 0; i < newFormatted.length; i++) {
    if (newFormatted[i] !== ",") {
      count++;
      if (count === rawChars) {
        if (i + 1 < newFormatted.length && newFormatted[i + 1] === ",") {
          return i + 2;
        }
        return i + 1;
      }
    }
  }

  return newFormatted.length;
}

/**
 * Maps a cursor index in an Indian-formatted currency string (with commas)
 * to the corresponding index in the clean unformatted numeric string.
 * Example: in "1,25,000", cursor at 3 (after '2') maps to 2 in "125000".
 */
export function mapFormattedToRawCursor(formattedText: string, formattedCursor: number): number {
  if (formattedCursor <= 0 || !formattedText) return 0;
  let rawChars = 0;
  for (let i = 0; i < formattedCursor && i < formattedText.length; i++) {
    if (formattedText[i] !== ",") {
      rawChars++;
    }
  }
  return rawChars;
}

/**
 * Maps a cursor index in a raw numeric string to the corresponding index in an
 * Indian-formatted currency string (with commas).
 * Example: in "125000", cursor at 2 maps to 3 in "1,25,000".
 */
export function mapRawToFormattedCursor(rawText: string, rawCursor: number): number {
  if (rawCursor <= 0 || !rawText) return 0;
  const formatted = formatIndianAmount(rawText);
  let rawCount = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (formatted[i] !== ",") {
      rawCount++;
      if (rawCount === rawCursor) {
        return i + 1;
      }
    }
  }
  return formatted.length;
}
