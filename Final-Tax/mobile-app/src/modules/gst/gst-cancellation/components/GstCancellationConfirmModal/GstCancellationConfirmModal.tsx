/**
 * Component: GstCancellationConfirmModal
 * Migrated from internal StyleSheet to external styles module.
 * Uses shared design tokens from src/shared/theme.ts.
 */

import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { styles } from "./GstCancellationConfirmModal.styles";

export interface GstCancellationConfirmModalProps {
  visible: boolean;
  gstin: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const GstCancellationConfirmModal: React.FC<GstCancellationConfirmModalProps> = ({
  visible,
  gstin,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Warning Icon Box */}
          <View style={styles.iconCircle}>
            <Ionicons name="warning-outline" size={32} color={BrandColors.PRIMARY_ORANGE} />
          </View>

          {/* Heading */}
          <Text style={styles.title}>Confirm GST Cancellation Request</Text>

          {/* Body Text */}
          <Text style={styles.bodyText}>
            You are about to submit a request to cancel GSTIN{" "}
            <Text style={styles.boldText}>{gstin}</Text>.
          </Text>

          <Text style={styles.warningSubText}>This action cannot be undone.</Text>
          <Text style={styles.bodyText}>Are you sure you want to proceed?</Text>

          {/* Action Buttons Stack */}
          <View style={styles.btnStack}>
            <TouchableOpacity
              style={styles.cancelBtn}
              activeOpacity={0.8}
              onPress={onCancel}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmBtn}
              activeOpacity={0.85}
              onPress={onConfirm}
            >
              <Text style={styles.confirmBtnText}>Confirm Cancellation Request</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
