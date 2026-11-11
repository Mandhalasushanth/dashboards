import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./ChargesEstimateWarningBanner.styles";

interface ChargesEstimateWarningBannerProps {
  assessmentYear?: string;
}

export const ChargesEstimateWarningBanner: React.FC<
  ChargesEstimateWarningBannerProps
> = ({ assessmentYear = "AY 2023–24" }) => {
  return (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <Ionicons name="warning-outline" size={20} color="#EA580C" />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>Estimate pending staff calculation</Text>
        <Text style={styles.description}>
          The exact late fee and interest are confirmed by your Tax Executive
          once your documents are verified. The figures above are indicative for{" "}
          {assessmentYear}.
        </Text>
      </View>
    </View>
  );
};
