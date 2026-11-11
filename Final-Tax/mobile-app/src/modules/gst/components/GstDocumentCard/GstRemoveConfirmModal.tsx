import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./GstRemoveConfirmModal.styles";

export interface GstRemoveConfirmModalProps {
  visible: boolean;
  title?: string;
  message?: string;
  removeButtonText?: string;
  cancelButtonText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const GstRemoveConfirmModal: React.FC<GstRemoveConfirmModalProps> = ({
  visible,
  title = "Remove Document?",
  message = "Are you sure you want to remove this uploaded document? You can upload a new one at any time.",
  removeButtonText = "Remove Document",
  cancelButtonText = "Keep File",
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="trash-outline" size={28} color="#DC2626" />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <TouchableOpacity
            style={styles.removeBtn}
            activeOpacity={0.85}
            onPress={onConfirm}
          >
            <Ionicons name="trash" size={17} color="#FFFFFF" />
            <Text style={styles.removeBtnText}>{removeButtonText}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            activeOpacity={0.7}
            onPress={onCancel}
          >
            <Text style={styles.cancelBtnText}>{cancelButtonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default GstRemoveConfirmModal;
