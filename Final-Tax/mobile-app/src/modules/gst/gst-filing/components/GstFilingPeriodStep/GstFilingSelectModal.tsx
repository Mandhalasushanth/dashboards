import React from "react";
import { Modal, View, Text, TouchableOpacity, FlatList } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { styles } from "@/modules/gst/gst-filing/components/GstFilingPeriodStep/GstFilingPeriodStep.styles";

interface GstFilingSelectModalProps {
  visible: boolean;
  title: string;
  data: readonly string[];
  selectedValue?: string;
  onSelect: (item: string) => void;
  onClose: () => void;
  numberOfLines?: number;
}

export const GstFilingSelectModal: React.FC<GstFilingSelectModalProps> = ({
  visible,
  title,
  data,
  selectedValue,
  onSelect,
  onClose,
  numberOfLines = 1,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          <FlatList
            data={data}
            keyExtractor={(item) => item}
            renderItem={({ item }) => {
              const isSelected = selectedValue === item;
              return (
                <TouchableOpacity
                  style={[
                    styles.modalOption,
                    isSelected && styles.modalOptionSelected,
                  ]}
                  onPress={() => onSelect(item)}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      isSelected && styles.modalOptionTextSelected,
                    ]}
                    numberOfLines={numberOfLines}
                  >
                    {item}
                  </Text>
                  {isSelected ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={BrandColors.PRIMARY_ORANGE}
                    />
                  ) : null}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
