import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { DocumentUploadPayload } from "../../../types/taxNotice.types";
import { styles } from "./NoticeUploadSourceModal.styles";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB limit matching tax notice requirement

interface NoticeUploadSourceModalProps {
  visible: boolean;
  documentTitle: string;
  maxSizeText?: string;
  onClose: () => void;
  onFileSelected: (payload: DocumentUploadPayload) => void;
}

export const NoticeUploadSourceModal: React.FC<NoticeUploadSourceModalProps> = ({
  visible,
  documentTitle,
  maxSizeText = "Maximum file size: 10 MB",
  onClose,
  onFileSelected,
}) => {
  const processAndDispatchFile = (
    asset: { uri: string; name?: string; size?: number; mimeType?: string },
    defaultName: string
  ) => {
    const fileName = asset.name || defaultName;
    const extension = fileName.split(".").pop()?.toLowerCase() || "";

    if (asset.size && asset.size > MAX_FILE_SIZE_BYTES) {
      Alert.alert(
        "File Too Large",
        "The selected file exceeds 10 MB. Please select a smaller document."
      );
      return;
    }

    const sizeInMb = asset.size
      ? `${(asset.size / (1024 * 1024)).toFixed(1)} MB`
      : "1.5 MB";

    onFileSelected({
      uri: asset.uri,
      name: fileName,
      size: sizeInMb,
      mimeType: asset.mimeType,
      fileTypeLabel: extension.toUpperCase() || "FILE",
    });
    onClose();
  };

  // Option 1: Choose from Files / Drive
  const handleChooseFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/jpeg", "image/png", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        processAndDispatchFile(result.assets[0], "Notice_Document.pdf");
      }
    } catch {
      Alert.alert("Upload Error", "Could not open file manager. Please try again.");
    }
  };

  // Option 2: Select from Gallery
  const handleSelectGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
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
        processAndDispatchFile(
          {
            uri: asset.uri,
            name: fileName,
            size: (asset as any).fileSize,
            mimeType: asset.mimeType || "image/jpeg",
          },
          fileName
        );
      }
    } catch {
      Alert.alert("Gallery Error", "Could not access photo gallery. Please try again.");
    }
  };

  // Option 3: Take Photo with Camera
  const handleTakePhoto = async () => {
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
        processAndDispatchFile(
          {
            uri: asset.uri,
            name: fileName,
            size: (asset as any).fileSize,
            mimeType: asset.mimeType || "image/jpeg",
          },
          fileName
        );
      }
    } catch {
      Alert.alert("Camera Error", "Could not open camera. Please try again.");
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              {/* Header Title & Subtitle */}
              <View style={styles.header}>
                <Text style={styles.title} numberOfLines={1}>
                  {`Upload ${documentTitle}`}
                </Text>
                <Text style={styles.subtitle}>
                  {`Select file source • ${maxSizeText}`}
                </Text>
              </View>

              {/* 3 Source Options */}
              <View style={styles.optionsContainer}>
                {/* 1. Choose from Files / Drive */}
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={handleChooseFiles}
                  style={styles.optionCard}
                >
                  <View style={[styles.iconBox, styles.filesIconBox]}>
                    <Ionicons name="folder-outline" size={22} color="#0284C7" />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>Choose from Files / Drive</Text>
                    <Text style={styles.optionSubtitle}>PDF, JPG or PNG (up to 10 MB)</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                </TouchableOpacity>

                {/* 2. Select from Gallery */}
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={handleSelectGallery}
                  style={styles.optionCard}
                >
                  <View style={[styles.iconBox, styles.galleryIconBox]}>
                    <Ionicons name="images-outline" size={22} color="#9333EA" />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>Select from Gallery</Text>
                    <Text style={styles.optionSubtitle}>Upload existing photo from gallery</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                </TouchableOpacity>

                {/* 3. Take Photo with Camera */}
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={handleTakePhoto}
                  style={styles.optionCard}
                >
                  <View style={[styles.iconBox, styles.cameraIconBox]}>
                    <Ionicons name="camera-outline" size={22} color="#059669" />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>Take Photo with Camera</Text>
                    <Text style={styles.optionSubtitle}>Directly capture document clearly</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              {/* Cancel Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onClose}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default NoticeUploadSourceModal;
