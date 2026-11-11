import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./TaxNoticeHeader.styles";

interface TaxNoticeHeaderProps {
  subtitle: string;
  onBack?: () => void;
  onSaveDraft?: () => void;
  hideBackButton?: boolean;
}

export const TaxNoticeHeader: React.FC<TaxNoticeHeaderProps> = ({
  subtitle,
  onBack,
  onSaveDraft,
  hideBackButton = false,
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.header}>
      {!hideBackButton ? (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleBack}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={20} color="#0B1F3A" />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 38, height: 38 }} />
      )}

      <View style={styles.titleGroup}>
        <Text style={styles.title}>Tax Notice Assistance</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      {onSaveDraft ? (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onSaveDraft}
          style={styles.draftButton}
        >
          <Ionicons name="bookmark-outline" size={14} color="#EA580C" />
          <Text style={styles.draftButtonText}>Draft</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.rightSpacer} />
      )}
    </View>
  );
};
