import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { styles, getProgressFillThemedStyle } from "./HomeProfileSetupCard.styles";

interface HomeProfileSetupCardProps {
  onComplete: () => void;
  completionPercentage?: number;
}

export const HomeProfileSetupCard: React.FC<HomeProfileSetupCardProps> = ({
  onComplete,
  completionPercentage = 60,
}) => {
  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={onComplete}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityLabel="Complete Profile"
    >
      <View style={styles.avatarCircle}>
        <Ionicons name="person" size={22} color={BrandColors.PRIMARY_ORANGE} />
      </View>

      <View style={styles.contentColumn}>
        <Text style={styles.cardTitle}>Finish setting up your profile</Text>
        <Text style={styles.cardSubtitle}>
          Add your details for better experience.
        </Text>
        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                getProgressFillThemedStyle(completionPercentage),
              ]}
            />
          </View>
          <Text style={styles.progressPercent}>{`${completionPercentage}%`}</Text>
        </View>
      </View>

      <View style={styles.completeBtn}>
        <Text style={styles.completeBtnText}>Complete Profile</Text>
      </View>
    </TouchableOpacity>
  );
};

export default HomeProfileSetupCard;
