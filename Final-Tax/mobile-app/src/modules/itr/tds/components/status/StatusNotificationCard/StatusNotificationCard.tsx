import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./StatusNotificationCard.styles";

export const StatusNotificationCard: React.FC = () => {
  return (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <Ionicons name="notifications-outline" size={18} color="#EA580C" />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>You’ll be notified automatically</Text>
        <Text style={styles.description}>
          Push notifications and SMS updates will be sent whenever your refund status changes.
        </Text>
      </View>
    </View>
  );
};
