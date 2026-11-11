import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ChecklistClipboardIllustration } from "../ChecklistClipboardIllustration";
import { styles } from "./ChecklistHeaderCard.styles";

export const ChecklistHeaderCard: React.FC = () => {
  return (
    <View style={styles.card}>
      <View style={styles.leftInfoGroup}>
        <View style={styles.iconCircle}>
          <Ionicons name="information" size={20} color="#FFFFFF" />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>Your document checklist</Text>
          <Text style={styles.description}>
            These are what our staff use to calculate your refund estimate.
          </Text>
        </View>
      </View>

      <View style={styles.illustrationWrapper}>
        <ChecklistClipboardIllustration />
      </View>
    </View>
  );
};
