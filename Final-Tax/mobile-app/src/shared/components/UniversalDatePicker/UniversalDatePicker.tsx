import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  Keyboard,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { DatePickerDialog } from "@/shared/components/DatePickerDialog";
import { useTheme } from "@/shared/hooks/useTheme";
import {
  formatDateDDMMYYYY,
  maskDateInput,
  parseDDMMYYYY,
} from "@/shared/formatters/dateFormatter";
import {
  styles,
  getLabelThemeStyle,
  getInputBoxThemeStyle,
  getValueTextThemeStyle,
  getWebInputStyle,
} from "./UniversalDatePicker.styles";

/**
 * "DD MMM YYYY" (e.g. 05 Mar 2024) is the historical default output.
 * "DD-MM-YYYY" (e.g. 05-03-2024) is used by forms that store numeric dates.
 */
export type UniversalDateFormat = "DD MMM YYYY" | "DD-MM-YYYY";

export interface UniversalDatePickerProps {
  label?: string;
  value: string;
  onChange: (formattedDate: string) => void;
  required?: boolean;
  error?: string;
  placeholder?: string;
  helperText?: string;
  maximumDate?: Date;
  minimumDate?: Date;
  validateMinDate?: string;
  /** Output format of `onChange`. Defaults to "DD MMM YYYY". */
  valueFormat?: UniversalDateFormat;
  /**
   * Lets the user type the date (DD-MM-YYYY, digits only, dashes added
   * automatically) as well as pick it from the calendar icon.
   * Requires `valueFormat="DD-MM-YYYY"`.
   */
  allowManualEntry?: boolean;
  /** Date the calendar opens on when the field is empty. Defaults to today. */
  initialPickerDate?: Date;
  /** Called when the manual-entry text field loses focus. */
  onBlur?: () => void;
  /** Set false when the parent renders its own error text. Defaults to true. */
  showErrorText?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  /** Optional icon tint color. Defaults to blue "#0284C7" */
  iconColor?: string;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function formatDateToString(date: Date): string {
  const d = String(date.getDate()).padStart(2, "0");
  const m = MONTHS[date.getMonth()];
  const y = date.getFullYear();
  return `${d} ${m} ${y}`;
}

export function parseStringToDate(str?: string): Date {
  if (!str) return new Date();
  const clean = str.trim();

  // Try "DD MMM YYYY"
  const parts = clean.split(" ");
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const monthIndex = MONTHS.indexOf(parts[1]);
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && monthIndex !== -1 && !isNaN(year)) {
      return new Date(year, monthIndex, day);
    }
  }

  // Try "DD-MM-YYYY"
  const dashParts = clean.split("-");
  if (dashParts.length === 3 && dashParts[0].length <= 2) {
    const d = parseInt(dashParts[0], 10);
    const m = parseInt(dashParts[1], 10) - 1;
    const y = parseInt(dashParts[2], 10);
    if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
      return new Date(y, m, d);
    }
  }

  const parsed = new Date(clean);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

const clampDate = (date: Date, min?: Date, max?: Date): Date => {
  if (min && date.getTime() < min.getTime()) return min;
  if (max && date.getTime() > max.getTime()) return max;
  return date;
};

export const UniversalDatePicker: React.FC<UniversalDatePickerProps> = ({
  label,
  value,
  onChange,
  required = false,
  error,
  placeholder,
  helperText,
  maximumDate,
  minimumDate,
  validateMinDate,
  valueFormat = "DD MMM YYYY",
  allowManualEntry = false,
  initialPickerDate,
  onBlur,
  showErrorText = true,
  containerStyle,
  inputStyle,
  textStyle,
  iconColor: customIconColor,
}) => {
  const { isDark } = useTheme();
  const [showPicker, setShowPicker] = useState(false);

  const isNumericFormat = valueFormat === "DD-MM-YYYY";
  const manualEntry = allowManualEntry && isNumericFormat;
  const effectivePlaceholder = placeholder ?? (isNumericFormat ? "DD-MM-YYYY" : "Select Date");
  const effectiveMinDate =
    minimumDate || (validateMinDate ? parseStringToDate(validateMinDate) : undefined);

  const formatOutput = (date: Date): string =>
    isNumericFormat ? formatDateDDMMYYYY(date) : formatDateToString(date);

  // Date the native picker should show. Partial or invalid manual text never
  // reaches the picker; it falls back to the initial date instead.
  const resolvePickerDate = (): Date => {
    const parsed = isNumericFormat
      ? parseDDMMYYYY(value)
      : value
        ? parseStringToDate(value)
        : null;
    return clampDate(parsed || initialPickerDate || new Date(), effectiveMinDate, maximumDate);
  };

  const currentDate = resolvePickerDate();
  const [pickerDate, setPickerDate] = useState<Date>(currentDate);

  const openPicker = () => {
    // Make sure no text field keeps (or later regains) focus: this is what
    // re-opened the keyboard after a picker/dropdown closed.
    Keyboard.dismiss();
    setPickerDate(resolvePickerDate());
    setShowPicker(true);
  };

  const handlePickerConfirm = (selectedDate: Date) => {
    setShowPicker(false);
    onChange(formatOutput(selectedDate));
  };

  const handlePickerCancel = () => {
    setShowPicker(false);
  };

  const iconColor = customIconColor || (isDark ? "#94A3B8" : "#0284C7");
  const errorNode = error && showErrorText ? <Text style={styles.errorText}>{error}</Text> : null;
  const helperNode = helperText && !error ? <Text style={styles.helperText}>{helperText}</Text> : null;
  const labelNode = label ? (
    <Text style={[styles.label, getLabelThemeStyle(isDark)]}>
      {label} {required && <Text style={styles.star}>*</Text>}
    </Text>
  ) : null;

  // Web Platform input
  if (Platform.OS === "web") {
    const formatForWeb = (d: Date): string => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

    const handleWebChange = (e: any) => {
      const val = e.target.value;
      if (val) {
        const [y, m, d] = val.split("-").map(Number);
        const newDate = new Date(y, m - 1, d);
        onChange(formatOutput(newDate));
      }
    };

    const hasValidValue = isNumericFormat ? parseDDMMYYYY(value) !== null : !!value;

    return (
      <View style={[styles.container, containerStyle]}>
        {labelNode}

        <View style={[styles.inputBox, getInputBoxThemeStyle(isDark, !!error), inputStyle]}>
          <Ionicons name="calendar-outline" size={20} color={iconColor} />
          <input
            type="date"
            value={hasValidValue ? formatForWeb(currentDate) : ""}
            onChange={handleWebChange}
            min={effectiveMinDate ? formatForWeb(effectiveMinDate) : undefined}
            max={maximumDate ? formatForWeb(maximumDate) : undefined}
            style={getWebInputStyle(isDark)}
          />
        </View>

        {errorNode}
        {helperNode}
      </View>
    );
  }

  return (
    <View style={[styles.container, containerStyle]}>
      {labelNode}

      {manualEntry ? (
        <View style={[styles.inputBox, getInputBoxThemeStyle(isDark, !!error), inputStyle]}>
          <TextInput
            style={[styles.manualInput, getValueTextThemeStyle(value, isDark), textStyle]}
            value={value}
            onChangeText={(text) => onChange(maskDateInput(text))}
            onBlur={onBlur}
            placeholder={effectivePlaceholder}
            placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
            keyboardType="number-pad"
            maxLength={10}
            autoCorrect={false}
            autoComplete="off"
            importantForAutofill="no"
            accessibilityLabel={label ? `${label} (DD-MM-YYYY)` : "Date (DD-MM-YYYY)"}
          />
          <TouchableOpacity
            onPress={openPicker}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Open calendar"
          >
            <Ionicons
              name="calendar-outline"
              size={18}
              color={error ? "#DC2626" : iconColor}
            />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={openPicker}
          style={[styles.inputBox, getInputBoxThemeStyle(isDark, !!error), inputStyle]}
        >
          <View style={styles.iconBox}>
            <Ionicons name="calendar-outline" size={17} color={error ? "#DC2626" : iconColor} />
          </View>

          <Text
            style={[
              styles.valueText,
              getValueTextThemeStyle(value, isDark),
              textStyle,
            ]}
            numberOfLines={1}
          >
            {value || effectivePlaceholder}
          </Text>

          <Ionicons name="chevron-down" size={18} color={iconColor} />
        </TouchableOpacity>
      )}

      {errorNode}
      {helperNode}

      {/* The app's one calendar: Material dialog on Android, spinner sheet on iOS */}
      <DatePickerDialog
        visible={showPicker}
        value={pickerDate}
        onConfirm={handlePickerConfirm}
        onCancel={handlePickerCancel}
        minimumDate={effectiveMinDate}
        maximumDate={maximumDate}
        title={label}
      />
    </View>
  );
};

export default UniversalDatePicker;
