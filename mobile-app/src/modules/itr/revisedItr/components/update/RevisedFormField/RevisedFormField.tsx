import React from "react";
import { View, Text, TextInput } from "react-native";
import { AmountTextInput } from "@/shared/components/AmountTextInput";
import { RevisedItrAckInfoIcon } from "../../common";
import { styles } from "./RevisedFormField.styles";

interface RevisedFormFieldProps {
  label: string;
  value: string;
  onChangeText: (val: string) => void;
  originalValue?: string;
  changeValue?: string;
  isMandatory?: boolean;
  placeholder?: string;
  keyboardType?: "default" | "number-pad" | "numeric";
  maxLength?: number;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  error?: string;
  isAmount?: boolean;
  infoTooltip?: {
    title: string;
    text: string;
  };
  helperText?: string;
}

export const RevisedFormField: React.FC<RevisedFormFieldProps> = ({
  label,
  value,
  onChangeText,
  originalValue,
  isMandatory = false,
  placeholder,
  keyboardType = "default",
  maxLength,
  autoCapitalize = "none",
  error,
  isAmount = false,
  infoTooltip,
  helperText,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>
          {label} {isMandatory ? <Text style={styles.star}>*</Text> : null}
        </Text>
        {infoTooltip ? (
          <RevisedItrAckInfoIcon
            title={infoTooltip.title}
            text={infoTooltip.text}
            style={styles.infoIconSpacing}
          />
        ) : null}
      </View>

      {helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}

      <View style={styles.stackedBody}>
        {originalValue ? (
          <View style={styles.stackedRow}>
            <Text style={styles.fieldSubLabel}>Original</Text>
            <Text style={styles.originalValueText}>{originalValue}</Text>
          </View>
        ) : null}

        <View style={styles.inputGroup}>
          {originalValue ? (
            <Text style={styles.inputSubLabel}>Revised</Text>
          ) : null}
          {isAmount ? (
            <AmountTextInput
              style={[styles.input, error ? styles.errorInput : null]}
              value={value}
              onChangeText={onChangeText}
              placeholder={placeholder}
              placeholderTextColor="#94A3B8"
              maxLength={maxLength}
            />
          ) : (
            <TextInput
              style={[styles.input, error ? styles.errorInput : null]}
              value={value}
              onChangeText={onChangeText}
              placeholder={placeholder}
              placeholderTextColor="#94A3B8"
              keyboardType={keyboardType}
              maxLength={maxLength}
              autoCapitalize={autoCapitalize}
            />
          )}
        </View>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};
