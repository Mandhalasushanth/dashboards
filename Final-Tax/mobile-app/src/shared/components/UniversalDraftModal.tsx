import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";

export interface UniversalDraftModalProps {
  visible: boolean;
  title?: string;
  message?: string;
  saveButtonText?: string;
  discardButtonText?: string;
  cancelButtonText?: string;
  onSaveAndExit: () => void;
  onDiscardAndExit?: () => void;
  onCancel?: () => void;
  /** Backward-compatible alias for onDiscardAndExit */
  onDiscard?: () => void;
  /** Backward-compatible alias for onCancel */
  onKeepEditing?: () => void;
}

export const UniversalDraftModal: React.FC<UniversalDraftModalProps> = ({
  visible,
  title = "Save Filing Progress?",
  message = "You have unsaved changes in your application. Save your progress so you can resume anytime without re-entering details.",
  saveButtonText = "Save as Draft & Exit",
  discardButtonText = "Discard & Exit",
  cancelButtonText = "Keep Editing",
  onSaveAndExit,
  onDiscardAndExit,
  onCancel,
  onDiscard,
  onKeepEditing,
}) => {
  const handleDiscard = onDiscardAndExit || onDiscard || (() => {});
  const handleCancel = onCancel || onKeepEditing || (() => {});

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Top Orange Bookmark Badge */}
          <View style={styles.iconCircle}>
            <Ionicons name="bookmark-outline" size={28} color={BrandColors.PRIMARY_ORANGE} />
          </View>

          {/* Heading & Subtitle */}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {/* Primary: Save as Draft & Exit */}
          <TouchableOpacity
            style={styles.saveBtn}
            activeOpacity={0.85}
            onPress={onSaveAndExit}
          >
            <Ionicons name="save-outline" size={18} color="#FFFFFF" />
            <Text style={styles.saveBtnText}>{saveButtonText}</Text>
          </TouchableOpacity>

          {/* Secondary: Discard & Exit */}
          <TouchableOpacity
            style={styles.discardBtn}
            activeOpacity={0.8}
            onPress={handleDiscard}
          >
            <Text style={styles.discardBtnText}>{discardButtonText}</Text>
          </TouchableOpacity>

          {/* Tertiary: Keep Editing */}
          <TouchableOpacity
            style={styles.cancelBtn}
            activeOpacity={0.7}
            onPress={handleCancel}
          >
            <Text style={styles.cancelBtnText}>{cancelButtonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FEF0E6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: BrandColors.TEXT_PRIMARY,
    marginBottom: 8,
    textAlign: "center",
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  message: {
    fontSize: 13.5,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif" }),
  },
  saveBtn: {
    width: "100%",
    height: 48,
    borderRadius: 24,
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
    shadowColor: BrandColors.PRIMARY_ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  saveBtnText: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  discardBtn: {
    width: "100%",
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  discardBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#DC2626",
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  },
  cancelBtn: {
    width: "100%",
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 13.5,
    fontWeight: "600",
    color: "#64748B",
    fontFamily: Platform.select({ ios: "System", android: "sans-serif" }),
  },
});
