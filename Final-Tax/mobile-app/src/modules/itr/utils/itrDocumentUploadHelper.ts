/**
 * Authoritative file formats and MIME types supported by the Finsolz ITR backend.
 * Backed by com.finsolz.validator.GstFileUploadValidator constraints:
 * - application/pdf
 * - image/jpeg
 * - image/png
 * - application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
 * - application/vnd.ms-excel
 */

export const ITR_ALLOWED_EXTENSIONS = [
  "pdf",
  "jpg",
  "jpeg",
  "png",
  "xlsx",
  "xls",
] as const;

export type ItrAllowedExtension = (typeof ITR_ALLOWED_EXTENSIONS)[number];

export const ITR_MIME_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xls: "application/vnd.ms-excel",
};

export const BACKEND_ALLOWED_CONTENT_TYPES = new Set<string>([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
]);

/**
 * Checks whether a MIME type is missing, empty, or generic.
 */
export function isGenericMimeType(mime?: string): boolean {
  if (!mime || typeof mime !== "string") return true;
  const clean = mime.trim().toLowerCase();
  return (
    clean === "" ||
    clean === "application/octet-stream" ||
    clean === "*/*" ||
    clean === "binary/octet-stream"
  );
}

/**
 * Extracts lowercase file extension without a leading dot.
 * Handles query parameters and hash fragments safely.
 */
export function getFileExtension(fileName?: string): string {
  if (!fileName || typeof fileName !== "string") return "";
  const clean = fileName.split("?")[0].split("#")[0].trim();
  const lastDot = clean.lastIndexOf(".");
  if (lastDot === -1 || lastDot === clean.length - 1) return "";
  return clean.slice(lastDot + 1).toLowerCase();
}

/**
 * Validates file extension and MIME type strictly:
 * - When both extension and non-generic MIME type are provided, requires them to match.
 * - When MIME is missing or generic (application/octet-stream, wildcard), resolves from extension.
 * - Rejects unsupported extensions even when the supplied MIME type looks valid.
 * - Rejects mismatched extension/MIME combinations (e.g. .exe with application/pdf, .pdf with image/jpeg).
 * - Accepts valid extension-free files only when MIME is in BACKEND_ALLOWED_CONTENT_TYPES.
 */
export function isItrSupportedFile(fileName?: string, mimeType?: string): boolean {
  if (!fileName && !mimeType) return false;

  const ext = getFileExtension(fileName);

  if (ext) {
    // If extension is present, it MUST be supported
    if (!(ITR_ALLOWED_EXTENSIONS as readonly string[]).includes(ext)) {
      return false;
    }

    const expectedMime = ITR_MIME_TYPES[ext];

    // If MIME is missing or generic, accept based on the supported extension
    if (isGenericMimeType(mimeType)) {
      return true;
    }

    // When non-generic MIME is provided, it MUST strictly match the extension
    const normalized = mimeType!.trim().toLowerCase();
    return normalized === expectedMime;
  }

  // When filename has no extension:
  if (isGenericMimeType(mimeType)) {
    return false;
  }

  // Must be in authoritative backend allowed content types
  return BACKEND_ALLOWED_CONTENT_TYPES.has(mimeType!.trim().toLowerCase());
}

/**
 * Resolves the authoritative MIME type based on filename extension and optional provided MIME.
 * Strictly respects extension-to-MIME alignment:
 * - If extension is supported and MIME is missing/generic, resolves to canonical MIME.
 * - If extension and non-generic MIME match, returns canonical MIME.
 * - If mismatched or unsupported, returns "application/octet-stream".
 */
export function resolveItrMimeType(fileName?: string, providedMime?: string): string {
  const ext = getFileExtension(fileName);

  if (ext && ITR_MIME_TYPES[ext]) {
    const canonical = ITR_MIME_TYPES[ext];
    if (isGenericMimeType(providedMime)) {
      return canonical;
    }
    const normalized = providedMime!.trim().toLowerCase();
    if (normalized === canonical) {
      return canonical;
    }
    return "application/octet-stream";
  }

  if (!ext && providedMime && !isGenericMimeType(providedMime)) {
    const normalized = providedMime.trim().toLowerCase();
    if (BACKEND_ALLOWED_CONTENT_TYPES.has(normalized)) {
      return normalized;
    }
  }

  return "application/octet-stream";
}

/**
 * Resolves standard file extension from MIME type when filename lacks an extension.
 */
export function resolveExtensionFromMime(mimeType?: string): string {
  if (!mimeType) return "pdf";
  const normalized = mimeType.trim().toLowerCase();
  switch (normalized) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      return "xlsx";
    case "application/vnd.ms-excel":
      return "xls";
    case "application/pdf":
    default:
      return "pdf";
  }
}

/**
 * Returns formatted accepted file types list for user alerts (e.g. "PDF, JPG, JPEG, PNG, XLSX, XLS").
 */
export function getItrAcceptedFormatsString(allowedExtensions?: readonly string[]): string {
  const list = allowedExtensions || ITR_ALLOWED_EXTENSIONS;
  return list.map((e) => e.toUpperCase()).join(", ");
}
