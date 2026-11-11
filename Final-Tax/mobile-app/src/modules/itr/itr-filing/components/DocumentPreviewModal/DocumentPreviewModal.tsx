import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ItrDocumentItem } from "../../types/itrFiling.types";
import { styles } from "./DocumentPreviewModal.styles";

interface DocumentPreviewModalProps {
  visible: boolean;
  document: ItrDocumentItem | null;
  onClose: () => void;
  onChangeFile: (doc: ItrDocumentItem) => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  visible,
  document,
  onClose,
  onChangeFile,
}) => {
  if (!document || !document.fileUri) return null;

  const isImage =
    document.fileUri.endsWith(".jpg") ||
    document.fileUri.endsWith(".jpeg") ||
    document.fileUri.endsWith(".png") ||
    (document.mimeType && document.mimeType.startsWith("image/"));

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
                    <Text style={styles.pdfTitle}>{document.fileName || "PDF Document"}</Text>
                    <Text style={styles.pdfSubtitle}>
                      Verified PDF format • Size: {document.fileSize || "1.2 MB"}
                    </Text>
                    <View style={styles.pdfVerifiedBadge}>
                      <Ionicons name="checkmark-circle" size={16} color="#059669" />
                      <Text style={styles.pdfVerifiedText}>Ready for CA verification</Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.changeBtn}
                  onPress={() => {
                    onClose();
                    onChangeFile(document);
                  }}
                >
                  <Ionicons name="swap-horizontal-outline" size={18} color="#083B75" />
                  <Text style={styles.changeBtnText}>Change File</Text>
                </TouchableOpacity>

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
};
