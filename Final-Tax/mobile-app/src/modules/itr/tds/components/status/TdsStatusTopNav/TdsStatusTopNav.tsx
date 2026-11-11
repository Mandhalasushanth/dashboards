import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles, getContainerTopInsetStyle } from "./TdsStatusTopNav.styles";

interface TdsStatusTopNavProps {
  topInset: number;
  title?: string;
  subtitle?: string;
  onBack: () => void;
}

export const TdsStatusTopNav: React.FC<TdsStatusTopNavProps> = ({
  topInset,
  title = "Application Status",
  subtitle = "ITR & TDS Tracking",
  onBack,
}) => {
  return (
    <View style={[styles.headerBanner, getContainerTopInsetStyle(topInset)]}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onBack}
        style={styles.backButton}
      >
        <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
      </TouchableOpacity>

      <View style={styles.headerTitleGroup}>
        <Text style={styles.headerTitle}>{title}</Text>
        <Text style={styles.headerSubtitle}>{subtitle}</Text>
      </View>

      <View style={styles.rightPlaceholder} />
    </View>
  );
};

export default TdsStatusTopNav;
