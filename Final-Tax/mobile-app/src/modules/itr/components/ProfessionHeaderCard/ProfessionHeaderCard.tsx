import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./ProfessionHeaderCard.styles";

export const ProfessionHeaderCard: React.FC = () => {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.iconContainer}>
          <Ionicons name="calculator" size={24} color="#F97316" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>ITR Filing</Text>
          <Text style={styles.subtitle}>ITR CATEGORY</Text>
        </View>
      </View>
      <Text style={styles.description}>
        We'll recommend the right ITR form for you.
      </Text>
    </View>
  );
};
