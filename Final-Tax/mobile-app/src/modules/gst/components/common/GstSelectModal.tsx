import React, { memo } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { styles } from "./GstSelectModal.styles";

export interface GstSelectModalProps {
  visible: boolean;
  title: string;
  options: readonly string[] | string[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

export const GstSelectModal: React.FC<GstSelectModalProps> = memo(({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              <View style={styles.indicator} />
              <View style={styles.headerRow}>
                <Text style={styles.titleText}>{title}</Text>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityRole="button"
                >
                  <Ionicons name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              >
                {options.map((opt) => {
                  const isSelected = selectedValue === opt;
                  return (
                    <TouchableOpacity
                      key={opt}
                      style={[styles.optionItem, isSelected && styles.optionItemSelected]}
                      activeOpacity={0.7}
                      onPress={() => onSelect(opt)}
                    >
                      <Text
                        style={[styles.optionText, isSelected && styles.optionTextSelected]}
                        numberOfLines={2}
                      >
                        {opt}
                      </Text>
                      {isSelected ? (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={BrandColors.PRIMARY_ORANGE}
                        />
                      ) : (
                        <Ionicons
                          name="radio-button-off"
                          size={18}
                          color="#CBD5E1"
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
});

GstSelectModal.displayName = "GstSelectModal";

export default GstSelectModal;
