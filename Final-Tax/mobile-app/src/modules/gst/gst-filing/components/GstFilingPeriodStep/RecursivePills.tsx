import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { styles } from "./GstFilingPeriodStep.styles";

export interface RecursivePillsProps {
  items: readonly string[];
  selectedValue: string;
  onSelect: (item: string) => void;
  index?: number;
}

export const RecursivePills: React.FC<RecursivePillsProps> = ({
  items,
  selectedValue,
  onSelect,
  index = 0,
}) => {
  if (index >= items.length) {
    return null;
  }

  const item = items[index];
  const isSelected = selectedValue === item;

  return (
    <>
      <TouchableOpacity
        key={item}
        activeOpacity={0.8}
        onPress={() => onSelect(item)}
        style={[styles.periodPill, isSelected && styles.periodPillActive]}
      >
        <Text
          style={[
            styles.periodPillText,
            isSelected && styles.periodPillTextActive,
          ]}
        >
          {item}
        </Text>
      </TouchableOpacity>
      <RecursivePills
        items={items}
        selectedValue={selectedValue}
        onSelect={onSelect}
        index={index + 1}
      />
    </>
  );
};
