import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { pickDocumentFromDrive } from "@/shared/utils/driveDocumentUploader";

// Import existing Modals
import { UploadSourceModal } from "@/modules/itr/tds/components/documents/UploadSourceModal";
import { RemoveConfirmModal } from "@/modules/itr/tds/components/documents/RemoveConfirmModal";
import { ViewDocumentModal } from "@/modules/itr/tds/components/documents/ViewDocumentModal";
import {
  ITR_ALLOWED_EXTENSIONS,
  resolveItrMimeType,
  resolveExtensionFromMime,
  getFileExtension,
  isItrSupportedFile,
} from "@/modules/itr/utils/itrDocumentUploadHelper";

import { styles } from "./SharedItrDocumentCard.styles";

const DEFAULT_EXTENSIONS = [...ITR_ALLOWED_EXTENSIONS];
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB

export interface SharedDocumentItem {
  id: string;
  title: string;
  subtitle?: string;
  isMandatory?: boolean;
  status?: string;
  fileUri?: string;
  fileName?: string;
  fileSize?: string;
  mimeType?: string;
  errorMessage?: string;
  iconType?: any;
}

interface SharedItrDocumentCardProps {
  item: SharedDocumentItem;
  variant?: "default" | "inline";
  allowedExtensions?: string[];
  maxSizeBytes?: number;
  onUploadSuccess: (
    id: string,
    payload: { uri: string; name: string; size: string; mimeType?: string; fileTypeLabel?: string }
  ) => void;
  onRemove: (id: string) => void;
}

const getDocIconConfig = (title: string, id: string) => {
  const lower = `${title} ${id}`.toLowerCase();
  if (lower.includes("16") || lower.includes("salary")) {
    return { name: "document-text" as const, color: "#0284C7", bg: "#E0F2FE" };
  }
  if (lower.includes("26as") || lower.includes("credit")) {
    return { name: "receipt" as const, color: "#D97706", bg: "#FEF3C7" };
  }
  if (lower.includes("ais") || lower.includes("tis")) {
    return { name: "analytics" as const, color: "#4F46E5", bg: "#EEF2FF" };
  }
  if (lower.includes("bank") || lower.includes("statement")) {
    return { name: "wallet" as const, color: "#059669", bg: "#ECFDF5" };
  }
  if (lower.includes("payslip")) {
    return { name: "cash" as const, color: "#10B981", bg: "#D1FAE5" };
  }
  if (lower.includes("capital") || lower.includes("gain") || lower.includes("p&l") || lower.includes("broker")) {
    return { name: "trending-up" as const, color: "#7C3AED", bg: "#F3E8FF" };
  }
  if (lower.includes("pan") || lower.includes("aadhaar") || lower.includes("identity")) {
    return { name: "id-card" as const, color: "#083B75", bg: "#E0E7FF" };
  }
  return { name: "document-attach" as const, color: "#2563EB", bg: "#EFF6FF" };
};

export const SharedItrDocumentCard: React.FC<SharedItrDocumentCardProps> = ({
  item,
  variant = "default",
  allowedExtensions,
  maxSizeBytes,
  onUploadSuccess,
  onRemove,
}) => {
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const isUploaded = item.status === "uploaded" || !!item.fileUri;
  const hasError = item.status === "rejected" || !!item.errorMessage;

  const onUploadError = (err: string) => {
    Alert.alert("Upload Error", err);
  };

  const validateAndProcessFile = (
    asset: { uri: string; name?: string; size?: number; mimeType?: string },
    defaultName: string
  ) => {
    const fileName = asset.name || defaultName;
    const extension = getFileExtension(fileName);
    const resolvedExt = extension || resolveExtensionFromMime(asset.mimeType);

    const effectiveAllowed = allowedExtensions || DEFAULT_EXTENSIONS;
    const isValidFormat =
      isItrSupportedFile(fileName, asset.mimeType) &&
      (effectiveAllowed as readonly string[]).includes(resolvedExt);

    if (!isValidFormat) {
      const allowedStr = effectiveAllowed.map((e) => e.toUpperCase()).join(", ");
      onUploadError(`Unsupported file (.${extension || resolvedExt || "unknown"}). Accepted: ${allowedStr}`);
      return;
    }

    const effectiveMaxBytes = maxSizeBytes ?? MAX_FILE_SIZE_BYTES;
    if (asset.size && asset.size > effectiveMaxBytes) {
      const limitMb = Math.round(effectiveMaxBytes / (1024 * 1024));
      onUploadError(`File exceeds ${limitMb} MB limit. Please select a smaller file.`);
      return;
    }

    const resolvedMime = resolveItrMimeType(fileName, asset.mimeType);
    const resolvedName = fileName.includes(".") ? fileName : `${fileName}.${resolvedExt}`;

    const sizeInMb = asset.size
      ? `${(asset.size / (1024 * 1024)).toFixed(2)} MB`
      : "2.4 MB";

    onUploadSuccess(item.id, {
      uri: asset.uri,
      name: resolvedName,
      size: sizeInMb,
      mimeType: resolvedMime,
      fileTypeLabel: (extension || resolvedExt).toUpperCase() || "FILE",
    });
  };

  const handleChooseFiles = async () => {
    setShowSourceModal(false);
    try {
      const effectiveMaxBytes = maxSizeBytes ?? MAX_FILE_SIZE_BYTES;
      const effectiveAllowed = allowedExtensions || DEFAULT_EXTENSIONS;
      const picked = await pickDocumentFromDrive({
        maxSizeBytes: effectiveMaxBytes,
        allowedExtensions: effectiveAllowed,
      });

      if (picked) {
        if (picked.sizeBytes > effectiveMaxBytes) {
          const limitMb = Math.round(effectiveMaxBytes / (1024 * 1024));
          Alert.alert("File Too Large", `File size exceeds the ${limitMb} MB limit.`);
          onUploadError(`File exceeds ${limitMb} MB limit. Please select a smaller file.`);
          return;
        }

        const resolvedMime = resolveItrMimeType(picked.name, picked.mimeType);
        onUploadSuccess(item.id, {
          uri: picked.uri,
          name: picked.name,
          size: picked.size,
          mimeType: resolvedMime,
          fileTypeLabel: picked.fileTypeLabel,
        });
      }
    } catch {
      onUploadError("Could not open document picker. Please try again.");
    }
  };

  const handlePickGallery = async () => {
    setShowSourceModal(false);
    try {
      const currentPerm = await ImagePicker.getMediaLibraryPermissionsAsync();
      let granted = currentPerm.granted;

      if (!granted && currentPerm.canAskAgain) {
        const req = await ImagePicker.requestMediaLibraryPermissionsAsync();
        granted = req.granted;
      }

      if (!granted) {
        Alert.alert(
          "Permission Required",
          "Photo library permission is needed to select documents."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.85,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      const safeId = item.id.replace(/[^a-zA-Z0-9_-]/g, "_");
      const fallbackName = `${safeId}_gallery_${Date.now()}.jpg`;
      const fileName = asset.fileName || fallbackName;
      const rawBytes =
        typeof asset.fileSize === "number" && Number.isFinite(asset.fileSize)
          ? asset.fileSize
          : undefined;

      validateAndProcessFile(
        {
          uri: asset.uri,
          name: fileName,
          size: rawBytes,
          mimeType: asset.mimeType || "image/jpeg",
        },
        fileName
      );
    } catch {
      onUploadError("Could not open photo gallery. Please try again.");
    }
  };

  const handleTakePhoto = async () => {
    setShowSourceModal(false);
    try {
      const currentPerm = await ImagePicker.getCameraPermissionsAsync();
      let granted = currentPerm.granted;

      if (!granted && currentPerm.canAskAgain) {
        const req = await ImagePicker.requestCameraPermissionsAsync();
        granted = req.granted;
      }

      if (!granted) {
        Alert.alert(
          "Permission Required",
          "Camera permission is required to capture documents. Please enable camera access in your device settings."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.85,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      const safeId = item.id.replace(/[^a-zA-Z0-9_-]/g, "_");
      const fallbackName = `${safeId}_photo_${Date.now()}.jpg`;
      const fileName = asset.fileName || fallbackName;
      const rawBytes =
        typeof asset.fileSize === "number" && Number.isFinite(asset.fileSize)
          ? asset.fileSize
          : undefined;

      validateAndProcessFile(
        {
          uri: asset.uri,
          name: fileName,
          size: rawBytes,
          mimeType: asset.mimeType || "image/jpeg",
        },
        fileName
      );
    } catch {
      onUploadError("Could not open camera. Please try again.");
    }
  };

  const handleConfirmRemove = () => {
    setShowRemoveModal(false);
    onRemove(item.id);
  };

  const renderModals = () => (
    <>
      <UploadSourceModal
        visible={showSourceModal}
        documentTitle={item.title}
        maxSizeText={`${Math.round((maxSizeBytes ?? MAX_FILE_SIZE_BYTES) / (1024 * 1024))} MB`}
        onChooseFiles={handleChooseFiles}
        onSelectGallery={handlePickGallery}
        onTakePhoto={handleTakePhoto}
        onClose={() => setShowSourceModal(false)}
      />

      <RemoveConfirmModal
        visible={showRemoveModal}
        title={item.title}
        onConfirm={handleConfirmRemove}
        onCancel={() => setShowRemoveModal(false)}
      />

      {item.fileUri && (
        <ViewDocumentModal
          visible={showViewModal}
          fileUri={item.fileUri}
          title={item.title}
          fileName={item.fileName}
          fileSize={item.fileSize}
          mimeType={item.mimeType}
          onClose={() => setShowViewModal(false)}
        />
      )}
    </>
  );

  if (variant === "inline") {
    return (
      <View style={{ flexDirection: "column" }}>
        {!isUploaded ? (
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setShowSourceModal(true)}
            style={[styles.uploadButton, { alignSelf: 'center', marginLeft: 0, marginVertical: 0, paddingVertical: 4, paddingHorizontal: 12, minWidth: 0, height: 32, borderRadius: 16 }]}
          >
            <Ionicons name="arrow-up" size={14} color="#4338CA" />
            <Text style={[styles.uploadButtonText, { fontSize: 12 }]}>Upload</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
            <Text numberOfLines={1} style={{ fontSize: 11, color: '#059669', maxWidth: 100 }}>
              {item.fileName || "Uploaded"}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <TouchableOpacity onPress={() => setShowViewModal(true)} style={[styles.viewButton, { paddingHorizontal: 8, paddingVertical: 4, height: 32, borderRadius: 16 }]}>
                <Ionicons name="eye-outline" size={14} color="#1E3A8A" />
              </TouchableOpacity>
  
              <TouchableOpacity onPress={() => setShowSourceModal(true)} style={[styles.changeButton, { paddingHorizontal: 8, paddingVertical: 4, height: 32, borderRadius: 16 }]}>
                <Ionicons name="swap-horizontal" size={14} color="#D97706" />
              </TouchableOpacity>
  
              <TouchableOpacity onPress={() => setShowRemoveModal(true)} style={[styles.trashButton, { width: 32, height: 32, borderRadius: 10 }]}>
                <Ionicons name="trash-outline" size={14} color="#DC2626" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {hasError && (
          <View style={[styles.inlineErrorRow, { paddingHorizontal: 0, marginTop: 4, borderTopWidth: 0, paddingTop: 0 }]}>
            <Ionicons name="alert-circle" size={14} color="#DC2626" style={styles.errorIcon} />
            <Text style={styles.inlineErrorText}>{item.errorMessage || "Error uploading."}</Text>
          </View>
        )}

        {renderModals()}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.card,
        isUploaded && styles.cardUploaded,
        hasError && styles.cardError,
      ]}
    >
      <View style={styles.topRow}>
        <View
          style={[
            styles.iconContainer,
            isUploaded
              ? styles.iconContainerUploaded
              : { backgroundColor: getDocIconConfig(item.title, item.id).bg },
          ]}
        >
          <Ionicons
            name={
              isUploaded
                ? "document-text"
                : getDocIconConfig(item.title, item.id).name
            }
            size={22}
            color={
              isUploaded
                ? "#16A34A"
                : getDocIconConfig(item.title, item.id).color
            }
          />
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            {item.title}
            {item.isMandatory ? (
              <Text style={styles.requiredAsterisk}> *</Text>
            ) : (
              <Text style={styles.optionalLabel}> (optional)</Text>
            )}
          </Text>

          <Text style={styles.subtitle} numberOfLines={1}>
            {item.subtitle || `Document for verification`}
          </Text>

          {isUploaded && (
            <View style={styles.uploadedFileRow}>
              <Ionicons
                name="checkmark-circle"
                size={14}
                color="#059669"
                style={styles.checkDot}
              />
              <Text style={styles.uploadedFileName} numberOfLines={1}>
                {`${item.fileName || "Uploaded document"} (${item.fileSize || "2.4 MB"})`}
              </Text>
            </View>
          )}
        </View>

        {!isUploaded && (
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setShowSourceModal(true)}
            style={styles.uploadButton}
          >
            <Ionicons name="arrow-up" size={14} color="#4338CA" />
            <Text style={styles.uploadButtonText}>Upload</Text>
          </TouchableOpacity>
        )}
      </View>

      {isUploaded && (
        <View style={styles.uploadedActionsRow}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setShowViewModal(true)}
            style={styles.viewButton}
          >
            <Ionicons name="eye-outline" size={15} color="#1E3A8A" />
            <Text style={styles.viewButtonText}>View</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setShowSourceModal(true)}
            style={styles.changeButton}
          >
            <Ionicons name="swap-horizontal" size={15} color="#D97706" />
            <Text style={styles.changeButtonText}>Change</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setShowRemoveModal(true)}
            style={styles.trashButton}
          >
            <Ionicons name="trash-outline" size={16} color="#DC2626" />
          </TouchableOpacity>
        </View>
      )}

      {hasError && (
        <View style={styles.inlineErrorRow}>
          <Ionicons name="alert-circle" size={14} color="#DC2626" style={styles.errorIcon} />
          <Text style={styles.inlineErrorText}>{item.errorMessage || "Document was rejected. Please re-upload."}</Text>
        </View>
      )}

      <UploadSourceModal
        visible={showSourceModal}
        documentTitle={item.title}
        maxSizeText={`${Math.round((maxSizeBytes ?? MAX_FILE_SIZE_BYTES) / (1024 * 1024))} MB`}
        onChooseFiles={handleChooseFiles}
        onSelectGallery={handlePickGallery}
        onTakePhoto={handleTakePhoto}
        onClose={() => setShowSourceModal(false)}
      />

      <RemoveConfirmModal
        visible={showRemoveModal}
        title={item.title}
        onConfirm={handleConfirmRemove}
        onCancel={() => setShowRemoveModal(false)}
      />

      {item.fileUri && (
        <ViewDocumentModal
          visible={showViewModal}
          fileUri={item.fileUri}
          title={item.title}
          fileName={item.fileName}
          fileSize={item.fileSize}
          mimeType={item.mimeType}
          onClose={() => setShowViewModal(false)}
        />
      )}
    </View>
  );
};
