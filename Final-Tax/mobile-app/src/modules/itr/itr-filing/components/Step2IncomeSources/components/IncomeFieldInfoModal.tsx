import React from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { styles } from "./IncomeFieldInfoModal.styles";

export interface FieldInfoItem {
  label: string;
  detail: string;
}

export interface InfoModalContent {
  title: string;
  description: string;
  fields?: FieldInfoItem[];
}

interface IncomeFieldInfoModalProps {
  visible: boolean;
  content: InfoModalContent | null;
  onClose: () => void;
}

export const IncomeFieldInfoModal: React.FC<IncomeFieldInfoModalProps> = ({
  visible,
  content,
  onClose,
}) => {
  if (!content) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Ionicons
                name="information-circle"
                size={22}
                color={BrandColors.PRIMARY_ORANGE}
              />
              <Text style={styles.modalTitle}>{content.title}</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <Text style={styles.description}>{content.description}</Text>

          {/* Scrollable Field Breakdown */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.fieldsContainer}
          >
            {content.fields && content.fields.length > 0 && (
              <View>
                <Text style={styles.fieldsSectionTitle}>Field Details</Text>
                {content.fields.map((f, idx) => (
                  <View key={idx} style={styles.fieldItem}>
                    <View style={styles.fieldLabelRow}>
                      <Text style={styles.fieldLabel}>{f.label}</Text>
                    </View>
                    <Text style={styles.fieldDetail}>{f.detail}</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onClose}
            style={styles.confirmBtn}
          >
            <Text style={styles.confirmBtnText}>Got It</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
