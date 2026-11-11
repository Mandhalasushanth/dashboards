import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./TdsDocumentHeader.styles";

interface TdsDocumentHeaderProps {
  onBack?: () => void;
  hideBack?: boolean;
}

export const TdsDocumentHeader: React.FC<TdsDocumentHeaderProps> = ({ onBack, hideBack }) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/service/itr" as any);
    }
  };

  return (
    <View style={styles.header}>
      {hideBack ? (
        <View style={styles.backButton} />
      ) : (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleBack}
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={20} color="#0B1F3A" />
        </TouchableOpacity>
      )}

      <View style={styles.titleContainer}>
        <Text style={styles.headerTitle}>TDS Refund Documents</Text>
        <Text style={styles.headerSubtitle}>Upload the documents below to continue</Text>
      </View>

      <View style={styles.headerRightSpacer} />
    </View>
  );
};

export default TdsDocumentHeader;
