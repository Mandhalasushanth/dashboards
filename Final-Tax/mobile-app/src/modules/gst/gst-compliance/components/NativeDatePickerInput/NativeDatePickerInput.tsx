import React from "react";
import { UniversalDatePicker, parseStringToDate } from "@/shared/components/UniversalDatePicker";

export interface NativeDatePickerInputProps {
  label: string;
  value: string;
  onChange: (formattedDate: string) => void;
  required?: boolean;
  error?: string;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  helperText?: string;
  validateMinDate?: string;
  validateMaxDate?: string;
}

export const NativeDatePickerInput: React.FC<NativeDatePickerInputProps> = ({
  validateMaxDate,
  maximumDate,
  ...rest
}) => {
  const effectiveMaxDate =
    maximumDate || (validateMaxDate ? parseStringToDate(validateMaxDate) : undefined);

  return <UniversalDatePicker maximumDate={effectiveMaxDate} {...rest} />;
};

export default NativeDatePickerInput;
