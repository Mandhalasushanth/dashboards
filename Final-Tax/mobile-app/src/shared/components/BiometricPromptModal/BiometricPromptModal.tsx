import React from "react";
import { Modal, View, Text, TouchableOpacity, Platform } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/hooks/use-theme";
import { styles, getThemedStyles } from "./BiometricPromptModal.styles";

export interface BiometricPromptModalProps {
  visible: boolean;
  biometricType?: string;
  onEnable: () => void;
  onNotNow: () => void;
}

export const BiometricPromptModal: React.FC<BiometricPromptModalProps> = ({
  visible,
  biometricType = "Biometric",
  onEnable,
  onNotNow,
}) => {
  const colors = useTheme();
  const themed = getThemedStyles(colors);

  const iconName = biometricType.toLowerCase().includes("face")
    ? "scan-outline"
    : "finger-print-outline";

  const modalTitle = `Enable ${biometricType} Login?`;

  const modalMessage = `Log in faster and more securely using your device ${biometricType.toLowerCase()} next time.`;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onNotNow}
    >
      <View style={styles.backdrop}>
        <View style={[styles.modalCard, themed.modalCard]}>
          <View style={[styles.iconCircle, themed.iconCircle]}>
            <Ionicons name={iconName} size={36} color={colors.orange} />
          </View>

          <Text style={[styles.title, themed.title]}>
            {modalTitle}
          </Text>

          <Text style={[styles.message, themed.message]}>
            {modalMessage}
          </Text>

          <TouchableOpacity
            style={[styles.enableBtn, themed.enableBtn]}
            activeOpacity={0.85}
            onPress={onEnable}
          >
            <Ionicons name="shield-checkmark-outline" size={18} color="#FFFFFF" />
            <Text style={styles.enableBtnText}>Enable</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.notNowBtn, themed.notNowBtn]}
            activeOpacity={0.7}
            onPress={onNotNow}
          >
            <Text style={[styles.notNowBtnText, themed.notNowBtnText]}>
              Not Now
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default BiometricPromptModal;
