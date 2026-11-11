import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { AssessmentYearItem } from "../../types/previousYear.types";
import { AssessmentYearCard } from "../AssessmentYearCard";
import { styles } from "./AssessmentYearSelector.styles";

interface AssessmentYearSelectorProps {
  items: AssessmentYearItem[];
  selectedId: string;
  onSelectYear: (id: string) => void;
}

export const AssessmentYearSelector: React.FC<AssessmentYearSelectorProps> = ({
  items,
  selectedId,
  onSelectYear,
}) => {
  return (
    <View style={styles.container}>
      {/* Top Information Card */}
      <View style={styles.topInfoCard}>
        <View style={styles.calendarIconCircle}>
          <Ionicons name="calendar" size={24} color="#F97316" />
        </View>

        <View style={styles.topInfoTextGroup}>
          <Text style={styles.topInfoTitle}>Choose Assessment Year</Text>
          <Text style={styles.topInfoDescription}>
            Only assessment years that are eligible for filing are shown below.
          </Text>
        </View>
      </View>

      {/* Cards List */}
      <View style={styles.cardsList}>
        {items.map((item) => (
          <AssessmentYearCard
            key={item.id}
            item={item}
            isSelected={selectedId === item.id}
            onSelect={onSelectYear}
          />
        ))}
      </View>

      {/* Bottom Eligibility Information Card */}
      <View style={styles.noticeCard}>
        <View style={styles.noticeIconCircle}>
          <Ionicons name="information" size={20} color="#FFFFFF" />
        </View>

        <View style={styles.noticeTextGroup}>
          <Text style={styles.noticeTitle}>Eligibility Information</Text>
          <Text style={styles.noticeDescription}>
            Assessment years are displayed based on the current Income Tax
            Department filing rules. Closed years cannot be selected.
          </Text>
        </View>
      </View>
    </View>
  );
};
