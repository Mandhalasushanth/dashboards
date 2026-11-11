import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "@/hooks/use-theme";
import { PrimaryButton } from "@/shared/components/Button/PrimaryButton";
import { SecondaryButton } from "@/shared/components/Button/SecondaryButton";
import type { ApplicationDocument, IconName } from "@/shared/types/domain";
import {
  styles,
  CATEGORIES,
  KYC_KEYWORDS,
  GST_KEYWORDS,
} from "./DocumentChecklist.styles";
import { logger } from "@/core/logging/logger";
import { getErrorMessage } from "@/core/error-handling/errorMessage";

export interface DocumentChecklistProps {
  documents: ApplicationDocument[];
  onUpload: (docName: string, fileUri: string) => void;
  grouped?: boolean;
}

export function DocumentChecklist({
  documents,
  onUpload,
  grouped = true,
}: DocumentChecklistProps) {
  const colors = useTheme();
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadPress = useCallback((docName: string) => {
    setSelectedDoc(docName);
    setShowSourceModal(true);
  }, []);

  const handlePickDocument = useCallback(async () => {
    setShowSourceModal(false);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPreviewUri(result.assets[0].uri);
        setShowPreviewModal(true);
      }
    } catch (error) {
      logger.error("Document pick error", { error: getErrorMessage(error) });
      Alert.alert("Error", "Failed to pick document");
    }
  }, []);

  const handlePickImage = useCallback(async (useCamera: boolean) => {
    setShowSourceModal(false);
    try {
      let result: ImagePicker.ImagePickerResult;
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Denied",
            "Camera access is required to take photos"
          );
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          quality: 0.8,
        });
      } else {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Denied",
            "Gallery access is required to choose photos"
          );
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPreviewUri(result.assets[0].uri);
        setShowPreviewModal(true);
      }
    } catch (error) {
      logger.error("Image pick error", { error: getErrorMessage(error) });
      Alert.alert("Error", "Failed to capture image");
    }
  }, []);

  const handleConfirmUpload = useCallback(() => {
    if (!selectedDoc || !previewUri) return;

    setIsUploading(true);
    try {
      setTimeout(() => {
        onUpload(selectedDoc, previewUri);
        setIsUploading(false);
        setShowPreviewModal(false);
        setPreviewUri(null);
        setSelectedDoc(null);
        Alert.alert("Success", "Document uploaded successfully");
      }, 1500);
    } catch (error) {
      setIsUploading(false);
      logger.error("Upload confirmation error", { error: getErrorMessage(error) });
      Alert.alert("Error", "Failed to confirm upload");
    }
  }, [selectedDoc, previewUri, onUpload]);

  const getDocumentCategory = (name: string): string => {
    const lowerName = name.toLowerCase();
    if (KYC_KEYWORDS.some((kw) => lowerName.includes(kw))) {
      return "KYC Documents";
    }
    if (GST_KEYWORDS.some((kw) => lowerName.includes(kw))) {
      return "GST Documents";
    }
    return "Financial Documents";
  };

  const renderDocItem = (doc: ApplicationDocument, idx: number) => {
    const isUploaded = doc.status === "Uploaded";
    const isRejected = doc.status === "Rejected";

    let statusIcon: IconName = "time-outline";
    let statusColor: string = colors.textSecondary;
    let cardBg = colors.background;

    if (isUploaded) {
      statusIcon = "checkmark-circle";
      statusColor = colors.success;
    } else if (isRejected) {
      statusIcon = "close-circle";
      statusColor = colors.error;
      cardBg = `${colors.error}08`;
    }

    return (
      <View
        key={idx}
        style={[
          styles.docCard,
          {
            backgroundColor: cardBg,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.docInfo}>
          <Ionicons name={statusIcon} size={20} color={statusColor} />
          <View style={styles.textContainer}>
            <Text style={[styles.docName, { color: colors.text }]}>
              {doc.name}
            </Text>
          </View>
        </View>

        {!isUploaded ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleUploadPress(doc.name)}
            style={[
              styles.uploadBtn,
              {
                backgroundColor: colors.orangeLight,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Upload ${doc.name}`}
          >
            <Text style={[styles.uploadBtnText, { color: colors.orange }]}>
              Upload
            </Text>
            <Ionicons
              name="cloud-upload-outline"
              size={14}
              color={colors.orange}
            />
          </TouchableOpacity>
        ) : (
          <Ionicons name="checkmark-done" size={18} color={colors.success} />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {!grouped && (
        <View style={styles.docsList}>
          {documents.map((doc, idx) => renderDocItem(doc, idx))}
        </View>
      )}

      {grouped &&
        CATEGORIES.map((category) => {
          const categoryDocs = documents.filter(
            (doc) => getDocumentCategory(doc.name) === category
          );
          if (categoryDocs.length === 0) return null;

          return (
            <View key={category} style={styles.categorySection}>
              <Text style={[styles.categoryTitle, { color: colors.text }]}>
                {category}
              </Text>
              <View style={styles.docsList}>
                {categoryDocs.map((doc, idx) => renderDocItem(doc, idx))}
              </View>
            </View>
          );
        })}

      {/* Select Source Modal */}
      <Modal
        visible={showSourceModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSourceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.sourceModalContainer,
              { backgroundColor: colors.backgroundElement },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Upload Document
            </Text>
            <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
              Choose source for {selectedDoc}
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handlePickImage(true)}
              style={[styles.sourceBtn, { borderColor: colors.border }]}
              accessibilityRole="button"
              accessibilityLabel="Open Camera"
            >
              <Ionicons
                name="camera-outline"
                size={24}
                color={colors.orange}
              />
              <Text style={[styles.sourceBtnText, { color: colors.text }]}>
                Camera
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handlePickImage(false)}
              style={[styles.sourceBtn, { borderColor: colors.border }]}
              accessibilityRole="button"
              accessibilityLabel="Open Gallery"
            >
              <Ionicons
                name="image-outline"
                size={24}
                color={colors.orange}
              />
              <Text style={[styles.sourceBtnText, { color: colors.text }]}>
                Gallery
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handlePickDocument}
              style={[styles.sourceBtn, { borderColor: colors.border }]}
              accessibilityRole="button"
              accessibilityLabel="Choose File"
            >
              <Ionicons
                name="document-outline"
                size={24}
                color={colors.orange}
              />
              <Text style={[styles.sourceBtnText, { color: colors.text }]}>
                Files
              </Text>
            </TouchableOpacity>

            <SecondaryButton
              title="Cancel"
              onPress={() => setShowSourceModal(false)}
              style={{ marginTop: 8 }}
            />
          </View>
        </View>
      </Modal>

      {/* Preview Modal */}
      <Modal
        visible={showPreviewModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPreviewModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.previewModalContainer,
              { backgroundColor: colors.backgroundElement },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Preview Upload
            </Text>
            <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
              {selectedDoc}
            </Text>

            <View
              style={[styles.previewBox, { borderColor: colors.border }]}
            >
              {previewUri &&
              (previewUri.endsWith(".jpg") ||
                previewUri.endsWith(".png") ||
                previewUri.endsWith(".jpeg") ||
                previewUri.startsWith("content://media")) ? (
                <Image
                  source={{ uri: previewUri }}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.filePlaceholder}>
                  <Ionicons
                    name="document-text"
                    size={64}
                    color={colors.textSecondary}
                  />
                  <Text style={[styles.fileText, { color: colors.text }]}>
                    Document File Selected
                  </Text>
                  <Text
                    style={[styles.fileUri, { color: colors.textSecondary }]}
                    numberOfLines={1}
                  >
                    {previewUri}
                  </Text>
                </View>
              )}
            </View>

            {isUploading ? (
              <View style={styles.uploadingState}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text
                  style={[styles.uploadingText, { color: colors.text }]}
                >
                  Uploading document...
                </Text>
              </View>
            ) : (
              <View style={styles.btnRow}>
                <SecondaryButton
                  title="Retake"
                  onPress={() => {
                    setShowPreviewModal(false);
                    setShowSourceModal(true);
                  }}
                  style={{ flex: 1 }}
                />
                <PrimaryButton
                  title="Confirm"
                  onPress={handleConfirmUpload}
                  style={{ flex: 1 }}
                />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default DocumentChecklist;
