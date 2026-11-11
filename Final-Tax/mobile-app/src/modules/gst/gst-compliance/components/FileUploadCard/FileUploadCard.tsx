import React from "react";
import { Platform } from "react-native";
import { File as ExpoFile } from "expo-file-system";
import * as FileSystemLegacy from "expo-file-system/legacy";
import { GstDocumentCard } from "@/modules/gst/components/GstDocumentCard";
import { UploadedDocInfo } from "@/modules/gst/validation/complianceSchema";
import { MAX_FILE_SIZE_BYTES, formatFileSize } from "@/modules/gst/utils/gstValidation";
import { resolveDocType } from "../../utils/gstPreviewUtils";

export interface FileUploadCardProps {
  title: string;
  description?: string;
  required?: boolean;
  allowedExtensions?: string[];
  supportedFormatsText?: string;
  maxSizeBytes?: number;
  uploadedDoc: UploadedDocInfo | null;
  onDocChange: (doc: UploadedDocInfo | null) => void;
  error?: string;
  onClearError?: () => void;
  onError?: (message: string) => void;
}

const resolveFileSizeInBytes = async (
  uri: string,
  rawSizeBytes?: number
): Promise<number | null> => {
  // 1. Primary: use numeric size metadata if already supplied by picker
  if (
    typeof rawSizeBytes === "number" &&
    Number.isFinite(rawSizeBytes) &&
    rawSizeBytes > 0
  ) {
    return rawSizeBytes;
  }

  // 2. Web fallback: query size via fetch (handles blob: and data: URIs)
  if (Platform.OS === "web") {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      if (
        typeof blob.size === "number" &&
        Number.isFinite(blob.size) &&
        blob.size > 0
      ) {
        return blob.size;
      }
    } catch {
      // Fall through to null
    }
    return null;
  }

  // 3. Native fallback: Expo SDK 57 modern File API
  try {
    const file = new ExpoFile(uri);
    if (
      file.exists &&
      typeof file.size === "number" &&
      Number.isFinite(file.size) &&
      file.size > 0
    ) {
      return file.size;
    }
  } catch {
    // Fall through to legacy FileSystem
  }

  // 4. Native secondary fallback: expo-file-system/legacy getInfoAsync
  try {
    const info = await FileSystemLegacy.getInfoAsync(uri);
    if (
      info.exists &&
      typeof info.size === "number" &&
      Number.isFinite(info.size) &&
      info.size > 0
    ) {
      return info.size;
    }
  } catch {
    // Fall through
  }

  return null;
};

export const FileUploadCard: React.FC<FileUploadCardProps> = ({
  title,
  description,
  required = false,
  maxSizeBytes,
  uploadedDoc,
  onDocChange,
  error,
  onClearError,
  onError,
}) => {
  const effectiveMaxSize = maxSizeBytes ?? MAX_FILE_SIZE_BYTES;
  const maxMb = Math.round(effectiveMaxSize / (1024 * 1024));
  const docTypeInfo = uploadedDoc ? resolveDocType(uploadedDoc) : null;

  return (
    <GstDocumentCard
      maxSizeBytes={effectiveMaxSize}
      item={{
        id: title,
        name: title,
        subtitle: description,
        required,
        fileUri: uploadedDoc?.uri,
        fileName: uploadedDoc?.name,
        fileSize: uploadedDoc?.sizeFormatted,
        fileTypeLabel: docTypeInfo?.typeLabel,
        mimeType: uploadedDoc?.mimeType || docTypeInfo?.resolvedMime,
        errorMessage: error,
      }}
      onUploadSuccess={async (_id, asset) => {
        try {
          const sizeInBytes = await resolveFileSizeInBytes(asset.uri, asset.rawSizeBytes);
          if (
            typeof sizeInBytes !== "number" ||
            !Number.isFinite(sizeInBytes) ||
            sizeInBytes <= 0
          ) {
            onError?.("Unable to verify document file size. Please re-select the document.");
            return;
          }

          if (sizeInBytes > effectiveMaxSize) {
            onError?.(`File exceeds ${maxMb} MB limit. Please select a smaller file.`);
            return;
          }

          onDocChange({
            uri: asset.uri,
            name: asset.name,
            size: sizeInBytes,
            sizeFormatted: asset.size || formatFileSize(sizeInBytes),
            mimeType: asset.mimeType,
          });
          onClearError?.();
        } catch {
          onError?.("Unable to verify document file size. Please re-select the document.");
        }
      }}
      onUploadError={(_id, message) => {
        onError?.(message);
      }}
      onRemove={() => {
        onDocChange(null);
        onClearError?.();
      }}
    />
  );
};

export default FileUploadCard;
