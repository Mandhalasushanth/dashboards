import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { styles } from "@/modules/gst/gst-compliance/screens/GstComplianceScreen/GstComplianceScreen.styles";

interface ComplianceConfirmModalProps {
  visible: boolean;
  isDark: boolean;
  requestType: string;
  gstin: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ComplianceConfirmModal: React.FC<ComplianceConfirmModalProps> = ({
  visible,
  isDark,
  requestType,
  gstin,
  onCancel,
  onConfirm,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalBackdrop}>
        <View style={[styles.dialogCard, isDark && styles.dialogCardDark]}>
          <View style={styles.dialogIconWrap}>
            <Ionicons
              name="shield-checkmark-outline"
              size={32}
              color={BrandColors.PRIMARY_ORANGE}
            />
          </View>

          <Text style={[styles.dialogTitle, isDark && styles.dialogTitleDark]}>
            Submit GST Compliance Request?
          </Text>

          <Text
            style={[styles.dialogMessage, isDark && styles.dialogMessageDark]}
          >
            Are you sure you want to submit this {requestType} request for GSTIN {gstin}? Our CA team will immediately begin processing.
          </Text>

          <View style={styles.dialogActionsRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onCancel}
              style={[
                styles.dialogCancelBtn,
                isDark && styles.dialogCancelBtnDark,
              ]}
            >
              <Text
                style={[
                  styles.dialogCancelText,
                  isDark && styles.dialogCancelTextDark,
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onConfirm}
              style={styles.dialogConfirmBtn}
            >
              <Text style={styles.dialogConfirmText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

interface ComplianceResumeModalProps {
  visible: boolean;
  isDark: boolean;
  onDiscard: () => void;
  onResume: () => void;
}

export const ComplianceResumeModal: React.FC<ComplianceResumeModalProps> = ({
  visible,
  isDark,
  onDiscard,
  onResume,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDiscard}
    >
      <View style={styles.modalBackdrop}>
        <View style={[styles.dialogCard, isDark && styles.dialogCardDark]}>
          <View
            style={[
              styles.dialogIconWrap,
              isDark ? styles.dialogIconWrapResumeDark : styles.dialogIconWrapResume,
            ]}
          >
            <Ionicons
              name="time-outline"
              size={30}
              color={BrandColors.PRIMARY_BLUE_ACCENT}
            />
          </View>

          <Text style={[styles.dialogTitle, isDark && styles.dialogTitleDark]}>
            Resume Draft Request?
          </Text>

          <Text
            style={[styles.dialogMessage, isDark && styles.dialogMessageDark]}
          >
            You have an unsaved GST Compliance request in progress. Would you like to resume where you left off?
          </Text>

          <View style={styles.dialogActionsRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onDiscard}
              style={[
                styles.dialogCancelBtn,
                isDark && styles.dialogCancelBtnDark,
              ]}
            >
              <Text
                style={[
                  styles.dialogCancelText,
                  isDark && styles.dialogCancelTextDark,
                ]}
              >
                Start Fresh
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onResume}
              style={styles.dialogResumeBtn}
            >
              <Text style={styles.dialogConfirmText}>Resume</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
