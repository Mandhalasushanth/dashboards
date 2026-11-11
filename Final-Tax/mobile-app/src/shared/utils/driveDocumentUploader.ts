import { Platform, Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { logger } from "@/core/logging/logger";
import {
  DRIVE_EXTENSION_MIME_MAP,
  resolveDriveDocumentMimeType,
} from "./driveDocumentMime";

export { DRIVE_EXTENSION_MIME_MAP, resolveDriveDocumentMimeType };

export interface PickedDocumentResult {
  uri: string;
  name: string;
  size: string;
  sizeBytes: number;
  mimeType: string;
  fileTypeLabel: string;
}

export interface PickDocumentOptions {
  allowedMimeTypes?: string[];
  maxSizeBytes?: number;
  allowedExtensions?: string[];
}

const DEFAULT_MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const DEFAULT_ALLOWED_EXTENSIONS = [
  "pdf",
  "jpg",
  "jpeg",
  "png",
  "xls",
  "xlsx",
  "csv",
  "doc",
  "docx",
  "json",
];

/** Module-level mutex to prevent concurrent picking calls (ERR_PICKING_IN_PROGRESS on iOS) */
let isPickingActive = false;

/**
 * Universal document picker optimized specifically for iOS Google Drive,
 * iCloud Drive, and Android file storage.
 *
 * Why this is needed on iOS:
 * 1. Apple's UIDocumentPickerViewController relies on UTIs (Uniform Type Identifiers).
 *    Passing strict MIME types (e.g. ['application/pdf']) causes iOS cloud providers
 *    like Google Drive to disable / grey out cloud files in the Files app.
 *    Using all-type wildcards ensures all cloud files in Google Drive and iCloud Drive remain selectable.
 * 2. On iOS, presenting UIDocumentPickerViewController while another modal is closing
 *    triggers PickingInProgressException ("Different document picking in progress").
 *    A 450ms settling delay guarantees UIKit has finished modal dismissal.
 * 3. On iOS, cloud documents may have security-scoped URLs that native FormData cannot read.
 *    We copy cloud-only files into the local app sandbox (FileSystem.cacheDirectory).
 * 4. On Android, DocumentPicker with copyToCacheDirectory: true already provides
 *    a clean, working, fully accessible URI. We do NOT run extra copy operations on Android
 *    to prevent java.io.IOException.
 */
export async function pickDocumentFromDrive(
  options?: PickDocumentOptions
): Promise<PickedDocumentResult | null> {
  // Prevent duplicate concurrent launches
  if (isPickingActive) {
    return null;
  }
  isPickingActive = true;

  const maxSizeBytes = options?.maxSizeBytes ?? DEFAULT_MAX_SIZE_BYTES;
  const allowedExtensions = options?.allowedExtensions ?? DEFAULT_ALLOWED_EXTENSIONS;

  try {
    // 1. On iOS, wait for any active modal dismissal animation to complete in UIKit
    if (Platform.OS === "ios") {
      await new Promise((resolve) => setTimeout(resolve, 450));
    }

    const docType = Platform.OS === "ios"
      ? ["*/*"]
      : (options?.allowedMimeTypes || ["*/*"]);

    const pickerResult = await DocumentPicker.getDocumentAsync({
      type: docType,
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (pickerResult.canceled || !pickerResult.assets || pickerResult.assets.length === 0) {
      return null;
    }

    const asset = pickerResult.assets[0];
    let sourceUri = asset.uri;

    if (!sourceUri) {
      return null;
    }

    // 2. Decode URL encoding if present on iOS
    if (Platform.OS === "ios" && sourceUri.includes("%")) {
      try {
        sourceUri = decodeURI(sourceUri);
      } catch {
        // preserve original if decoding fails
      }
    }

    // 3. Extract and validate file extension
    const originalName = asset.name || "document.pdf";
    const extension = (originalName.split(".").pop() || "").toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      const allowedStr = allowedExtensions.map((e) => e.toUpperCase()).join(", ");
      Alert.alert(
        "Unsupported File Format",
        `Please select a valid ${allowedStr} file.`
      );
      return null;
    }

    // 4. Resolve destination URI:
    // Copy picked files to app internal storage (FileSystem.documentDirectory) to prevent Android cache eviction
    let resolvedUri = sourceUri;
    const targetDir = FileSystem.documentDirectory || FileSystem.cacheDirectory;
    if (targetDir && !sourceUri.startsWith(targetDir)) {
      try {
        const sanitizedFileName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
        const localDestinationUri = `${targetDir}doc_${Date.now()}_${sanitizedFileName}`;
        await FileSystem.copyAsync({
          from: sourceUri,
          to: localDestinationUri,
        });
        resolvedUri = localDestinationUri;
      } catch {
        resolvedUri = sourceUri;
      }
    }

    // 5. Verify true file size on disk
    let sizeBytes = asset.size || 0;
    try {
      const fileInfo = await FileSystem.getInfoAsync(resolvedUri);
      if (fileInfo.exists && !fileInfo.isDirectory && fileInfo.size) {
        sizeBytes = fileInfo.size;
      }
    } catch {
      // use asset.size
    }

    if (sizeBytes > maxSizeBytes) {
      const maxMb = Math.round(maxSizeBytes / (1024 * 1024));
      Alert.alert(
        "File Too Large",
        `The selected document exceeds the ${maxMb} MB limit. Please select a smaller file.`
      );
      return null;
    }

    // 6. Determine standard MIME type
    const mimeType = resolveDriveDocumentMimeType(extension, asset.mimeType);
    if (!mimeType) {
      Alert.alert(
        "Unsupported File Format",
        `The file (.${extension || "unknown"}) has an unsupported or invalid format.`
      );
      return null;
    }

    const formattedSize = sizeBytes > 0
      ? `${(sizeBytes / (1024 * 1024)).toFixed(2)} MB`
      : "0.10 MB";

    return {
      uri: resolvedUri,
      name: originalName,
      size: formattedSize,
      sizeBytes,
      mimeType,
      fileTypeLabel: extension.toUpperCase(),
    };
  } catch (error: any) {
    const msg = error?.message || "";
    if (msg.includes("cancel") || error?.code === "ERR_CANCELLED") {
      return null;
    }
    logger.error("[driveDocumentUploader] Error picking document from drive:", { error });
    Alert.alert(
      "Document Selection Error",
      msg || "Could not select file from drive. Please try again."
    );
    return null;
  } finally {
    isPickingActive = false;
  }
}
