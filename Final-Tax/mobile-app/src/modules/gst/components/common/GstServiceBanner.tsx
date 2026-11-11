import React, { memo } from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { styles } from "./GstServiceBanner.styles";

export interface GstServiceBannerProps {
  text: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export const GstServiceBanner: React.FC<GstServiceBannerProps> = memo(({
  text,
  icon = "shield-checkmark-outline",
}) => {
  return (
    <View style={styles.bannerContainer}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={18} color={BrandColors.PRIMARY_ORANGE} />
      </View>
      <Text style={styles.bannerText}>{text}</Text>
    </View>
  );
});

GstServiceBanner.displayName = "GstServiceBanner";

export default GstServiceBanner;
