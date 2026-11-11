import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ProfessionOption } from "../../types/profession.types";
import { ProfessionIcon } from "../ProfessionIcons";
import { styles } from "./ProfessionCard.styles";

interface ProfessionCardProps {
  item: ProfessionOption;
  isSelected: boolean;
  onSelect: (item: ProfessionOption) => void;
}

export const ProfessionCard: React.FC<ProfessionCardProps> = ({
  item,
  isSelected,
  onSelect,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onSelect(item)}
      style={[
        styles.card,
        isSelected ? styles.selectedCard : styles.unselectedCard,
      ]}
    >
      {/* Top right check icon if selected */}
      {isSelected && (
        <View style={styles.checkBadge}>
          <Ionicons name="checkmark" size={13} color="#FFFFFF" />
        </View>
      )}

      {/* Profession Icon Container */}
      <ProfessionIcon type={item.icon} isSelected={isSelected} />

      {/* Title */}
      <Text
        style={[
          styles.title,
          isSelected ? styles.selectedTitle : styles.unselectedTitle,
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {item.title}
      </Text>

      {/* Subtitle */}
      <Text
        style={[
          styles.subtitle,
          isSelected ? styles.selectedSubtitle : styles.unselectedSubtitle,
        ]}
        numberOfLines={2}
      >
        {item.subtitle}
      </Text>

      {/* ITR Form Type Tag */}
      <Text style={styles.formTypeTag}>{item.formType}</Text>
    </TouchableOpacity>
  );
};
