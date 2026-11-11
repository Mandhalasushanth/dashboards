import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./DraftedResponseCard.styles";

interface DraftedResponseCardProps {
  responseText: string;
}

export const DraftedResponseCard: React.FC<DraftedResponseCardProps> = ({
  responseText,
}) => {
  return (
    <View style={styles.card}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.iconCircle}>
          <Ionicons name="document-text-outline" size={20} color="#0B1F3A" />
        </View>
        <Text style={styles.cardTitle}>Response drafted by{"\n"}Tax Executive</Text>
      </View>

      <View style={styles.divider} />

      {/* Drafted Letter Content */}
      <Text style={styles.letterText}>{responseText}</Text>
    </View>
  );
};
