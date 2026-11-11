import React from 'react';
import { Modal, View, Text, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { styles } from './StepPromoters.styles';

export interface DeleteDirectorModalProps {
  visible: boolean;
  directorName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export const DeleteDirectorModal: React.FC<DeleteDirectorModalProps> = ({
  visible,
  directorName,
  onCancel,
  onConfirm,
}) => {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeaderIcon}>
                <Ionicons name="trash-bin-outline" size={24} color="#EF4444" />
              </View>

              <Text style={styles.modalTitle}>Delete Promoter / Director?</Text>
              <Text style={styles.modalMessage}>
                Are you sure you want to remove <Text style={{ fontWeight: '700' }}>{directorName || 'this promoter'}</Text>?
              </Text>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={onCancel} activeOpacity={0.7}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.modalDeleteBtn} onPress={onConfirm} activeOpacity={0.7}>
                  <Text style={styles.modalDeleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
