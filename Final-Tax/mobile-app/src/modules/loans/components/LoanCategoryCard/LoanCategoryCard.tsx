import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { LoanCategory } from "../../types/loanCategory.types";
import { styles } from "./LoanCategoryCard.styles";

interface LoanCategoryCardProps {
  category: LoanCategory;
  onPress: (category: LoanCategory) => void;
}

export const LoanCategoryCard: React.FC<LoanCategoryCardProps> = ({ category, onPress }) => (
  <TouchableOpacity
    activeOpacity={0.85}
    style={styles.card}
    onPress={() => onPress(category)}
    accessibilityRole="button"
    accessibilityLabel={`${category.title}, ${category.description}`}
  >
    <View style={styles.iconWrapper}>
      <Image source={category.image} style={styles.iconImage} resizeMode="contain" />
    </View>
    <View style={styles.detailsCol}>
      <Text style={styles.title} numberOfLines={2}>
        {category.title}
      </Text>
      <Text style={styles.description} numberOfLines={2}>
        {category.description}
      </Text>
    </View>
    <View style={styles.chevronWrapper}>
      <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
    </View>
  </TouchableOpacity>
);

export default LoanCategoryCard;
