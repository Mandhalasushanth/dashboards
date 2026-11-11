/**
 * HSN / SAC Classification and Validation Policy
 *
 * In the Indian GST framework:
 * - SAC (Services Accounting Code): Used for services, standardly begins with "99" and must be exactly 6 digits.
 * - HSN (Harmonized System of Nomenclature): Used for goods (valid lengths: 4, 6, or 8 digits).
 * - All-zero codes (e.g. 0000, 000000, 00000000) are strictly rejected.
 * - Invalid lengths (such as 5 or 7 digits) are strictly rejected.
 */

export interface HsnSacClassification {
  isValid: boolean;
  type: "SAC" | "HSN" | "UNKNOWN";
  label: string;
  description?: string;
}

export const hsnSacPolicy = {
  /**
   * Validates HSN or SAC code against strict Indian GST rules.
   * - Required: non-empty.
   * - Digits only.
   * - Rejects all-zero codes (e.g. 0000, 000000, 00000000).
   * - SAC (starts with 99): must be exactly 6 digits.
   * - HSN (goods, does not start with 99): must be 4, 6, or 8 digits (rejects 5 and 7 digits).
   */
  validateCode: (code?: string | null): string => {
    const raw = code !== null && code !== undefined ? String(code) : "";
    const clean = raw.trim();
    if (!clean) return "HSN/SAC code is required";
    if (/[^0-9]/.test(clean)) return "HSN/SAC code must contain digits only";
    if (/^0+$/.test(clean)) return "HSN/SAC code cannot be all zeros";

    if (clean.startsWith("99")) {
      if (clean.length !== 6) return "SAC code must be exactly 6 digits";
      return "";
    }

    if (clean.length !== 4 && clean.length !== 6 && clean.length !== 8) {
      return "HSN code must be 4, 6, or 8 digits";
    }
    return "";
  },

  /**
   * Classifies a given code as SAC (Services) or HSN (Goods).
   * @param code The HSN/SAC code to classify
   * @returns Classification object containing validity, type, and human-readable label
   */
  classify: (code: string): HsnSacClassification => {
    if (!code || typeof code !== "string") {
      return { isValid: false, type: "UNKNOWN", label: "" };
    }

    const clean = code.trim();
    if (!/^\d+$/.test(clean) || /^0+$/.test(clean)) {
      return { isValid: false, type: "UNKNOWN", label: "" };
    }

    // In India GST, all SAC codes begin with "99" and must be exactly 6 digits
    if (clean.startsWith("99")) {
      const isValid = clean.length === 6;
      return {
        isValid,
        type: "SAC",
        label: `SAC (Services) — ${clean.length} digits`,
        description: "Services Accounting Code",
      };
    }

    // Standard HSN codes for goods: valid lengths are 4, 6, or 8 digits
    const isValid = clean.length === 4 || clean.length === 6 || clean.length === 8;
    return {
      isValid,
      type: "HSN",
      label: `HSN (Goods) — ${clean.length} digits`,
      description: "Harmonized System of Nomenclature for Goods",
    };
  },

  /**
   * Validates whether a code conforms to standard HSN/SAC code requirements.
   */
  isValidCode: (code?: string | null): boolean => {
    return hsnSacPolicy.validateCode(code) === "";
  },

  /**
   * Determines whether a given code represents services (SAC).
   */
  isServiceCode: (code: string): boolean => {
    const clean = (code || "").trim();
    return clean.startsWith("99") && clean.length === 6 && !/^0+$/.test(clean);
  },
};
