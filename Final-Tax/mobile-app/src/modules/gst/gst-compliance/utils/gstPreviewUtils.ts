import { Platform } from "react-native";
import { File as ExpoFile, Paths } from "expo-file-system";
import * as FileSystemLegacy from "expo-file-system/legacy";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { UploadedDocInfo } from "@/modules/gst/validation/complianceSchema";

export interface ResolvedDocType {
  isImage: boolean;
  isPdf: boolean;
  isSpreadsheet: boolean;
  resolvedMime: string;
  uti: string;
  typeLabel: string;
}

export type DocTypeInput = Partial<UploadedDocInfo> & {
  type?: string;
  fileTypeLabel?: string;
};

export function extractExtension(raw?: string): string {
  if (!raw) return "";
  const cleaned = raw.split("?")[0].split("#")[0];
  const lastSlash = Math.max(cleaned.lastIndexOf("/"), cleaned.lastIndexOf("\\"));
  const basename = lastSlash !== -1 ? cleaned.slice(lastSlash + 1) : cleaned;
  const dot = basename.lastIndexOf(".");
  return dot !== -1 ? basename.slice(dot).toLowerCase() : "";
}

export function getDocExtension(name?: string, uri?: string): string {
  const nameExt = extractExtension(name);
  if (nameExt) return nameExt;
  return extractExtension(uri);
}

export function resolveDocType(
  doc?: DocTypeInput | null
): ResolvedDocType {
  const ext = getDocExtension(doc?.name, doc?.uri);
  const mime = (doc?.mimeType || "").toLowerCase();
  const label = (doc?.fileTypeLabel || "").toLowerCase();
  const rawType = (doc?.type || "").toLowerCase();

  const isImage =
    mime.startsWith("image/") ||
    rawType.startsWith("image") ||
    label === "image" ||
    label === "jpg" ||
    label === "jpeg" ||
    label === "png" ||
    label === "webp" ||
    ext === ".jpg" ||
    ext === ".jpeg" ||
    ext === ".png" ||
    ext === ".webp" ||
    ext === ".gif" ||
    ext === ".bmp";

  const isPdf =
    mime === "application/pdf" ||
    ext === ".pdf" ||
    label === "pdf" ||
    label.includes("pdf");

  const isSpreadsheet =
    mime.includes("spreadsheet") ||
    mime.includes("excel") ||
    mime === "text/csv" ||
    label.includes("excel") ||
    label.includes("spreadsheet") ||
    label.includes("csv") ||
    label === "xls" ||
    label === "xlsx" ||
    ext === ".xlsx" ||
    ext === ".xls" ||
    ext === ".csv";

  let resolvedMime = mime || "application/octet-stream";
  let uti = "public.data";
  let typeLabel = "Document";

  if (isPdf) {
    resolvedMime = "application/pdf";
    uti = "com.adobe.pdf";
    typeLabel = "PDF Document";
  } else if (isImage) {
    if (ext === ".png" || mime === "image/png") {
      resolvedMime = "image/png";
      uti = "public.png";
      typeLabel = "PNG Image";
    } else if (ext === ".webp" || mime === "image/webp") {
      resolvedMime = "image/webp";
      uti = "org.webmproject.webp";
      typeLabel = "WebP Image";
    } else {
      resolvedMime = "image/jpeg";
      uti = "public.jpeg";
      typeLabel = "JPEG Image";
    }
  } else if (
    ext === ".xlsx" ||
    mime.includes("openxmlformats") ||
    label.includes("xlsx")
  ) {
    resolvedMime =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    uti = "org.openxmlformats.spreadsheetml.sheet";
    typeLabel = "Excel Spreadsheet (.xlsx)";
  } else if (ext === ".xls" || mime.includes("ms-excel") || label.includes("xls")) {
    resolvedMime = "application/vnd.ms-excel";
    uti = "com.microsoft.excel.xls";
    typeLabel = "Excel Spreadsheet (.xls)";
  } else if (ext === ".csv" || mime === "text/csv" || label.includes("csv")) {
    resolvedMime = "text/csv";
    uti = "public.comma-separated-values-text";
    typeLabel = "CSV Spreadsheet";
  }

  return { isImage, isPdf, isSpreadsheet, resolvedMime, uti, typeLabel };
}

export interface ShareableUriResult {
  shareableUri: string;
  alreadyOpened?: boolean;
}

export class DocumentOpenError extends Error {
  public readonly code: string;
  public readonly safeMessage: string;

  constructor(code: string, safeMessage: string, details?: string) {
    super(details ? `${code}: ${details}` : code);
    this.name = "DocumentOpenError";
    this.code = code;
    this.safeMessage = safeMessage;
  }
}

export const logSafeDiagnostic = (
  operation: string,
  details: { scheme: string; error?: string }
): void => {
  if (__DEV__) {
    console.warn(
      `[GstPreview] ${operation} (platform: ${Platform.OS}, scheme: ${details.scheme}): ${details.error || "ok"}`
    );
  }
};

export const prepareShareableUri = async (
  uri: string,
  fileName?: string
): Promise<ShareableUriResult> => {
  const scheme = (uri.split(":")[0] || "").toLowerCase();
  const safeName = (fileName || "document.pdf").replace(/[^a-zA-Z0-9._-]/g, "_");

  // Determine cache directory with fallback
  let cacheDirUri = "";
  try {
    if (Paths.cache?.uri) {
      cacheDirUri = Paths.cache.uri;
    }
  } catch {
    // Fall back to legacy cache directory
  }
  if (!cacheDirUri && FileSystemLegacy.cacheDirectory) {
    cacheDirUri = FileSystemLegacy.cacheDirectory;
  }
  if (cacheDirUri && !cacheDirUri.endsWith("/")) {
    cacheDirUri = `${cacheDirUri}/`;
  }

  // 1. Remote HTTP/HTTPS URL
  if (scheme === "http" || scheme === "https") {
    if (cacheDirUri) {
      const localTargetUri = `${cacheDirUri}preview_${Date.now()}_${safeName}`;
      try {
        const targetFile = new ExpoFile(localTargetUri);
        await ExpoFile.downloadFileAsync(uri, targetFile, { idempotent: true });
        if (targetFile.exists && (targetFile.size ?? 0) > 0) {
          logSafeDiagnostic("downloadRemote.modern", { scheme, error: "downloaded" });
          return { shareableUri: targetFile.uri };
        }
      } catch (errA) {
        logSafeDiagnostic("downloadRemote.modern", { scheme, error: String(errA) });
        try {
          const res = await FileSystemLegacy.downloadAsync(uri, localTargetUri);
          const check = await FileSystemLegacy.getInfoAsync(res.uri);
          if (check.exists && (check.size ?? 0) > 0) {
            logSafeDiagnostic("downloadRemote.legacy", { scheme, error: "downloaded" });
            return { shareableUri: res.uri };
          }
        } catch (errB) {
          logSafeDiagnostic("downloadRemote.legacy", { scheme, error: String(errB) });
        }
      }
    }

    // Fall back to external browser
    try {
      await WebBrowser.openBrowserAsync(uri);
      return { shareableUri: uri, alreadyOpened: true };
    } catch {
      const canOpen = await Linking.canOpenURL(uri);
      if (canOpen) {
        await Linking.openURL(uri);
        return { shareableUri: uri, alreadyOpened: true };
      }
    }
    throw new DocumentOpenError(
      "REMOTE_URL_UNREACHABLE",
      "Unable to download or open remote document. Please check your internet connection."
    );
  }

  // 2. Android content:// URI: must copy into app-cache file:// URI
  if (scheme === "content") {
    if (!cacheDirUri) {
      throw new DocumentOpenError(
        "STORAGE_UNAVAILABLE",
        "Device storage is unavailable. Please check available disk space."
      );
    }
    const localTargetUri = `${cacheDirUri}preview_${Date.now()}_${safeName}`;
    const sourceFile = new ExpoFile(uri);
    const targetFile = new ExpoFile(localTargetUri);

    let copySucceeded = false;
    let lastCopyError = "";

    // Step A: Modern File copy
    try {
      await sourceFile.copy(targetFile, { overwrite: true });
      copySucceeded = true;
    } catch (errA) {
      lastCopyError = String(errA);
      logSafeDiagnostic("copyContent.stepA", { scheme, error: lastCopyError });
    }

    // Step B: Direct byte stream transfer via modern File
    if (!copySucceeded) {
      try {
        const bytes = await sourceFile.bytes();
        if (bytes && bytes.length > 0) {
          targetFile.write(bytes);
          copySucceeded = true;
        }
      } catch (errB) {
        lastCopyError = String(errB);
        logSafeDiagnostic("copyContent.stepB", { scheme, error: lastCopyError });
      }
    }

    // Step C: Legacy FileSystem copyAsync
    if (!copySucceeded) {
      try {
        await FileSystemLegacy.copyAsync({ from: uri, to: localTargetUri });
        copySucceeded = true;
      } catch (errC) {
        lastCopyError = String(errC);
        logSafeDiagnostic("copyContent.stepC", { scheme, error: lastCopyError });
      }
    }

    // Step D: Legacy FileSystem base64 transfer
    if (!copySucceeded) {
      try {
        const base64 = await FileSystemLegacy.readAsStringAsync(uri, {
          encoding: "base64" as FileSystemLegacy.EncodingType.Base64,
        });
        if (base64) {
          await FileSystemLegacy.writeAsStringAsync(localTargetUri, base64, {
            encoding: "base64" as FileSystemLegacy.EncodingType.Base64,
          });
          copySucceeded = true;
        }
      } catch (errD) {
        lastCopyError = String(errD);
        logSafeDiagnostic("copyContent.stepD", { scheme, error: lastCopyError });
      }
    }

    // Verify destination exists and has data
    let targetExists = false;
    let targetSize = 0;
    try {
      targetExists = targetFile.exists;
      targetSize = targetFile.size ?? 0;
    } catch {
      // Fall through to legacy check
    }
    if (!targetExists || targetSize <= 0) {
      try {
        const info = await FileSystemLegacy.getInfoAsync(localTargetUri);
        if (info.exists) {
          targetExists = true;
          targetSize = info.size ?? 0;
        } else {
          targetExists = false;
          targetSize = 0;
        }
      } catch {
        // Fall through
      }
    }

    if (!targetExists || targetSize <= 0) {
      throw new DocumentOpenError(
        "CONTENT_COPY_FAILED",
        "Could not prepare document for external viewing. The original file may have expired or permission was revoked. Please re-select the document.",
        lastCopyError
      );
    }

    return { shareableUri: localTargetUri };
  }

  // 3. Local file:// URI: verify existence and cache accessibility
  if (scheme === "file") {
    let sourceExists = false;
    let sourceSize = 0;
    try {
      const sourceFile = new ExpoFile(uri);
      sourceExists = sourceFile.exists;
      sourceSize = sourceFile.size ?? 0;
    } catch {
      // Fall through to legacy check
    }
    if (!sourceExists) {
      try {
        const check = await FileSystemLegacy.getInfoAsync(uri);
        if (check.exists) {
          sourceExists = true;
          sourceSize = check.size ?? 0;
        } else {
          sourceExists = false;
          sourceSize = 0;
        }
      } catch {
        // Fall through
      }
    }

    if (!sourceExists) {
      throw new DocumentOpenError(
        "FILE_NOT_FOUND",
        "The document file was not found on this device. Please re-select the document."
      );
    }

    // On Android, verify file is in accessible cache location for SharingFileProvider
    if (Platform.OS === "android" && cacheDirUri) {
      const isInCache = uri.startsWith(cacheDirUri);
      if (isInCache && sourceSize > 0) {
        // Avoid redundant copying if already in app cache
        return { shareableUri: uri };
      }

      // Copy into app cache to ensure SharingFileProvider authority
      const localTargetUri = `${cacheDirUri}preview_${Date.now()}_${safeName}`;
      const targetFile = new ExpoFile(localTargetUri);
      const sourceFile = new ExpoFile(uri);
      let copied = false;
      try {
        await sourceFile.copy(targetFile, { overwrite: true });
        copied = targetFile.exists && (targetFile.size ?? 0) > 0;
      } catch {
        try {
          await FileSystemLegacy.copyAsync({ from: uri, to: localTargetUri });
          const info = await FileSystemLegacy.getInfoAsync(localTargetUri);
          copied = Boolean(info.exists && (info.size ?? 0) > 0);
        } catch {
          copied = false;
        }
      }
      if (copied) {
        return { shareableUri: localTargetUri };
      }
    }

    return { shareableUri: uri };
  }

  return { shareableUri: uri };
};

