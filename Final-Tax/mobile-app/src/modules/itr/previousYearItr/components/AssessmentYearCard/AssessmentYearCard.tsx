import React, { useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { AssessmentYearItem } from "../../types/previousYear.types";
import { EligibilityBadge } from "../EligibilityBadge";
import { styles, getScaleTransformStyle } from "./AssessmentYearCard.styles";

interface AssessmentYearCardProps {
  item: AssessmentYearItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const AssessmentYearCard: React.FC<AssessmentYearCardProps> = ({
  item,
  isSelected,
  onSelect,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (item.isEligible) {
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 120,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (item.isEligible) {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePress = () => {
    if (item.isEligible) {
      onSelect(item.id);
    }
  };

  const badgeVariant = !item.isEligible
    ? "closed"
    : isSelected
    ? "selected"
    : "eligible";

  return (
    <Animated.View style={getScaleTransformStyle(scaleAnim)}>
      <TouchableOpacity
        activeOpacity={item.isEligible ? 0.9 : 1}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={!item.isEligible}
        style={[
          styles.card,
          !item.isEligible
            ? styles.disabledCard
            : isSelected
            ? styles.selectedCard
            : styles.eligibleCard,
        ]}
      >
        {/* Left Icon */}
        <View
          style={[
            styles.iconBox,
            !item.isEligible
              ? styles.disabledIconBox
              : isSelected
              ? styles.selectedIconBox
              : styles.eligibleIconBox,
          ]}
        >
          <Ionicons
            name="calendar-outline"
            size={22}
            color={
              !item.isEligible
                ? "#94A3B8"
                : isSelected
                ? "#EA580C"
                : "#0B1F3A"
            }
          />
        </View>

        {/* Text Section */}
        <View style={styles.textGroup}>
          <Text
            style={[
              styles.yearTitle,
              !item.isEligible && styles.disabledYearTitle,
            ]}
          >
            {item.year}
          </Text>
          <Text
            style={[
              styles.subtitle,
              !item.isEligible && styles.disabledSubtitle,
            ]}
          >
            {item.subtitle}
          </Text>
        </View>

        {/* Right Badge & Checkmark */}
        <View style={styles.rightGroup}>
          <EligibilityBadge variant={badgeVariant} />

          {isSelected && (
            <View style={styles.checkmarkCircle}>
              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};
