import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./ChecklistImportantBanner.styles";

export const ChecklistImportantBanner: React.FC = () => {
  return (
    <View style={styles.banner}>
      <View style={styles.iconCircle}>
        <Ionicons name="information-circle-outline" size={24} color="#EA580C" />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>Important</Text>
        <Text style={styles.description}>
          Please upload clear and valid documents. Blurry or invalid documents may delay the refund process.
        </Text>
      </View>
    </View>
  );
};
