import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./NotificationCard.styles";

export const NotificationCard: React.FC = () => {
  return (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <Ionicons name="notifications-outline" size={18} color="#EA580C" />
      </View>
      <Text style={styles.text}>
        You will receive notifications at every stage of your refund process.
      </Text>
    </View>
  );
};

export const BankGradeSecurityBanner: React.FC = () => {
  return (
    <View style={styles.securityBanner}>
      <Ionicons name="shield-checkmark" size={16} color="#0B1F3A" />
      <Text style={styles.securityText}>
        Your data is secure with bank-grade encryption.
      </Text>
    </View>
  );
};
