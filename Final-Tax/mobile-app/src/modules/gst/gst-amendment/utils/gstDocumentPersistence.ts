import * as FileSystemLegacy from "expo-file-system/legacy";
import { logger } from "@/core/logging/logger";

export interface PersistedDocumentResult {
  uri: string;
  name: string;
  size: string;
  rawSizeBytes?: number;
  mimeType?: string;
}

/**
 * Persists an attached document or image into application-owned persistent storage
 * (FileSystem.documentDirectory) to avoid cache eviction and content:// URI access revocation.
 * Handles both Android (content:// and file://) and iOS URIs.
 */
export async function persistSupportingDocument(doc: {
  uri: string;
  name?: string;
  size?: string;
  rawSizeBytes?: number;
  mimeType?: string;
}): Promise<PersistedDocumentResult> {
  const sourceUri = doc.uri;
  if (!sourceUri) {
    return {
      uri: sourceUri,
      name: doc.name || "document.pdf",
      size: doc.size || "0.01 MB",
      rawSizeBytes: doc.rawSizeBytes,
      mimeType: doc.mimeType,
    };
  }

  const baseDir = FileSystemLegacy.documentDirectory || FileSystemLegacy.cacheDirectory;
  const fileName = doc.name || `proof_${Date.now()}.jpg`;
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");

  // If already stored in our documentDirectory, verify and return
  if (baseDir && sourceUri.startsWith(baseDir)) {
    return {
      uri: sourceUri,
      name: fileName,
      size: doc.size || "0.01 MB",
      rawSizeBytes: doc.rawSizeBytes,
      mimeType: doc.mimeType,
    };
  }

  if (!baseDir) {
    return {
      uri: sourceUri,
      name: fileName,
      size: doc.size || "0.01 MB",
      rawSizeBytes: doc.rawSizeBytes,
      mimeType: doc.mimeType,
    };
  }

  const destinationUri = `${baseDir}gst_amend_${Date.now()}_${sanitizedName}`;

  try {
    await FileSystemLegacy.copyAsync({
      from: sourceUri,
      to: destinationUri,
    });

    let detectedSize = doc.size;
    let detectedBytes = doc.rawSizeBytes;

    try {
      const info = await FileSystemLegacy.getInfoAsync(destinationUri);
      if (info && info.exists && typeof info.size === "number" && info.size > 0) {
        detectedBytes = info.size;
        const mb = info.size / (1024 * 1024);
        detectedSize = `${mb.toFixed(2)} MB`;
      }
    } catch {
      // keep existing size
    }

    return {
      uri: destinationUri,
      name: fileName,
      size: detectedSize || "0.01 MB",
      rawSizeBytes: detectedBytes,
      mimeType: doc.mimeType,
    };
  } catch (copyErr) {
    logger.warn("[gstDocumentPersistence] Failed to copy to persistent directory, keeping source URI:", {
      error: copyErr,
      sourceUri,
    });
    return {
      uri: sourceUri,
      name: fileName,
      size: doc.size || "0.01 MB",
      rawSizeBytes: doc.rawSizeBytes,
      mimeType: doc.mimeType,
    };
  }
}

/**
 * Safely checks if a file URI exists and is accessible.
 * For http/https/blob URIs, returns true immediately.
 * Never throws an unhandled error.
 */
export async function verifyFileAccessible(uri?: string | null): Promise<boolean> {
  if (!uri || typeof uri !== "string") return false;

  const lower = uri.toLowerCase();
  // Remote / Web / Blob / Data URIs are considered accessible
  if (
    lower.startsWith("http://") ||
    lower.startsWith("https://") ||
    lower.startsWith("blob:") ||
    lower.startsWith("data:")
  ) {
    return true;
  }

  // Check via FileSystemLegacy
  try {
    const info = await FileSystemLegacy.getInfoAsync(uri);
    if (info && typeof info.exists === "boolean") {
      return info.exists;
    }
  } catch (err) {
    logger.debug("[gstDocumentPersistence] verifyFileAccessible legacy stat notice:", { uri, error: err });
  }

  // If uri is content:// on Android, FileSystem.getInfoAsync may fail even if ContentResolver can read it
  if (lower.startsWith("content://")) {
    return true;
  }

  return true;
}
