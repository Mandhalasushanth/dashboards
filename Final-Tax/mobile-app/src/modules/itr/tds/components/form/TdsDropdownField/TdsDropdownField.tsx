import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SelectOption } from "../../../types/tdsForm.types";
import { TdsSelectModal } from "../TdsSelectModal";
import { styles } from "./TdsDropdownField.styles";

interface TdsDropdownFieldProps {
  label: string;
  placeholder: string;
  value: string;
  options: SelectOption[];
  onSelect: (value: string) => void;
  error?: string;
  required?: boolean;
}

export const TdsDropdownField: React.FC<TdsDropdownFieldProps> = ({
  label,
  placeholder,
  value,
  options,
  onSelect,
  error,
  required = false,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Pure functional match - zero loops
  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : "";

  return (
    <View style={styles.container}>
      {/* Label */}
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.requiredAsterisk}> *</Text>}
      </Text>

      {/* Dropdown Button */}
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => setIsModalVisible(true)}
        style={[
          styles.fieldWrapper,
          !!error && styles.fieldWrapperError,
        ]}
      >
        <Text
          style={[
            styles.valueText,
            !displayLabel && styles.placeholderText,
          ]}
          numberOfLines={1}
        >
          {displayLabel || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#64748B" />
      </TouchableOpacity>

      {/* Error Row */}
      {!!error && (
        <View style={styles.errorRow}>
          <Ionicons
            name="alert-circle"
            size={13}
            color="#DC2626"
            style={styles.errorIcon}
          />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Bottom Sheet Picker Modal */}
      <TdsSelectModal
        visible={isModalVisible}
        title={`Select ${label}`}
        options={options}
        selectedValue={value}
        onSelect={onSelect}
        onClose={() => setIsModalVisible(false)}
      />
    </View>
  );
};

export default TdsDropdownField;
