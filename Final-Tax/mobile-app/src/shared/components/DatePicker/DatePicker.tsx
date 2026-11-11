import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/design-system/colors";

export interface DatePickerProps {
  label?: string;
  value?: string;
  placeholder?: string;
  onPress: () => void;
  error?: string | null;
  required?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  placeholder = "Select Date (DD/MM/YYYY)",
  onPress,
  error,
  required = false,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={styles.label}>
          {label} {required && <Text style={{ color: Colors.error }}>*</Text>}
        </Text>
      )}

      <TouchableOpacity
        style={[
          styles.input,
          error ? styles.inputError : undefined,
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.valueText,
            !value && styles.placeholderText,
          ]}
        >
          {value || placeholder}
        </Text>
        <Ionicons name="calendar-outline" size={20} color={Colors.textSecondary} />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 6,
  },
  input: {
    height: 50,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
  },
  inputError: {
    borderColor: Colors.error,
  },
  valueText: {
    fontSize: 15,
    color: Colors.text,
  },
  placeholderText: {
    color: Colors.textSecondary,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 4,
    fontWeight: "500",
  },
});

export default DatePicker;
