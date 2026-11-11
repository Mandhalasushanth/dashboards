import React from "react";
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Sharing from "expo-sharing";
import {
  styles,
  previewModalColors,
  closeButtonHitSlop,
} from "./DocumentPreviewModal.styles";
import { homeLoanStyles } from "./DocumentPreviewModal.homeLoan.styles";
import type {
  PreviewDocumentItem,
  DocumentPreviewModalProps,
  DocumentPreviewVariant,
} from "./types";

/** Placeholder URIs used by demo data; they cannot be rendered or shared. */
const MOCK_URI_PREFIX = "file:///mock";

/** Loans image detection: by URI/file-name extension only (no MIME check). */
const isLoanImageFile = (fileUri: string, fileName: string): boolean => {
  const lowerName = fileName.toLowerCase();
  return (
    fileUri.endsWith(".jpg") ||
    fileUri.endsWith(".jpeg") ||
    fileUri.endsWith(".png") ||
    lowerName.endsWith(".jpg") ||
    lowerName.endsWith(".png")
  );
};

const resolveVariant = (
  variant: DocumentPreviewVariant,
  document: PreviewDocumentItem,
  hasChangeFile: boolean
): Exclude<DocumentPreviewVariant, "auto"> => {
  if (variant !== "auto") return variant;
  if (hasChangeFile) return "itr";
  if (document.uploadedFileName || document.uploadedFileUri) return "project-finance";
  return "loans";
};

export const DocumentPreviewModal = <T extends PreviewDocumentItem = PreviewDocumentItem>({
  visible,
  document,
  onClose,
  onChangeFile,
  variant = "auto",
}: DocumentPreviewModalProps<T>): React.ReactElement | null => {
  if (!document) return null;

  const resolvedVariant = resolveVariant(variant, document, Boolean(onChangeFile));

  // --- 1. ITR Variant (Used by ITR and Company Registration) ---
  if (resolvedVariant === "itr") {
    if (!document.fileUri) return null;

    const isImage =
      document.fileUri.endsWith(".jpg") ||
      document.fileUri.endsWith(".jpeg") ||
      document.fileUri.endsWith(".png") ||
      Boolean(document.mimeType && document.mimeType.startsWith("image/"));

    const handleOpenPdf = async () => {
      try {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(document.fileUri!);
        } else {
          Alert.alert("Viewer", `Unable to open an external viewer for ${document.fileName || "this file"}`);
        }
      } catch {
        Alert.alert("Viewer", `Unable to open ${document.fileName || "the file"}`);
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
              <View style={styles.contentContainer}>
                {/* Header */}
                <View style={styles.headerRow}>
                  <View style={styles.titleCol}>
                    <Text style={styles.docTitle} numberOfLines={1}>
                      {document.name}
                    </Text>
                    <Text style={styles.docMeta}>
                      {document.fileName || "Uploaded File"} • {document.fileSize || "< 2 MB"}
                    </Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={onClose}
                    style={styles.closeBtn}
                  >
                    <Ionicons name="close" size={22} color="#64748B" />
                  </TouchableOpacity>
                </View>

                {/* Preview Body */}
                <View style={styles.previewBox}>
                  {isImage ? (
                    <Image
                      source={{ uri: document.fileUri }}
                      style={styles.previewImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={styles.pdfCard}>
                      <Ionicons name="document-text" size={64} color="#EF4444" />
                      <Text style={styles.pdfTitle}>
                        {document.fileName || "PDF Document"}
                      </Text>
                      <Text style={styles.pdfSubtitle}>
                        Verified PDF format • Size: {document.fileSize || "1.2 MB"}
                      </Text>
                      <View style={styles.pdfVerifiedBadge}>
                        <Ionicons
                          name="checkmark-circle"
                          size={16}
                          color="#059669"
                        />
                        <Text style={styles.pdfVerifiedText}>
                          Ready for CA verification
                        </Text>
                      </View>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.changeBtn}
                        onPress={handleOpenPdf}
                      >
                        <Ionicons name="open-outline" size={16} color="#083B75" />
                        <Text style={styles.changeBtnText}>Open PDF Viewer</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsRow}>
                  {onChangeFile && (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.changeBtn}
                      onPress={() => {
                        onClose();
                        onChangeFile(document);
                      }}
                    >
                      <Ionicons
                        name="swap-horizontal-outline"
                        size={18}
                        color="#083B75"
                      />
                      <Text style={styles.changeBtnText}>Change File</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.doneBtn}
                    onPress={onClose}
                  >
                    <Text style={styles.doneBtnText}>Done</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  }

  // --- 2. Project Finance Variant ---
  if (resolvedVariant === "project-finance") {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <Pressable style={styles.pfOverlay} onPress={onClose}>
          <Pressable
            style={styles.pfContainer}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.pfHeader}>
              <Text style={styles.pfTitle}>Document Preview</Text>
              <TouchableOpacity onPress={onClose} style={styles.pfCloseBtn}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.pfBody}>
              <View style={styles.pfBadge}>
                <Ionicons name="document-text" size={30} color="#2563EB" />
              </View>
              <Text style={styles.pfDocTitle}>{document.name}</Text>
              <Text style={styles.pfFileName}>
                {document.uploadedFileName}
              </Text>

              <View style={styles.pfMetaBox}>
                <View style={styles.pfMetaRow}>
                  <Text style={styles.pfMetaLabel}>Category:</Text>
                  <Text style={styles.pfMetaValue}>{document.category}</Text>
                </View>
                <View style={styles.pfMetaRow}>
                  <Text style={styles.pfMetaLabel}>File Size:</Text>
                  <Text style={styles.pfMetaValue}>
                    {document.uploadedFileSize || "1.2 MB"}
                  </Text>
                </View>
                <View style={styles.pfMetaRow}>
                  <Text style={styles.pfMetaLabel}>Uploaded:</Text>
                  <Text style={styles.pfMetaValue}>
                    {document.uploadedAt || "Just now"}
                  </Text>
                </View>
                <View style={styles.pfMetaRow}>
                  <Text style={styles.pfMetaLabel}>Status:</Text>
                  <Text style={styles.pfStatusVerified}>✓ Verified & Attached</Text>
                </View>
              </View>
            </View>

            <View style={styles.pfFooter}>
              <TouchableOpacity
                style={styles.pfCloseActionBtn}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text style={styles.pfCloseActionText}>Close Preview</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    );
  }

  // --- 3. Loans Variants ("loans" default, "home-loan") ---
  const loanStyles = resolvedVariant === "home-loan" ? homeLoanStyles : styles;
  const fileName = document.fileName || document.name;
  const fileUri = document.fileUri || "";
  const isMockFile = !fileUri || fileUri.startsWith(MOCK_URI_PREFIX);
  const showImage = isLoanImageFile(fileUri, fileName) && !isMockFile;

  const handleOpenExternal = async () => {
    try {
      if (isMockFile) {
        Alert.alert(
          "Document Preview",
          `Previewing verified file:\n${fileName}\nSize: ${document.fileSize || "1.5 MB"}`
        );
        return;
      }
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
        return;
      }
      Alert.alert("Viewer", `Opening ${fileName}`);
    } catch {
      Alert.alert("Viewer", `Unable to open external viewer for ${fileName}`);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={loanStyles.backdrop}>
        <View style={loanStyles.modalContainer}>
          <View style={loanStyles.header}>
            <View style={loanStyles.headerLeft}>
              <Ionicons
                name="document-text-outline"
                size={20}
                color={previewModalColors.documentIcon}
              />
              <Text style={loanStyles.title} numberOfLines={1}>
                {document.name}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={loanStyles.closeBtn}
              hitSlop={closeButtonHitSlop}
            >
              <Ionicons
                name="close"
                size={22}
                color={previewModalColors.closeIcon}
              />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={loanStyles.content}>
            {showImage ? (
              <Image
                source={{ uri: fileUri }}
                style={loanStyles.imagePreview}
                resizeMode="contain"
              />
            ) : (
              <View style={loanStyles.docCard}>
                <View style={loanStyles.iconCircle}>
                  <Ionicons
                    name="document-text"
                    size={32}
                    color={previewModalColors.documentIcon}
                  />
                </View>

                <Text style={loanStyles.fileName} numberOfLines={2}>
                  {fileName}
                </Text>
                <Text style={loanStyles.fileMeta}>
                  {document.fileSize || "1.8 MB"} • {document.category}
                </Text>

                <View style={loanStyles.statusBadge}>
                  <Ionicons
                    name="shield-checkmark"
                    size={14}
                    color={previewModalColors.verifiedIcon}
                  />
                  <Text style={loanStyles.statusText}>Uploaded & Verified</Text>
                </View>

                <TouchableOpacity
                  style={loanStyles.shareBtn}
                  onPress={handleOpenExternal}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="open-outline"
                    size={16}
                    color={previewModalColors.shareIcon}
                  />
                  <Text style={loanStyles.shareBtnText}>Open / Share File</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          <View style={loanStyles.footer}>
            <TouchableOpacity
              style={loanStyles.closeActionBtn}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={loanStyles.closeActionText}>Close Preview</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DocumentPreviewModal;
