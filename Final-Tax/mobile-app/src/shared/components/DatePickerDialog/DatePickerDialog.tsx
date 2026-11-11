import React, { useEffect, useState } from "react";
import { Keyboard, Modal, Platform, Text, TouchableOpacity, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "@/shared/hooks/useTheme";
import { styles } from "./DatePickerDialog.styles";

export interface DatePickerDialogProps {
  visible: boolean;
  /** Date the calendar opens on. Read when the dialog opens; later changes are ignored until it reopens. */
  value: Date;
  /** The user confirmed a date (OK on Android, Done on iOS). */
  onConfirm: (date: Date) => void;
  /** The user dismissed the calendar without choosing. Must just close it; it can also follow `onConfirm` on Android. */
  onCancel: () => void;
  minimumDate?: Date;
  maximumDate?: Date;
  /** Heading of the iOS sheet. */
  title?: string;
}

/**
 * The one calendar of the app. Android shows the platform Material date dialog (blue header with
 * the selected date, month grid, CANCEL / OK); iOS shows the date spinner in a bottom sheet with
 * Cancel / Done. It only chooses a Date: the field that opens it, the date format it stores and
 * the min/max rules belong to the caller (see UniversalDatePicker for the standard field).
 */
export function DatePickerDialog({
  visible,
  value,
  onConfirm,
  onCancel,
  minimumDate,
  maximumDate,
  title,
}: DatePickerDialogProps) {
  // A focused text field would otherwise bring the keyboard back when the calendar closes.
  useEffect(() => {
    if (visible) Keyboard.dismiss();
  }, [visible]);

  if (!visible) return null;

  if (Platform.OS === "android") {
    return (
      <DateTimePicker
        value={value}
        mode="date"
        display="default"
        onValueChange={(_event, selected) => {
          if (selected) onConfirm(selected);
        }}
        onDismiss={onCancel}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
      />
    );
  }

  if (Platform.OS === "ios") {
    return (
      <IosDateSheet
        value={value}
        title={title}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );
  }

  return null; // web: fields use the browser's own date input
}

type IosDateSheetProps = Omit<DatePickerDialogProps, "visible">;

/** Mounted only while open, so the wheel always starts from the current `value`. */
function IosDateSheet({ value, title, minimumDate, maximumDate, onConfirm, onCancel }: IosDateSheetProps) {
  const { isDark } = useTheme();
  const [pending, setPending] = useState<Date>(value);

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.iosModalOverlay}>
        <View style={styles.iosPickerContainer}>
          <View style={styles.iosPickerHeader}>
            <TouchableOpacity onPress={onCancel} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.iosCancelButton}>Cancel</Text>
            </TouchableOpacity>

            <Text style={styles.iosHeaderTitle}>{title || "Select Date"}</Text>

            <TouchableOpacity onPress={() => onConfirm(pending)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.iosDoneButton}>Done</Text>
            </TouchableOpacity>
          </View>

          <DateTimePicker
            value={pending}
            mode="date"
            display="spinner"
            onValueChange={(_event, selected) => {
              if (selected) setPending(selected);
            }}
            onDismiss={onCancel}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            textColor={isDark ? "#F8FAFC" : "#0F172A"}
          />
        </View>
      </View>
    </Modal>
  );
}

export default DatePickerDialog;
