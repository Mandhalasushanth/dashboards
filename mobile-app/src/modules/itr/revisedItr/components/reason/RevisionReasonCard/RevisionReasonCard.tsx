import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { RevisionReasonOption } from "../../../types/revisedItr.types";
import { styles } from "./RevisionReasonCard.styles";

interface RevisionReasonCardProps {
  item: RevisionReasonOption;
  isSelected: boolean;
  onSelect: (id: RevisionReasonOption["id"]) => void;
}

export const RevisionReasonCard: React.FC<RevisionReasonCardProps> = ({
  item,
  isSelected,
  onSelect,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onSelect(item.id)}
      style={[styles.card, isSelected ? styles.cardSelected : styles.cardUnselected]}
    >
      {/* Icon Box */}
      <View
        style={[
          styles.iconBox,
          isSelected ? styles.iconBoxSelected : styles.iconBoxUnselected,
        ]}
      >
        <Ionicons
          name={item.iconName}
          size={22}
          color={isSelected ? "#EA580C" : "#083B75"}
        />
      </View>

      {/* Text Info */}
      <View style={styles.textGroup}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>

      {/* Radio Circle */}
      <View
        style={[
          styles.radioOuter,
          isSelected ? styles.radioOuterSelected : styles.radioOuterUnselected,
        ]}
      >
        {isSelected && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );
};
