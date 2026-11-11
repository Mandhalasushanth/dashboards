import React from "react";
import { Text, TextInput, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./PersonalIncomeSections.styles";

interface PersonalNameFieldProps {
  label: string;
  value: string;
  placeholder: string;
  error?: string;
  onChange: (text: string) => void;
}

/** A required free-text name input with a leading icon. Any Unicode text is accepted. */
export const PersonalNameField: React.FC<PersonalNameFieldProps> = ({
  label,
  value,
  placeholder,
  error,
  onChange,
}) => (
  <View style={styles.fieldWrapper}>
    <Text style={styles.fieldLabel}>
      {label} <Text style={styles.requiredStar}>*</Text>
    </Text>
    <View style={[styles.inputRow, error ? styles.inputError : null]}>
      <Ionicons name="business-outline" size={18} color="#64748B" />
      <TextInput
        style={styles.textInput}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        maxLength={80}
        accessibilityLabel={label}
      />
    </View>
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);
