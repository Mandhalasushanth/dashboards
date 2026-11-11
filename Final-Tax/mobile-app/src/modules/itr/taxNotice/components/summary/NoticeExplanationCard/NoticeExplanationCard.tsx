import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./NoticeExplanationCard.styles";

interface NoticeExplanationCardProps {
  iconName: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

export const NoticeExplanationCard: React.FC<NoticeExplanationCardProps> = ({
  iconName,
  title,
  description,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <Ionicons name={iconName} size={18} color="#2563EB" />
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
};
