import React from "react";
import { Modal, View, Text, ScrollView, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { styles } from "./GstAmendmentPicker.styles";
import { PickerModalState } from "../../types/gstAmendmentTypes";

interface GstAmendmentPickerProps {
  pickerModal: PickerModalState;
  onClose: () => void;
}

export const GstAmendmentPicker: React.FC<GstAmendmentPickerProps> = ({
  pickerModal,
  onClose,
}) => {
  if (!pickerModal.isOpen) return null;

  return (
    <Modal
      visible={pickerModal.isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{pickerModal.title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {pickerModal.options.map((opt) => {
              const isSelected = pickerModal.selectedVal === opt;
              return (
                <TouchableOpacity
                  key={opt}
                  style={styles.modalOptionItem}
                  activeOpacity={0.7}
                  onPress={() => {
                    pickerModal.onSelect(opt);
                    onClose();
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      isSelected && styles.modalOptionSelectedText,
                    ]}
                  >
                    {opt}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark" size={18} color={BrandColors.PRIMARY_BLUE} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
