/**
 * GST Validation Utilities
 * Indian GSTIN format validation, file type checks, and size validation.
 * Checksum verification is intentionally omitted — structure only.
 */

// 15-character GSTIN format regex (strict PAN entity type validation):
// 2 digits (state code) + 3 letters (PAN 1-3) + entity type [ABCFGHJLPT] (PAN 4) +
// 1 letter (PAN 5) + 4 digits (PAN 6-9) + 1 letter (PAN 10) + entity number + 'Z' + checksum
export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{3}[ABCFGHJLPT][A-Z][0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MiB (10,485,760 bytes)

/**
 * 36 Active Domestic Indian States and Union Territories (GST Portal & Census 2011 standard).
 * Codes: 01–24, 26, 27, and 29–38.
 * Excludes: 00, 25 (legacy), 28 (defunct), 39–96, 97, 98, 99.
 */
export const VALID_GST_STATE_CODES: ReadonlySet<string> = new Set([
  "01", "02", "03", "04", "05", "06", "07", "08", "09", "10",
  "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
  "21", "22", "23", "24", "26", "27", "29", "30", "31", "32",
  "33", "34", "35", "36", "37", "38",
]);

export function isValidGstStateCode(code: string): boolean {
  if (!code) return false;
  return VALID_GST_STATE_CODES.has(code.trim());
}

export const RECONCILIATION_ALLOWED_EXTENSIONS = [
  ".pdf",
  ".xls",
  ".xlsx",
  ".csv",
  ".jpg",
  ".jpeg",
  ".png",
];
export const NOTICE_ALLOWED_EXTENSIONS = [
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".xls",
  ".xlsx",
  ".csv",
];

export function isValidGstin(gstin: string): boolean {
  return validateGstinFull(gstin) === null;
}

/**
 * Progressive GSTIN validator for real-time (keystroke) feedback.
 * Returns an error as soon as an invalid character is entered at any position,
 * without waiting for all 15 characters. Returns null for partial but valid input.
 * Shows "Enter a valid PAN format in the GSTIN." specifically for the 4th PAN character.
 */
export function validateGstinLive(gstin: string): string | null {
  if (!gstin) return null;
  const clean = gstin.trim().toUpperCase();
  if (!clean) return null;
  if (/[^A-Z0-9]/.test(clean)) return "Enter a valid GSTIN format.";

  const len = clean.length;
  if (len > 15) return "Enter a valid 15-character GSTIN.";

  // State code (positions 1–2)
  if (len >= 2 && !VALID_GST_STATE_CODES.has(clean.slice(0, 2))) {
    return "Enter a valid GSTIN format.";
  }
  // PAN chars 1–3 must be letters (positions 3–5)
  if (len >= 5 && !/^[A-Z]{3}$/.test(clean.slice(2, 5))) {
    return "Enter a valid GSTIN format.";
  }
  // PAN entity type — 4th PAN character (position 6) — specific message
  if (len >= 6 && !/[ABCFGHJLPT]/.test(clean[5])) {
    return "Enter a valid PAN format in the GSTIN.";
  }
  // PAN 5th char must be a letter (position 7)
  if (len >= 7 && !/[A-Z]/.test(clean[6])) {
    return "Enter a valid GSTIN format.";
  }
  // PAN digit positions (8–11)
  for (let i = 7; i < Math.min(len, 11); i++) {
    if (!/[0-9]/.test(clean[i])) return "Enter a valid GSTIN format.";
  }
  // PAN 10th char must be a letter (position 12)
  if (len >= 12 && !/[A-Z]/.test(clean[11])) {
    return "Enter a valid GSTIN format.";
  }
  // Entity number [1-9A-Z] (position 13)
  if (len >= 13 && !/[1-9A-Z]/.test(clean[12])) {
    return "Enter a valid GSTIN format.";
  }
  // Fixed 'Z' (position 14)
  if (len >= 14 && clean[13] !== "Z") {
    return "Enter a valid GSTIN format.";
  }
  // Full 15-character GSTIN: delegate to complete validator
  if (len === 15) return validateGstinFull(clean);

  return null;
}

export function validateGstinFull(gstin: string): string | null {
  if (!gstin || !gstin.trim()) return "Enter a valid 15-character GSTIN.";
  const clean = gstin.trim().toUpperCase();
  if (/[^A-Z0-9]/.test(clean)) return "Enter a valid GSTIN format.";
  if (clean.length !== 15) return "Enter a valid 15-character GSTIN.";
  if (!VALID_GST_STATE_CODES.has(clean.slice(0, 2))) return "Enter a valid GSTIN format.";
  if (!GSTIN_REGEX.test(clean)) return "Enter a valid GSTIN format.";
  return null;
}

export function cleanGstinInput(text: string): string {
  return text.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 15);
}

export function isFileSizeValid(
  bytes?: number,
  maxBytes: number = MAX_FILE_SIZE_BYTES
): boolean {
  if (bytes === undefined || bytes === null || typeof bytes !== "number" || isNaN(bytes) || bytes <= 0) {
    return false;
  }
  return bytes <= maxBytes;
}

export function isFileTypeAllowed(filename: string, allowedExtensions: string[]): boolean {
  if (!filename) return false;
  const lower = filename.toLowerCase();
  return allowedExtensions.some((ext) => lower.endsWith(ext.toLowerCase()));
}

export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return "0 KB";
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${Math.round(kb)} KB`;
  }
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

export function generateComplianceRefId(): string {
  const year = new Date().getFullYear();
  const randomSeq = String(Math.floor(100000 + Math.random() * 900000));
  return `GSTC-${year}-${randomSeq}`;
}

export function getTodayFormatted(): string {
  const d = new Date();
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const day = String(d.getDate()).padStart(2, "0");
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}
