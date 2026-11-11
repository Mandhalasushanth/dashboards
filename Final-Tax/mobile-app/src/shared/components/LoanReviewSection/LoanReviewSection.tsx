import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "../../theme";
import { styles } from "./LoanReviewSection.styles";

export interface ReviewItem {
  label: string;
  value?: string | number | null;
  highlight?: boolean;
}

export interface LoanReviewSectionProps {
  title: string;
  items: ReviewItem[];
  onEdit?: () => void;
  rightBadge?: React.ReactNode;
  children?: React.ReactNode;
}

export const LoanReviewSection: React.FC<LoanReviewSectionProps> = ({
  title,
  items,
  onEdit,
  rightBadge,
  children,
}) => {
  return (
    <View style={styles.summaryCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        {rightBadge ? (
          rightBadge
        ) : onEdit ? (
          <TouchableOpacity style={styles.editAction} onPress={onEdit} activeOpacity={0.7}>
            <Ionicons name="create-outline" size={14} color={BrandColors.PRIMARY_BLUE} />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {items.map((item, idx) => {
        const displayVal = item.value !== undefined && item.value !== null && item.value !== "" ? String(item.value) : "—";
        return (
          <View key={`${item.label}-${idx}`} style={styles.row}>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={item.highlight ? styles.highlightValue : styles.value}>{displayVal}</Text>
          </View>
        );
      })}

      {children}
    </View>
  );
};

export default LoanReviewSection;
