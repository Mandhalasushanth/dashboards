import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./LateFilingHeaderBanner.styles";

export const LateFilingHeaderBanner: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <Ionicons name="receipt-outline" size={24} color="#EA580C" />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.heading}>
          Since this is a late filing, a late fee and interest may apply
        </Text>
        <Text style={styles.subtitle}>
          This is charged by the government and is separate from our service fee.
        </Text>
      </View>
    </View>
  );
};
