import React from "react";
import { View, Text, TextInput, TouchableOpacity, TextInputProps } from "react-native";
import { styles } from "./LoanFormField.styles";

export type LoanFieldType = "text" | "number" | "select" | "radio" | "email" | "phone";

export interface OptionItem {
  label: string;
  value: string;
}

export interface LoanFormFieldConfig {
  name: string;
  label: string;
  type?: LoanFieldType;
  required?: boolean;
  placeholder?: string;
  helperText?: string;
  options?: OptionItem[] | readonly string[];
  maxLength?: number;
  keyboardType?: TextInputProps["keyboardType"];
  autoCapitalize?: TextInputProps["autoCapitalize"];
}

export interface LoanFormFieldProps {
  config: LoanFormFieldConfig;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const LoanFormField: React.FC<LoanFormFieldProps> = ({
  config,
  value,
  onChange,
  error,
}) => {
  const {
    label,
    type = "text",
    required = false,
    placeholder,
    helperText,
    options,
    maxLength,
    keyboardType,
    autoCapitalize,
  } = config;

  const renderInput = () => {
    if (type === "radio" && options) {
      return (
        <View style={styles.radioRow}>
          {options.map((opt) => {
            const optVal = typeof opt === "string" ? opt : opt.value;
            const optLbl = typeof opt === "string" ? opt : opt.label;
            const isSelected = value === optVal;
            return (
              <TouchableOpacity
                key={optVal}
                style={[styles.radioChip, isSelected && styles.radioChipActive]}
                onPress={() => onChange(optVal)}
                activeOpacity={0.7}
              >
                <Text style={[styles.radioText, isSelected && styles.radioTextActive]}>
                  {optLbl}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      );
    }

    const kbType =
      keyboardType ||
      (type === "number" ? "numeric" : type === "phone" ? "number-pad" : type === "email" ? "email-address" : "default");

    return (
      <TextInput
        style={[styles.input, Boolean(error) && styles.inputError]}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        value={value}
        onChangeText={onChange}
        keyboardType={kbType}
        autoCapitalize={autoCapitalize || (type === "email" ? "none" : "sentences")}
        maxLength={maxLength}
      />
    );
  };

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.requiredStar}>*</Text>}
      </Text>
      {renderInput()}
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

export default LoanFormField;
