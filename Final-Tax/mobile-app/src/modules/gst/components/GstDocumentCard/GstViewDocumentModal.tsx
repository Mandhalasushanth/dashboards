import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  resolveDocType,
} from "../../gst-compliance/utils/gstPreviewUtils";
import { styles } from "./GstViewDocumentModal.styles";

export interface GstViewDocumentModalProps {
  visible: boolean;
  title: string;
  fileUri?: string;
  fileName?: string;
  fileSize?: string;
  fileTypeLabel?: string;
  mimeType?: string;
  onClose: () => void;
}

export const GstViewDocumentModal: React.FC<GstViewDocumentModalProps> = ({
  visible,
  title,
  fileUri,
  fileName,
  fileSize,
  fileTypeLabel,
  mimeType,
  onClose,
}) => {
  const [actionError, setActionError] = useState<string | null>(null);
  const [isIframeError, setIsIframeError] = useState<boolean>(false);
  const [isImageError, setIsImageError] = useState<boolean>(false);

  // Cache last active valid document on iOS during dismissal fade animation
  const lastValidDocRef = React.useRef<{
    fileUri?: string;
    fileName?: string;
    fileSize?: string;
    fileTypeLabel?: string;
    mimeType?: string;
    title?: string;
  }>({});

  if (visible && fileUri) {
    lastValidDocRef.current = {
      fileUri,
      fileName,
      fileSize,
      fileTypeLabel,
      mimeType,
      title,
    };
  }

  // Synchronously reset error flags on prop change to eliminate 1-frame error icon flashes on iOS
  const [prevUri, setPrevUri] = useState<string | undefined>(fileUri);
  const [prevVisible, setPrevVisible] = useState<boolean>(visible);
  if (fileUri !== prevUri || visible !== prevVisible) {
    setPrevUri(fileUri);
    setPrevVisible(visible);
    if (isImageError) setIsImageError(false);
    if (isIframeError) setIsIframeError(false);
    if (actionError) setActionError(null);
  }

  const handleClose = useCallback(() => {
    setActionError(null);
    setIsIframeError(false);
    setIsImageError(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (visible) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActionError(null);
      setIsIframeError(false);
      setIsImageError(false);
    }
  }, [visible, fileUri]);

  useEffect(() => {
    if (
      Platform.OS === "web" &&
      typeof window !== "undefined" &&
      fileUri?.startsWith("blob:")
    ) {
      fetch(fileUri, { method: "HEAD" }).catch(() => {
        setIsIframeError(true);
      });
    }
  }, [fileUri]);

  const isIos = Platform.OS === "ios";
  const activeFileUri =
    fileUri || (isIos && !visible ? lastValidDocRef.current.fileUri : undefined);
  const activeFileName =
    fileName || (isIos && !visible ? lastValidDocRef.current.fileName : undefined);
  const activeMimeType =
    mimeType || (isIos && !visible ? lastValidDocRef.current.mimeType : undefined);
  const activeFileTypeLabel =
    fileTypeLabel ||
    (isIos && !visible ? lastValidDocRef.current.fileTypeLabel : undefined);

  const docType = resolveDocType({
    name: activeFileName,
    uri: activeFileUri,
    mimeType: activeMimeType,
    fileTypeLabel: activeFileTypeLabel,
  });

  const isWebRenderableUri = Boolean(
    Platform.OS === "web" &&
      activeFileUri &&
      /^(blob:|https?:|data:)/i.test(activeFileUri)
  );

  const openWebDocument = useCallback(() => {
    if (Platform.OS === "web" && typeof window !== "undefined" && activeFileUri) {
      if (/^(blob:|https?:|data:)/i.test(activeFileUri)) {
        const opened = window.open(activeFileUri, "_blank", "noopener,noreferrer");
        if (!opened) {
          setActionError("Pop-up was blocked. Please allow pop-ups to open the document.");
        }
      } else {
        setActionError("Direct browser opening is not supported for this file scheme.");
      }
    }
  }, [activeFileUri]);

  const handleOpenInNewTab = openWebDocument;

  const renderPreviewContent = () => {
    if (!activeFileUri) {
      if (isIos && !visible) {
        return <View style={styles.fallbackBox} />;
      }
      return (
        <View style={styles.fallbackBox}>
          <Ionicons name="alert-circle-outline" size={48} color="#DC2626" />
          <Text style={styles.fallbackTitle}>Document Unavailable</Text>
          <Text style={styles.fallbackNotice}>
            The document location is missing or the file session has expired.
          </Text>
        </View>
      );
    }

    if (docType.isImage) {
      if (isImageError) {
        return (
          <View style={styles.fallbackBox}>
            <Ionicons name="image-outline" size={44} color="#EF4444" />
            <Text style={styles.fallbackTitle}>Image Preview Unavailable</Text>
            <Text style={styles.fallbackNotice}>
              Could not display the image preview.
            </Text>
          </View>
        );
      }
      return (
        <Image
          source={{ uri: activeFileUri }}
          style={styles.previewImage}
          resizeMode="contain"
          fadeDuration={Platform.OS === "android" ? 300 : 0}
          onError={() => setIsImageError(true)}
        />
      );
    }

    if (Platform.OS === "web" && isWebRenderableUri && docType.isPdf) {
      if (isIframeError) {
        return (
          <View style={styles.fallbackBox}>
            <Ionicons name="alert-circle-outline" size={40} color="#DC2626" />
            <Text style={styles.fallbackTitle}>Preview Unavailable</Text>
            <Text style={styles.fallbackNotice}>
              Inline browser preview failed or file session expired.
            </Text>
            <TouchableOpacity
              style={styles.openActionButton}
              activeOpacity={0.8}
              onPress={handleOpenInNewTab}
            >
              <Ionicons name="open-outline" size={16} color="#FFFFFF" />
              <Text style={styles.openActionButtonText}>Open in New Tab</Text>
            </TouchableOpacity>
          </View>
        );
      }

      return (
        <View style={styles.webPdfBox}>
          {React.createElement("iframe", {
            src: activeFileUri,
            title: activeFileName || title,
            onError: () => setIsIframeError(true),
            style: { width: "100%", height: 260, border: "none", borderRadius: 8 },
          })}
          <View style={styles.webActionRow}>
            <TouchableOpacity
              style={styles.webOpenTabButton}
              activeOpacity={0.75}
              onPress={handleOpenInNewTab}
            >
              <Ionicons name="open-outline" size={14} color="#1D4ED8" />
              <Text style={styles.webOpenTabButtonText}>Open in New Tab</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }


    return (
      <View style={styles.fallbackBox}>
        <Ionicons
          name={docType.isSpreadsheet ? "grid-outline" : "document-text-outline"}
          size={48}
          color="#083B75"
        />
        <Text style={styles.fallbackTitle}>{docType.typeLabel}</Text>
        <Text style={styles.fallbackNotice}>
          {docType.isSpreadsheet
            ? "Spreadsheet preview is not supported inside the application."
            : "Document is uploaded and verified."}
        </Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title} numberOfLines={2} ellipsizeMode="middle">
                  {title}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleClose}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Preview Area */}
              <View style={styles.previewBox}>
                {renderPreviewContent()}
              </View>

              {/* Action Error Banner */}
              {actionError ? (
                <View style={styles.actionErrorBox}>
                  <Ionicons name="alert-circle" size={14} color="#DC2626" />
                  <Text style={styles.actionErrorText}>{actionError}</Text>
                </View>
              ) : null}

              {/* Done Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleClose}
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

export default GstViewDocumentModal;
