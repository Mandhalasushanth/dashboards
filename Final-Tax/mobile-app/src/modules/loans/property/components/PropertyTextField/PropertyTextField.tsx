import React from "react";
import { Text, TextInput, View, type KeyboardTypeOptions } from "react-native";
import { styles } from "./PropertyTextField.styles";

interface PropertyTextFieldProps {
  label: string;
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  error?: string;
  maxLength: number;
  keyboardType?: KeyboardTypeOptions;
  required?: boolean;
}

/** A labelled single-line text input with an inline error. Any Unicode text is accepted. */
export const PropertyTextField: React.FC<PropertyTextFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  error,
  maxLength,
  keyboardType = "default",
  required = true,
}) => (
  <View style={styles.wrapper}>
    <Text style={styles.label}>
      {label} {required ? <Text style={styles.requiredStar}>*</Text> : null}
    </Text>
    <TextInput
      style={[styles.input, error ? styles.inputError : null]}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor="#94A3B8"
      maxLength={maxLength}
      keyboardType={keyboardType}
      accessibilityLabel={label}
    />
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);
