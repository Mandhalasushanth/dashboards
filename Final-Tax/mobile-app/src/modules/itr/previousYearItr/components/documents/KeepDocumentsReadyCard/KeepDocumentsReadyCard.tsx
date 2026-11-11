import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./KeepDocumentsReadyCard.styles";

interface KeepDocumentsReadyCardProps {
  assessmentYear?: string;
}

export const KeepDocumentsReadyCard: React.FC<KeepDocumentsReadyCardProps> = ({
  assessmentYear = "AY 2023–24",
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <Ionicons name="information" size={20} color="#FFFFFF" />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>Keep Documents Ready</Text>
        <Text style={styles.description}>
          Ensure the documents are clear, readable and match the selected
          assessment year ({assessmentYear}).
        </Text>
      </View>
    </View>
  );
};
