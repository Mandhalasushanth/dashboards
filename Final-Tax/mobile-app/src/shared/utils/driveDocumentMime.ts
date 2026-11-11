export const DRIVE_EXTENSION_MIME_MAP: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xls: "application/vnd.ms-excel",
  csv: "text/csv",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  json: "application/json",
};

/**
 * Resolves canonical MIME type for files picked from drive.
 * Rejects unknown or unsupported extensions (returns null, never defaults to image/jpeg).
 * Rejects mismatched extension/MIME combinations.
 */
export function resolveDriveDocumentMimeType(
  extension: string,
  providedMime?: string
): string | null {
  const ext = (extension || "").toLowerCase().replace(/^\./, "");
  const canonicalMime = DRIVE_EXTENSION_MIME_MAP[ext];
  if (!canonicalMime) {
    return null; // Unknown extension -> reject, never default to image/jpeg
  }

  const cleanProvided = providedMime ? providedMime.trim().toLowerCase() : "";
  const isGeneric =
    !cleanProvided ||
    cleanProvided === "application/octet-stream" ||
    cleanProvided === "*/*" ||
    cleanProvided === "binary/octet-stream";

  if (isGeneric) {
    return canonicalMime;
  }

  if (cleanProvided === canonicalMime) {
    return canonicalMime;
  }

  return null; // Mismatched extension and MIME -> reject
}

