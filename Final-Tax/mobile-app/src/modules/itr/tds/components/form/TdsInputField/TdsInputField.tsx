import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  KeyboardTypeOptions,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./TdsInputField.styles";

interface TdsInputFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  isCurrency?: boolean;
  required?: boolean;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  characterCountText?: string;
}

export const TdsInputField: React.FC<TdsInputFieldProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  isCurrency = false,
  required = false,
  keyboardType = "default",
  maxLength,
  autoCapitalize = "none",
  characterCountText,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {/* Label Row */}
      <View style={styles.labelRow}>
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.requiredAsterisk}> *</Text>}
        </Text>
        {!!characterCountText && (
          <Text style={styles.countText}>{characterCountText}</Text>
        )}
      </View>

      {/* Input Box Wrapper */}
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          !!error && styles.inputWrapperError,
        ]}
      >
        {isCurrency && (
          <View style={styles.currencyBox}>
            <Text style={styles.currencyText}>₹</Text>
          </View>
        )}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          keyboardType={keyboardType}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={styles.input}
        />
      </View>

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
    </View>
  );
};

export default TdsInputField;
