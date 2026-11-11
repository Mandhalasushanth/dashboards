import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./TdsNoticeBanner.styles";

interface TdsNoticeBannerProps {
  message?: string;
}

export const TdsNoticeBanner: React.FC<TdsNoticeBannerProps> = ({
  message = "Please reconcile your Form 16 / 16A with AIS & TIS for accurate refund processing.",
}) => {
  return (
    <View style={styles.container}>
      <Ionicons
        name="information-circle"
        size={18}
        color="#16A34A"
        style={styles.icon}
      />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

export default TdsNoticeBanner;
