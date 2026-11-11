import React, { useState } from "react";
import { Platform, Modal, TouchableOpacity, View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { styles } from "./TaxNoticeDatePickerInput.styles";

export const parseStringToDate = (dateStr: string): Date | undefined => {
  if (!dateStr) return undefined;
  const parts = dateStr.trim().split(" ");
  if (parts.length === 3) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const d = parseInt(parts[0], 10);
    const m = months.indexOf(parts[1]);
    const y = parseInt(parts[2], 10);
    if (!isNaN(d) && m !== -1 && !isNaN(y)) return new Date(y, m, d);
  }
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) return parsed;
  return undefined;
};

export const formatDateToString = (date: Date): string => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const d = date.getDate().toString().padStart(2, "0");
  const m = months[date.getMonth()];
  const y = date.getFullYear();
  return d + " " + m + " " + y;
};

export interface TaxNoticeDatePickerInputProps {
  label: string;
  value: string;
  onChange: (formattedDate: string) => void;
  required?: boolean;
  error?: string;
  placeholder?: string;
  helperText?: string;
  maximumDate?: Date;
  minimumDate?: Date;
  validateMinDate?: string;
}

export const TaxNoticeDatePickerInput: React.FC<TaxNoticeDatePickerInputProps> = ({
  label, value, onChange, required, error, placeholder, helperText, maximumDate, minimumDate, validateMinDate
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date | undefined>(undefined);

  const currentDate = parseStringToDate(value) || new Date();

  const handleConfirm = (dateToSave: Date) => {
    onChange(formatDateToString(dateToSave));
    setShowPicker(false);
  };

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        {label} {required && <Text style={styles.requiredStar}>*</Text>}
      </Text>
      
      <TouchableOpacity 
        activeOpacity={0.8} 
        onPress={() => {
          setTempDate(currentDate);
          setShowPicker(true);
        }}
        style={[styles.inputBox, error ? styles.inputBoxError : null]}
      >
        <Text style={[styles.inputValue, !value && { color: "#94A3B8" }]}>
          {value || placeholder || "Select date"}
        </Text>
        <Ionicons name="calendar-outline" size={20} color="#64748B" style={styles.calendarIconRight} />
      </TouchableOpacity>
      
      {helperText && !error ? <Text style={styles.helperText}>{helperText}</Text> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {Platform.OS === "ios" && (
        <Modal visible={showPicker} transparent animationType="slide">
          <View style={styles.iosPickerOverlay}>
            <View style={styles.iosPickerContainer}>
              <View style={styles.iosPickerHeader}>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text style={styles.iosPickerCancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleConfirm(tempDate || currentDate)}>
                  <Text style={styles.iosPickerConfirm}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate || currentDate}
                mode="date"
                display="spinner"
                maximumDate={maximumDate}
                minimumDate={minimumDate}
                onChange={(event, date) => {
                  if (date) setTempDate(date);
                }}
              />
            </View>
          </View>
        </Modal>
      )}

      {Platform.OS !== "ios" && showPicker && (
        <DateTimePicker
          value={currentDate}
          mode="date"
          display="default"
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          onChange={(event, date) => {
            setShowPicker(false);
            if (event.type === "set" && date) {
              handleConfirm(date);
            }
          }}
        />
      )}
    </View>
  );
};

export default TaxNoticeDatePickerInput;
