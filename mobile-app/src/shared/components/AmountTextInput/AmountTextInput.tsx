import React, { useRef, useState, useEffect } from "react";
import {
  TextInput,
  TextInputProps,
  TextInputSelectionChangeEvent,
  NativeSyntheticEvent,
  TargetedEvent,
} from "react-native";
import {
  formatIndianAmount,
  parseIndianAmount,
  calculateIndianAmountCursor,
} from "@/shared/formatters/currencyFormatter";

export interface AmountTextInputProps extends Omit<TextInputProps, "value" | "onChangeText"> {
  value: string | number | null | undefined;
  onChangeText: (rawNumeric: string) => void;
  allowDecimals?: boolean;
  allowNegative?: boolean;
}

export const AmountTextInput: React.FC<AmountTextInputProps> = ({
  value,
  onChangeText,
  allowDecimals = false,
  allowNegative = false,
  maxLength,
  keyboardType,
  onSelectionChange,
  onFocus,
  onBlur,
  ...restProps
}) => {
  const rawValue = parseIndianAmount(value, allowDecimals, allowNegative);
  const formattedValue = formatIndianAmount(rawValue, allowDecimals);

  // Cursor position in the currently displayed (formatted) string.
  // Tracks where the user's cursor is so we can compute the new position after each edit.
  const cursorRef = useRef(formattedValue.length);

  // One-time programmatic cursor override; set after each edit, cleared by onSelectionChange.
  const [selection, setSelection] = useState<{ start: number; end: number } | undefined>(undefined);
  // True when we pushed a programmatic selection; cleared on the next onSelectionChange.
  const pendingCursorRef = useRef(false);

  // Tracks the previously displayed formatted value so calculateIndianAmountCursor has correct context.
  const prevFormattedRef = useRef(formattedValue);

  // Sync prevFormattedRef when the formatted value changes from an external prop update.
  useEffect(() => {
    prevFormattedRef.current = formattedValue;
  }, [formattedValue]);

  const handleChangeText = (inputText: string) => {
    const prevFormatted = prevFormattedRef.current;
    const prevCursor = cursorRef.current;

    const raw = parseIndianAmount(inputText, allowDecimals, allowNegative);
    const constrained = maxLength ? raw.slice(0, maxLength) : raw;
    const newFormatted = formatIndianAmount(constrained, allowDecimals);

    // If the raw value hasn't changed (e.g. user deleted a comma), just reposition the cursor.
    if (constrained === rawValue) {
      const cursorInInput = Math.min(
        inputText.length,
        Math.max(0, prevCursor + (inputText.length - prevFormatted.length))
      );
      const adjustedCursor = Math.max(0, cursorInInput);
      cursorRef.current = adjustedCursor;
      pendingCursorRef.current = true;
      setSelection({ start: adjustedCursor, end: adjustedCursor });
      return;
    }

    // Estimate cursor position in inputText: prevCursor ± delta of string lengths.
    const cursorInInput = Math.min(
      inputText.length,
      Math.max(0, prevCursor + (inputText.length - prevFormatted.length))
    );

    const newCursor = calculateIndianAmountCursor(prevFormatted, inputText, newFormatted, cursorInInput);

    cursorRef.current = newCursor;
    prevFormattedRef.current = newFormatted;
    pendingCursorRef.current = true;
    setSelection({ start: newCursor, end: newCursor });

    onChangeText(constrained);
  };

  const handleSelectionChange = (e: TextInputSelectionChangeEvent) => {
    const { end } = e.nativeEvent.selection;

    if (pendingCursorRef.current) {
      // Acknowledge the programmatic cursor set and release control back to the native input.
      pendingCursorRef.current = false;
      setSelection(undefined);
    } else {
      // User tapped to reposition cursor — track the new position.
      cursorRef.current = end;
    }

    onSelectionChange?.(e);
  };

  const handleBlur = (e: NativeSyntheticEvent<TargetedEvent>) => {
    setSelection(undefined);
    pendingCursorRef.current = false;
    onBlur?.(e);
  };

  return (
    <TextInput
      {...restProps}
      value={formattedValue}
      onChangeText={handleChangeText}
      onSelectionChange={handleSelectionChange}
      onFocus={onFocus}
      onBlur={handleBlur}
      selection={selection}
      keyboardType={keyboardType ?? (allowDecimals ? "decimal-pad" : "numeric")}
    />
  );
};

export default AmountTextInput;
