import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  ActivityIndicator,
  Alert,
  TouchableWithoutFeedback,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Sharing from "expo-sharing";
import { styles } from "./ViewDocumentModal.styles";

interface ViewDocumentModalProps {
  visible: boolean;
  title: string;
  fileUri?: string;
  fileName?: string;
  fileSize?: string;
  fileTypeLabel?: string;
  mimeType?: string;
  onClose: () => void;
}

function resolveIsImage(
  fileUri: string | undefined,
  mimeType: string | undefined,
  fileTypeLabel: string | undefined
): boolean {
  if (!fileUri) return false;
  if (mimeType?.startsWith("image/")) return true;
  const label = (fileTypeLabel || "").toUpperCase();
  if (label === "JPG" || label === "JPEG" || label === "PNG") return true;
  const lower = fileUri.toLowerCase();
  return lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png");
}

function resolveIsPdf(
  fileUri: string | undefined,
  mimeType: string | undefined,
  fileName: string | undefined
): boolean {
  if (mimeType === "application/pdf") return true;
  if ((fileName || "").toLowerCase().endsWith(".pdf")) return true;
  return (fileUri || "").toLowerCase().endsWith(".pdf");
}

export const ViewDocumentModal: React.FC<ViewDocumentModalProps> = ({
  visible,
  title,
  fileUri,
  fileName,
  fileSize,
  fileTypeLabel,
  mimeType,
  onClose,
}) => {
  const [opening, setOpening] = useState(false);

  const isImage = resolveIsImage(fileUri, mimeType, fileTypeLabel);
  const isPdf = !isImage && resolveIsPdf(fileUri, mimeType, fileName);

  const handleOpenPdf = async () => {
    if (!fileUri) return;
    setOpening(true);
    try {
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert(
          "Cannot Open PDF",
          "No PDF viewer is available on this device. Please install a PDF viewer app."
        );
        return;
      }
      await Sharing.shareAsync(fileUri, {
        mimeType: mimeType || "application/pdf",
        dialogTitle: title,
      });
    } catch {
      Alert.alert("Open Failed", "Could not open the PDF. The file may have been moved or deleted.");
    } finally {
      setOpening(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title} numberOfLines={1}>
                  {title}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onClose}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Preview Area */}
              <View style={styles.previewBox}>
                {isImage && fileUri ? (
                  <Image source={{ uri: fileUri }} style={styles.previewImage} />
                ) : (
                  <View style={styles.placeholderBox}>
                    <Ionicons
                      name={isPdf ? "document-text" : "document-attach-outline"}
                      size={54}
                      color={isPdf ? "#EF4444" : "#083B75"}
                    />
                    <Text style={styles.placeholderText}>
                      {isPdf ? "PDF Document" : (fileTypeLabel || "Document")}
                    </Text>
                  </View>
                )}
              </View>

              {/* File metadata */}
              {(fileName || fileSize) && (
                <View style={styles.metaContainer}>
                  {fileName ? (
                    <Text style={styles.fileNameText} numberOfLines={1}>
                      {fileName}
                    </Text>
                  ) : null}
                  {fileSize ? (
                    <Text style={styles.fileMetaText}>{fileSize}</Text>
                  ) : null}
                </View>
              )}

              {/* PDF Open action */}
              {isPdf && fileUri ? (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleOpenPdf}
                  style={styles.openPdfButton}
                  disabled={opening}
                >
                  {opening ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="open-outline" size={16} color="#FFFFFF" />
                      <Text style={styles.openPdfButtonText}>Open PDF Viewer</Text>
                    </>
                  )}
                </TouchableOpacity>
              ) : null}

              {/* Done Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onClose}
                style={styles.doneButton}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ViewDocumentModal;
