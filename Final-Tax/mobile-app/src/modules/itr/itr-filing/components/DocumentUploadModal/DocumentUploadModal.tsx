import React from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { pickDocumentFromDrive } from "@/shared/utils/driveDocumentUploader";
import { DocumentUploadBottomSheet } from "@/modules/itr/tds/components/upload/DocumentUploadBottomSheet/DocumentUploadBottomSheet";
import {
  ITR_ALLOWED_EXTENSIONS,
  resolveItrMimeType,
  isItrSupportedFile,
  getItrAcceptedFormatsString,
} from "@/modules/itr/utils/itrDocumentUploadHelper";

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB

export interface UploadedFileInfo {
  uri: string;
  name: string;
  size: string;
  mimeType?: string;
}

interface DocumentUploadModalProps {
  visible: boolean;
  docTitle?: string;
  onClose: () => void;
  onFilePicked: (file: UploadedFileInfo) => void;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  visible,
  docTitle = "Document",
  onClose,
  onFilePicked,
}) => {
  const checkSizeAndProceed = async (
    uri: string,
    name: string,
    providedSize?: number,
    mimeType?: string
  ): Promise<boolean> => {
    if (!isItrSupportedFile(name, mimeType)) {
      Alert.alert(
        "Unsupported File Format",
        `Please select a supported file (${getItrAcceptedFormatsString()}).`
      );
      return false;
    }

    let sizeInBytes = providedSize;

    if (!sizeInBytes) {
      try {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (fileInfo.exists && (fileInfo as any).size) {
          sizeInBytes = (fileInfo as any).size;
        }
      } catch {
        // Fallback if FileSystem check is unavailable
        sizeInBytes = 500 * 1024;
      }
    }

    if (sizeInBytes && sizeInBytes > MAX_FILE_SIZE_BYTES) {
      Alert.alert(
        "File Too Large",
        "The selected file exceeds 15 MB. Please select a smaller file (under 15 MB) to proceed."
      );
      return false;
    }

    const formattedSize = sizeInBytes
      ? `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`
      : "1.2 MB";

    const resolvedMime = resolveItrMimeType(name, mimeType);

    onFilePicked({
      uri,
      name,
      size: formattedSize,
      mimeType: resolvedMime,
    });
    onClose();
    return true;
  };

  // Option 1: Pick from Files / Drive
  const handlePickDocument = async () => {
    try {
      const picked = await pickDocumentFromDrive({
        maxSizeBytes: MAX_FILE_SIZE_BYTES,
        allowedExtensions: [...ITR_ALLOWED_EXTENSIONS],
      });

      if (picked) {
        onFilePicked({
          uri: picked.uri,
          name: picked.name,
          size: picked.size,
          mimeType: resolveItrMimeType(picked.name, picked.mimeType),
        });
        onClose();
      }
    } catch {
      Alert.alert("File Selection Error", "Could not select the document. Please try again.");
    }
  };

  // Option 2: Pick from Photo Gallery
  const handlePickGallery = async () => {
    try {
      const currentPerm = await ImagePicker.getMediaLibraryPermissionsAsync();
      let granted = currentPerm.granted;

      if (!granted && currentPerm.canAskAgain) {
        const req = await ImagePicker.requestMediaLibraryPermissionsAsync();
        granted = req.granted;
      }

      if (!granted) {
        Alert.alert("Permission Required", "Photo library permission is needed to upload documents.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName = asset.fileName || `document_${Date.now()}.jpg`;
        await checkSizeAndProceed(
          asset.uri,
          fileName,
          (asset as any).fileSize,
          asset.mimeType || "image/jpeg"
        );
      }
    } catch {
      Alert.alert("Gallery Error", "Could not open photo gallery. Please try again.");
    }
  };

  // Option 3: Take Photo with Camera (GST-aligned robust handling)
  const handlePickCamera = async () => {
    try {
      const currentPerm = await ImagePicker.getCameraPermissionsAsync();
      let granted = currentPerm.granted;

      if (!granted && currentPerm.canAskAgain) {
        const req = await ImagePicker.requestCameraPermissionsAsync();
        granted = req.granted;
      }

      if (!granted) {
        Alert.alert("Permission Required", "Camera permission is needed to photograph documents.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName = asset.fileName || `camera_doc_${Date.now()}.jpg`;
        await checkSizeAndProceed(
          asset.uri,
          fileName,
          (asset as any).fileSize,
          asset.mimeType || "image/jpeg"
        );
      }
    } catch {
      Alert.alert("Camera Error", "Could not open camera. Please try again.");
    }
  };

  return (
    <DocumentUploadBottomSheet
      visible={visible}
      documentTitle={docTitle}
      maxSizeBytesText="15 MB"
      onClose={onClose}
      onPickFiles={handlePickDocument}
      onPickGallery={handlePickGallery}
      onTakePhoto={handlePickCamera}
    />
  );
};
