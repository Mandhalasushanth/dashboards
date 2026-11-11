import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./EstimatedCalculationBanner.styles";

export const EstimatedCalculationBanner: React.FC = () => {
  return (
    <View style={styles.banner}>
      <View style={styles.iconCircle}>
        <Ionicons name="information-circle-outline" size={24} color="#EA580C" />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>Estimated Calculation</Text>
        <Text style={styles.description}>
          This is only an estimated refund based on the documents provided. The
          final refund amount is determined by the Income Tax Department after
          processing your return.
        </Text>
      </View>
    </View>
  );
};
