import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { styles } from "./ReviewSectionCard.styles";

interface ReviewSectionCardProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  /** Opens the step where this section's data is edited. */
  onEdit: () => void;
  children: React.ReactNode;
}

/** One section of the TDS review screen: icon + title header with an Edit action. */
export function ReviewSectionCard({ icon, title, onEdit, children }: ReviewSectionCardProps) {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.cardHeaderRow}>
        <View style={styles.cardTitleGroup}>
          <Ionicons name={icon} size={18} color={BrandColors.PRIMARY_BLUE} />
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onEdit}
          style={styles.editButton}
        >
          <Ionicons name="pencil" size={12} color={BrandColors.PRIMARY_ORANGE_DARK} />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {children}
    </View>
  );
}

export default ReviewSectionCard;
