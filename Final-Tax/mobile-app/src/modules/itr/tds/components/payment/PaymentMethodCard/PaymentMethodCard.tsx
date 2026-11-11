import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { PaymentOptionItem } from "../../../types/payment.types";
import { styles } from "./PaymentMethodCard.styles";

interface PaymentMethodCardProps {
  item: PaymentOptionItem;
  isSelected: boolean;
  onSelect: (id: PaymentOptionItem["id"]) => void;
  disabled?: boolean;
}

export const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  item,
  isSelected,
  onSelect,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => !disabled && onSelect(item.id)}
      disabled={disabled}
      style={[
        styles.card,
        isSelected ? styles.cardSelected : styles.cardUnselected,
        disabled && styles.cardDisabled,
      ]}
    >
      {/* Icon Box */}
      <View style={[styles.iconBox, isSelected ? styles.iconBoxSelected : null]}>
        <Ionicons
          name={item.iconName}
          size={20}
          color={isSelected ? "#F97316" : "#0B1F3A"}
        />
      </View>

      {/* Text Group */}
      <View style={styles.textGroup}>
        <Text style={styles.title}>{item.title}</Text>
        {item.subtitle ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {item.subtitle}
          </Text>
        ) : null}
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
