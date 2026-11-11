import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./TdsHeader.styles";

interface TdsHeaderProps {
  onBack?: () => void;
  title?: string;
  subtitle?: string;
}

export const TdsHeader: React.FC<TdsHeaderProps> = ({
  onBack,
  title = "TDS Refund",
  subtitle = "Claim tax deducted at source back",
}) => {
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
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleBack}
        style={styles.backButton}
        accessibilityLabel="Go back"
        accessibilityRole="button"
      >
        <Ionicons name="chevron-back" size={20} color="#0B1F3A" />
      </TouchableOpacity>

      <View style={styles.titleContainer}>
        <Text style={styles.headerTitle}>{title}</Text>
        {!!subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
      </View>

      <View style={styles.headerRightSpacer} />
    </View>
  );
};

export default TdsHeader;
