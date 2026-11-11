import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { useAuthStore } from "@/modules/authentication/store/authStore";
import { styles } from "./CompleteProfileModal.styles";

export interface CompleteProfileModalProps {
  visible?: boolean;
  onCancel?: () => void;
  onCompleteProfile?: () => void;
}

export const CompleteProfileModal: React.FC<CompleteProfileModalProps> = ({
  visible: propVisible,
  onCancel: propOnCancel,
  onCompleteProfile: propOnCompleteProfile,
}) => {
  const router = useRouter();
  const storeVisible = useAuthStore((s) => s.isCompleteProfileModalOpen);
  const closeCompleteProfileModal = useAuthStore((s) => s.closeCompleteProfileModal);

  const isVisible = propVisible !== undefined ? propVisible : storeVisible;

  const handleCancel = () => {
    if (propOnCancel) {
      propOnCancel();
    } else {
      closeCompleteProfileModal();
    }
  };

  const handleCompleteProfile = () => {
    if (propOnCompleteProfile) {
      propOnCompleteProfile();
    } else {
      closeCompleteProfileModal();
      router.push("/(auth)/createprofile");
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCancel}
      statusBarTranslucent={true}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="person-circle-outline" size={32} color={BrandColors.PRIMARY_BLUE} />
          </View>

          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.message}>
            Please complete your profile to access Finsolz services.
          </Text>

          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={handleCompleteProfile}
          >
            <Ionicons name="shield-checkmark-outline" size={18} color="#FFFFFF" />
            <Text style={styles.primaryBtnText}>Complete Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            activeOpacity={0.7}
            onPress={handleCancel}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default CompleteProfileModal;
