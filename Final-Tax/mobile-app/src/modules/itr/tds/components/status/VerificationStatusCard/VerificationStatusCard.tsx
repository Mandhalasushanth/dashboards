import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./VerificationStatusCard.styles";

export const VerificationStatusCard: React.FC = () => {
  return (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <Ionicons name="search" size={20} color="#FFFFFF" />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>Currently Under Verification</Text>
        <Text style={styles.description}>
          Our Tax Executive is reviewing your submitted documents and validating the refund computation.
          {"\n\n"}
          You don’t need to take any action at this stage.
        </Text>
      </View>
    </View>
  );
};
