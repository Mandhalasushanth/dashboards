/**
 * Supported file extensions accepted by Finsolz Revised ITR backend.
 * Matches backend GstFileUploadValidator constraints.
 */
export const REVISED_ITR_ALLOWED_EXTENSIONS = [
  "pdf",
  "jpg",
  "jpeg",
  "png",
  "xlsx",
  "xls",
] as const;

export type RevisedItrAllowedExtension = (typeof REVISED_ITR_ALLOWED_EXTENSIONS)[number];

/**
 * Maximum file size limit enforced by the backend (10 MB).
 */
export const MAX_REVISED_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Backend field name mapping for Revised ITR documents multipart request.
 */
export const REVISED_DOCUMENT_FIELD_MAP: Record<string, string> = {
  "doc-1": "panCard",
  "doc-2": "aadhaarCard",
  "doc-3": "form16Form16A",
  "doc-4": "aisTisStatement",
  "doc-5": "bankStatements",
  "doc-6": "investmentProofs",
};

/**
 * Canonical MIME types accepted by backend GstFileUploadValidator.
 */
export const REVISED_ITR_MIME_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xls: "application/vnd.ms-excel",
};

/**
 * Allowed MIME types set for validation.
 */
export const ALLOWED_CONTENT_TYPES_SET = new Set<string>([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
]);

/**
 * Lazy resolver for FileSystem to prevent bundling Flow/native modules in test environments.
 */
function getFileSystem(): any {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("expo-file-system/legacy");
  } catch {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require("expo-file-system");
    } catch {
      return null;
    }
  }
}

/**
 * Safely extracts the lowercase file extension without a leading dot.
 */
export function getFileExtension(fileName?: string): string {
  if (!fileName || typeof fileName !== "string") return "";
  const cleanName = fileName.split("?")[0].split("#")[0].trim();
  const lastDotIndex = cleanName.lastIndexOf(".");
  if (lastDotIndex === -1 || lastDotIndex === cleanName.length - 1) {
    return "";
  }
  return cleanName.slice(lastDotIndex + 1).toLowerCase();
}

/**
 * Resolves the canonical MIME type based on file name extension and optional provided MIME.
 */
export function resolveMimeType(fileName?: string, providedMime?: string): string {
  const ext = getFileExtension(fileName);
  if (ext && REVISED_ITR_MIME_TYPES[ext]) {
    return REVISED_ITR_MIME_TYPES[ext];
  }

  if (providedMime && typeof providedMime === "string") {
    const normalized = providedMime.trim().toLowerCase();
    if (ALLOWED_CONTENT_TYPES_SET.has(normalized)) {
      return normalized;
    }
  }

  return "application/octet-stream";
}

/**
 * Checks whether the file is one of the supported formats.
 */
export function isSupportedFileType(fileName?: string, mimeType?: string): boolean {
  const ext = getFileExtension(fileName);
  if (ext && (REVISED_ITR_ALLOWED_EXTENSIONS as readonly string[]).includes(ext)) {
    return true;
  }
  if (mimeType && ALLOWED_CONTENT_TYPES_SET.has(mimeType.trim().toLowerCase())) {
    return true;
  }
  return false;
}

/**
 * Formats byte size into human-readable string (e.g., "2.5 MB" or "800 KB").
 */
export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return "0 MB";
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Validates a document prior to upload.
 */
export function validateRevisedDocument(file: {
  name?: string;
  uri?: string;
  sizeBytes?: number;
  mimeType?: string;
}): { isValid: boolean; error?: string } {
  if (!file.uri || !file.uri.trim()) {
    return { isValid: false, error: "Please select a valid document file." };
  }

  const fileName = file.name || "";
  const extension = getFileExtension(fileName);

  if (!isSupportedFileType(fileName, file.mimeType)) {
    const allowed = REVISED_ITR_ALLOWED_EXTENSIONS.map((e) => e.toUpperCase()).join(", ");
    return {
      isValid: false,
      error: `Unsupported file type (.${extension || "unknown"}). Accepted formats: ${allowed}`,
    };
  }

  if (typeof file.sizeBytes === "number") {
    if (file.sizeBytes <= 0) {
      return { isValid: false, error: "File content cannot be empty." };
    }
    if (file.sizeBytes > MAX_REVISED_DOCUMENT_SIZE_BYTES) {
      return {
        isValid: false,
        error: "File size cannot exceed 10 MB. Please select a smaller file.",
      };
    }
  }

  return { isValid: true };
}

/**
 * Copies Android content:// or external URIs into the local app cache directory
 * to ensure persistent access and compatibility with React Native FormData native upload.
 */
export async function prepareLocalFileForUpload(
  uri: string,
  fileName?: string,
  customFileSystem?: any
): Promise<{ localUri: string; size: number }> {
  if (!uri || typeof uri !== "string") {
    throw new Error("Invalid file URI provided for upload.");
  }

  const cleanUri = uri.trim();
  const safeName = (fileName || "document.pdf").replace(/[^a-zA-Z0-9._-]/g, "_");
  const fs = customFileSystem || getFileSystem();
  const targetDir = fs ? (fs.cacheDirectory || fs.documentDirectory) : null;

  // On Android content:// URIs or iOS ph:// URIs, copy to local cache directory
  const isContentUri = cleanUri.startsWith("content://") || cleanUri.startsWith("ph://");
  const needsCopy = targetDir && (isContentUri || !cleanUri.startsWith(targetDir));

  if (targetDir && needsCopy && fs && typeof fs.copyAsync === "function") {
    try {
      const destinationUri = `${targetDir}revised_doc_${Date.now()}_${safeName}`;
      await fs.copyAsync({
        from: cleanUri,
        to: destinationUri,
      });

      if (typeof fs.getInfoAsync === "function") {
        const info = await fs.getInfoAsync(destinationUri);
        const size = info.exists && !info.isDirectory && typeof info.size === "number" ? info.size : 0;
        return { localUri: destinationUri, size };
      }
      return { localUri: destinationUri, size: 0 };
    } catch (copyErr) {
      console.warn("[prepareLocalFileForUpload] Failed to cache file, falling back to original URI:", copyErr);
    }
  }

  // Fallback / standard local file URI
  if (fs && typeof fs.getInfoAsync === "function") {
    try {
      const info = await fs.getInfoAsync(cleanUri);
      const size = info.exists && !info.isDirectory && typeof info.size === "number" ? info.size : 0;
      return { localUri: cleanUri, size };
    } catch {
      return { localUri: cleanUri, size: 0 };
    }
  }

  return { localUri: cleanUri, size: 0 };
}

/**
 * Creates a binary Blob compatible with Expo Winter fetch and FormData multipart requests
 * from a local file URI (e.g. file:// or cached sandbox path).
 *
 * Strategies:
 * 1. Direct fetch(fileUri) - standard in Expo via OkHttpFileUrlInterceptor on Android and NSURLSession on iOS.
 * 2. expo-file-system base64 reading -> Uint8Array -> Blob.
 * 3. Node.js fs.readFileSync for unit tests and local Node test runners.
 * 4. Fallback minimal Blob.
 */
export async function createBlobFromFileUri(
  fileUri: string,
  fileName?: string,
  mimeType?: string,
  customFileSystem?: any
): Promise<Blob> {
  const cleanMime = resolveMimeType(fileName, mimeType);

  // Strategy 1: Direct fetch(fileUri) - native Expo / Web standard
  if (typeof fetch === "function") {
    try {
      const res = await fetch(fileUri);
      if (res && typeof res.blob === "function") {
        const rawBlob = await res.blob();
        if (rawBlob && typeof rawBlob.size === "number") {
          const typedBlob =
            rawBlob.type && rawBlob.type === cleanMime
              ? rawBlob
              : new Blob([rawBlob], { type: cleanMime });
          if (fileName) {
            try {
              Object.defineProperty(typedBlob, "name", { value: fileName, writable: true });
            } catch {
              // Ignore if non-extensible
            }
          }
          return typedBlob;
        }
      }
    } catch {
      // Direct fetch may fail for file:// schemes in Node or specific environments; continue
    }
  }

  // Strategy 2: expo-file-system base64 read -> Uint8Array -> Blob
  const fs = customFileSystem || getFileSystem();
  if (fs && typeof fs.readAsStringAsync === "function") {
    try {
      const encoding = fs.EncodingType?.Base64 || "base64";
      const base64Data = await fs.readAsStringAsync(fileUri, { encoding });
      if (typeof base64Data === "string" && base64Data.length > 0) {
        const binaryStr =
          typeof atob === "function"
            ? atob(base64Data)
            : typeof Buffer !== "undefined"
              ? Buffer.from(base64Data, "base64").toString("binary")
              : "";
        const len = binaryStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: cleanMime });
        if (fileName) {
          try {
            Object.defineProperty(blob, "name", { value: fileName, writable: true });
          } catch {
            // Ignore
          }
        }
        return blob;
      }
    } catch {
      // Continue to Strategy 3
    }
  }

  // Strategy 3: Node environment local file reading for Jest / Node unit tests
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nodeFs = require("fs");
    const cleanPath = fileUri.replace(/^file:\/\/\/?/, "");
    if (nodeFs && typeof nodeFs.existsSync === "function" && nodeFs.existsSync(cleanPath)) {
      const fileBuffer = nodeFs.readFileSync(cleanPath);
      const blob = new Blob([fileBuffer], { type: cleanMime });
      if (fileName) {
        try {
          Object.defineProperty(blob, "name", { value: fileName, writable: true });
        } catch {
          // Ignore
        }
      }
      return blob;
    }
  } catch {
    // Fall through to fallback
  }

  // Fallback: Safe minimal Blob ensuring valid FormDataPart
  const fallbackBlob = new Blob([], { type: cleanMime });
  if (fileName) {
    try {
      Object.defineProperty(fallbackBlob, "name", { value: fileName, writable: true });
    } catch {
      // Ignore
    }
  }
  return fallbackBlob;
}

/**
 * Parses raw error into a user-friendly error string.
 */
export function describeUploadError(error: any): string {
  if (!error) return "An unexpected error occurred during document upload.";

  const raw = String(error?.message || error || "");

  // Extract Details: ... if present from backend HTTP error first
  const detailsMatch = raw.match(/Details:\s*(.+)$/i);
  if (detailsMatch && detailsMatch[1]) {
    const cleanDetails = detailsMatch[1].trim();
    if (cleanDetails && !cleanDetails.startsWith("<")) {
      return cleanDetails;
    }
  }

  if (
    raw.toLowerCase().includes("network request failed") ||
    raw.toLowerCase().includes("failed to fetch") ||
    raw.toLowerCase().includes("timeout") ||
    raw.toLowerCase().includes("connection")
  ) {
    return "Network connection issue. Please check your internet connection and try again.";
  }

  if (raw.toLowerCase().includes("at least one document is required")) {
    return "At least one document is required before proceeding.";
  }

  if (raw.toLowerCase().includes("cannot exceed 10 mb")) {
    return "One or more documents exceed the 10 MB file size limit.";
  }

  if (raw.toLowerCase().includes("unsupported file type")) {
    return "Unsupported file type. Only PDF, JPG, JPEG, PNG, XLSX, and XLS are accepted.";
  }

  if (raw.toLowerCase().includes("file content cannot be empty")) {
    return "One or more selected documents are empty (0 bytes).";
  }

  if (raw.toLowerCase().includes("filenotfound") || raw.toLowerCase().includes("permission denied")) {
    return "Unable to access the selected file. Please ensure storage permissions are granted and try selecting the file again.";
  }

  return raw || "Document upload failed. Please try again.";
}
