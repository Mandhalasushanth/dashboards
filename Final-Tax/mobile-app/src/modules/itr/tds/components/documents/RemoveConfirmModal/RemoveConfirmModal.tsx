import React from "react";
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback } from "react-native";
import { styles } from "./RemoveConfirmModal.styles";

interface RemoveConfirmModalProps {
  visible: boolean;
  title?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const RemoveConfirmModal: React.FC<RemoveConfirmModalProps> = ({
  visible,
  title = "Remove Document",
  message = "Are you sure you want to remove this uploaded file?",
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
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.dialogContainer}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onCancel}
                  style={styles.actionButton}
                >
                  <Text style={styles.cancelText}>CANCEL</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onConfirm}
                  style={styles.actionButton}
                >
                  <Text style={styles.removeText}>REMOVE</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default RemoveConfirmModal;
