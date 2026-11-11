import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./WorkflowInfoCard.styles";

interface WorkflowInfoCardProps {
  title?: string;
  description?: string;
}

export const WorkflowInfoCard: React.FC<WorkflowInfoCardProps> = ({
  title = "No Need to Rebuild",
  description = "The Previous Year ITR workflow reuses the same forms as the regular ITR Filing process. Only the filing year and return type are different.",
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <Ionicons name="information" size={20} color="#FFFFFF" />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
};
