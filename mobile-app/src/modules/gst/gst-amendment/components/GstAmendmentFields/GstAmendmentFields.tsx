import React from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardTypeOptions } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { UniversalDatePicker } from "@/shared/components/UniversalDatePicker";
import { removeEmoji } from "@/modules/gst/utils/gstEmojiFilter";
import { styles } from "./GstAmendmentFields.styles";

interface InputFieldProps {
  label: string;
  required?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  maxLength?: number;
  counterText?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  required = true,
  value,
  onChangeText,
  placeholder,
  error,
  keyboardType,
  autoCapitalize,
  maxLength,
  counterText,
}) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.fieldLabel}>
      {label} {required && <Text style={styles.star}>*</Text>}
    </Text>
    <TextInput
      style={[styles.input, Boolean(error) && styles.inputError]}
      placeholder={placeholder}
      placeholderTextColor="#94A3B8"
      value={value}
      onChangeText={(text) => onChangeText(removeEmoji(text))}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      maxLength={maxLength}
    />
    {counterText && (
      <View style={styles.fieldCounterRow}>
        <Text style={styles.fieldCounterText}>{counterText}</Text>
      </View>
    )}
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

interface DropdownFieldProps {
  label: string;
  required?: boolean;
  value: string;
  placeholder?: string;
  error?: string;
  onPress: () => void;
}

export const DropdownField: React.FC<DropdownFieldProps> = ({
  label,
  required = true,
  value,
  placeholder = "Select an option",
  error,
  onPress,
}) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.fieldLabel}>
      {label} {required && <Text style={styles.star}>*</Text>}
    </Text>
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.dropdownSelect, Boolean(error) && styles.inputError]}
    >
      <Text style={value ? styles.dropdownSelectText : styles.dropdownPlaceholderText}>
        {value || placeholder}
      </Text>
      <Ionicons name="chevron-down" size={18} color="#64748B" />
    </TouchableOpacity>
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

interface DateFieldProps {
  label: string;
  required?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  maximumDate?: Date;
  minimumDate?: Date;
}

export const DateField: React.FC<DateFieldProps> = ({
  label,
  required = true,
  value,
  onChangeText,
  placeholder = "Select date of birth",
  error,
  maximumDate,
  minimumDate,
}) => (
  <UniversalDatePicker
    label={label}
    required={required}
    value={value}
    onChange={onChangeText}
    placeholder={placeholder}
    error={error}
    valueFormat="DD-MM-YYYY"
    maximumDate={maximumDate}
    minimumDate={minimumDate}
  />
);

interface PhoneFieldProps {
  label: string;
  required?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
}

export const PhoneField: React.FC<PhoneFieldProps> = ({
  label,
  required = true,
  value,
  onChangeText,
  placeholder = "Enter mobile number",
  error,
}) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.fieldLabel}>
      {label} {required && <Text style={styles.star}>*</Text>}
    </Text>
    <View style={[styles.phoneInputWrap, Boolean(error) && styles.inputError]}>
      <View style={styles.phonePrefixBox}>
        <Text style={styles.phonePrefixText}>+91</Text>
      </View>
      <TextInput
        style={styles.phoneTextInput}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        value={value}
        onChangeText={(text) => onChangeText(removeEmoji(text))}
        keyboardType="phone-pad"
        maxLength={10}
      />
    </View>
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);
