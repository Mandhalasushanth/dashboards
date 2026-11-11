import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./TdsInfoBanner.styles";

export const TdsInfoBanner: React.FC = () => {
  return (
    <View style={styles.banner}>
      <View style={styles.iconCircle}>
        <Ionicons name="information" size={20} color="#EA580C" />
      </View>

      <Text style={styles.text}>
        Only the documents relevant to your refund claim will be requested in the next steps.
      </Text>
    </View>
  );
};
