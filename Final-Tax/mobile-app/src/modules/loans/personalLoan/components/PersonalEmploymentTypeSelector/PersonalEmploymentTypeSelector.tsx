import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { PersonalEmploymentType } from "../../types/personalLoan.types";
import { styles } from "./PersonalEmploymentTypeSelector.styles";

interface PersonalEmploymentTypeSelectorProps {
  selectedType: PersonalEmploymentType;
  onSelectType: (type: PersonalEmploymentType) => void;
}

interface OptionConfig {
  type: PersonalEmploymentType;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const OPTIONS: OptionConfig[] = [
  {
    type: "salaried",
    title: "Salaried",
    icon: "briefcase-outline",
  },
  {
    type: "self-employed",
    title: "Self Employed",
    icon: "person-outline",
  },
];

export const PersonalEmploymentTypeSelector: React.FC<
  PersonalEmploymentTypeSelectorProps
> = ({ selectedType, onSelectType }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        Employment Type <Text style={styles.requiredStar}>*</Text>
      </Text>
      <View style={styles.cardGrid}>
        {OPTIONS.map((opt) => {
          const isActive = selectedType === opt.type;
          return (
            <TouchableOpacity
              key={opt.type}
              style={[styles.card, isActive && styles.cardActive]}
              onPress={() => onSelectType(opt.type)}
              activeOpacity={0.8}
              accessibilityRole="radio"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={opt.title}
            >
              {isActive && (
                <View style={styles.checkBadge}>
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                </View>
              )}
              <View style={styles.iconBox}>
                <Ionicons
                  name={opt.icon}
                  size={26}
                  color={isActive ? "#083B75" : "#64748B"}
                />
              </View>
              <Text
                style={[
                  styles.cardTitle,
                  isActive && styles.cardTitleActive,
                ]}
              >
                {opt.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default PersonalEmploymentTypeSelector;
