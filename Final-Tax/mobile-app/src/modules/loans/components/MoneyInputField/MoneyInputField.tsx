import React, { useMemo, useState } from "react";
import { Text, TextInput, View } from "react-native";
import { groupIndianDigits } from "@/shared/formatters/currencyFormatter";
import { normalizeMoneyInput } from "../../utils/moneyInput";
import { styles } from "./MoneyInputField.styles";

interface MoneyInputFieldProps {
  label: string;
  /** Raw whole-rupee digits or user input, e.g. "100000". */
  value: string;
  onChange: (rawDigits: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  maxLength?: number;
  rejectMalformedInput?: boolean;
  onInvalidInput?: () => void;
}

/**
 * Rupee amount input component.
 *
 * Requirements:
 * - Empty: displays "" so placeholder remains visible.
 * - Typing / Focused: displays raw unformatted value so commas do NOT format while typing.
 * - Blurred: displays Indian comma formatting (e.g. ₹1,00,000) for valid numeric amounts.
 * - Underlying state: stores normalized whole-rupee digits for valid amounts,
 *   or preserved string for invalid inputs so the validation layer can reject them.
 */
export const MoneyInputField: React.FC<MoneyInputFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  maxLength = 22,
  rejectMalformedInput = false,
  onInvalidInput,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const displayValue = useMemo(() => {
    if (!value) return "";
    const trimmed = value.trim();
    if (!trimmed) return "";

    // While typing / focused: show unformatted digits so commas don't disrupt editing
    if (isFocused) {
      const withoutSymbol = trimmed.replace(/^₹\s*/, "");
      if (/^\d{1,2}(?:,\d{2})*,\d{3}$/.test(withoutSymbol)) {
        return withoutSymbol.replace(/,/g, "");
      }
      return trimmed;
    }

    // When blurred: format valid digits with Indian commas
    const withoutSymbol = trimmed.replace(/^₹\s*/, "");
    if (/^\d+$/.test(withoutSymbol)) {
      return groupIndianDigits(withoutSymbol);
    }
    if (/^\d{1,2}(?:,\d{2})*,\d{3}$/.test(withoutSymbol)) {
      return withoutSymbol;
    }
    return trimmed;
  }, [value, isFocused]);

  const handleChangeText = (text: string) => {
    const normalized = normalizeMoneyInput(text);
    onChange(normalized);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>
        {label} {required ? <Text style={styles.requiredStar}>*</Text> : null}
      </Text>
      <View style={[styles.row, error ? styles.rowError : null]}>
        <Text style={styles.prefix}>₹</Text>
        <TextInput
          style={styles.input}
          value={displayValue}
          onChangeText={handleChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          keyboardType="number-pad"
          maxLength={maxLength}
          accessibilityLabel={label}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

export default MoneyInputField;
