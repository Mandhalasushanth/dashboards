import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./WhatHappensNextCard.styles";

export const WhatHappensNextCard: React.FC = () => {
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="notifications-outline" size={18} color="#0B1F3A" />
        </View>
        <Text style={styles.cardTitle}>What happens next</Text>
      </View>

      <Text style={styles.description}>
        A Tax Executive will verify your documents, prepare the return and send you the computation to review and approve. You will get a notification at each stage.
      </Text>
    </View>
  );
};
