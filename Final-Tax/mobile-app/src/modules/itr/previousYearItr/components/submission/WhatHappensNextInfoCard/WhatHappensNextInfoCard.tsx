import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./WhatHappensNextInfoCard.styles";

export const WhatHappensNextInfoCard: React.FC = () => {
  return (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <Ionicons name="information" size={20} color="#FFFFFF" />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>What Happens Next?</Text>
        <Text style={styles.description}>
          Our Tax Executive will verify your uploaded documents, prepare your
          Previous Year Income Tax Return, contact you if additional information
          is required, complete the filing after your approval, and guide you
          through e-verification.
        </Text>
      </View>
    </View>
  );
};
