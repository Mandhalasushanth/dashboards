import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { styles } from "./DocumentUploadBottomSheet.styles";

export interface DocumentUploadBottomSheetProps {
  visible: boolean;
  documentTitle?: string;
  documentName?: string;
  maxSizeBytesText?: string;
  maxSizeText?: string;
  onClose?: () => void;
  onCancel?: () => void;
  onPickFiles?: () => void;
  onChooseFiles?: () => void;
  onPickGallery?: () => void;
  onSelectGallery?: () => void;
  onTakePhoto?: () => void;
  allowGallery?: boolean;
  allowCamera?: boolean;
}

export const DocumentUploadBottomSheet: React.FC<DocumentUploadBottomSheetProps> = ({
  visible,
  documentTitle,
  documentName,
  maxSizeBytesText,
  maxSizeText,
  onClose,
  onCancel,
  onPickFiles,
  onChooseFiles,
  onPickGallery,
  onSelectGallery,
  onTakePhoto,
  allowGallery = true,
  allowCamera = true,
}) => {
  const insets = useSafeAreaInsets();

  const rawTitle = documentTitle || documentName || "Document";
  const displayTitle = rawTitle.toLowerCase().startsWith("upload")
    ? rawTitle
    : `Upload ${rawTitle}`;

  const resolvedMaxSize = maxSizeBytesText || maxSizeText || "10 MB";
  const handleClose = onClose || onCancel || (() => {});
  const handlePickFiles = onPickFiles || onChooseFiles || (() => {});
  const handlePickGallery = onPickGallery || onSelectGallery || (() => {});
  const handleTakePhoto = onTakePhoto || (() => {});

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View
              style={[
                styles.sheetContainer,
                { paddingBottom: Math.max(insets.bottom, 16) + 8 },
              ]}
            >
              <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                {/* Handle Bar */}
                <View style={styles.handleBar} />

                {/* Header */}
                <View style={styles.headerRow}>
                  <View style={styles.titleGroup}>
                    <Text style={styles.sheetTitle} numberOfLines={1}>
                      {displayTitle}
                    </Text>
                    <Text style={styles.sheetSubtitle}>
                      Select file source • Max size: {resolvedMaxSize}
                    </Text>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleClose}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={18} color={BrandColors.TEXT_SECONDARY} />
                  </TouchableOpacity>
                </View>

                {/* Source Options List */}
                <View style={styles.optionsList}>
                  {/* 1. Files / Drive */}
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={handlePickFiles}
                    style={styles.optionItem}
                  >
                    <View style={styles.optionIconBox}>
                      <Ionicons
                        name="document-text-outline"
                        size={22}
                        color={BrandColors.PRIMARY_ORANGE}
                      />
                    </View>
                    <View style={styles.optionTextBox}>
                      <Text style={styles.optionTitle}>Choose from Files / Drive</Text>
                      <Text style={styles.optionDesc}>PDF, JPG or PNG (Recommended)</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                  </TouchableOpacity>

                  {/* 2. Gallery */}
                  {allowGallery && (
                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={handlePickGallery}
                      style={styles.optionItem}
                    >
                      <View style={styles.optionIconBox}>
                        <Ionicons
                          name="images-outline"
                          size={22}
                          color={BrandColors.PRIMARY_ORANGE}
                        />
                      </View>
                      <View style={styles.optionTextBox}>
                        <Text style={styles.optionTitle}>Select from Gallery</Text>
                        <Text style={styles.optionDesc}>Photos & Saved documents</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                    </TouchableOpacity>
                  )}

                  {/* 3. Camera */}
                  {allowCamera && (
                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={handleTakePhoto}
                      style={styles.optionItem}
                    >
                      <View style={styles.optionIconBox}>
                        <Ionicons
                          name="camera-outline"
                          size={22}
                          color={BrandColors.PRIMARY_ORANGE}
                        />
                      </View>
                      <View style={styles.optionTextBox}>
                        <Text style={styles.optionTitle}>Take Photo with Camera</Text>
                        <Text style={styles.optionDesc}>Capture document clearly</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Cancel Button */}
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={handleClose}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default DocumentUploadBottomSheet;
