import React from "react";
import { View, Text, ActivityIndicator, Modal } from "react-native";
import { BrandColors } from "../../../../shared/theme";
import { styles } from "./LoadingOverlay.styles";

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export function LoadingOverlay({ visible, message = "Please wait..." }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color={BrandColors.PRIMARY_BLUE} />
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
}

export default LoadingOverlay;
