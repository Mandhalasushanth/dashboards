import React from "react";
import { View, Text } from "react-native";
import { TdsFormData, TdsFormErrors } from "../../../types/tdsForm.types";
import { ASSESSMENT_YEAR_OPTIONS } from "../../../constants/tdsForm.constants";
import { TdsInputField } from "../TdsInputField";
import { TdsDropdownField } from "../TdsDropdownField";
import { formatIndianAmount, cleanNumericValue } from "../../../utils/formatters";
import { styles } from "./YourDetailsSection.styles";

interface YourDetailsSectionProps {
  data?: TdsFormData;
  formData?: TdsFormData;
  errors: TdsFormErrors;
  onChange: (key: keyof TdsFormData, value: string) => void;
}

export const YourDetailsSection: React.FC<YourDetailsSectionProps> = ({
  data,
  formData,
  errors,
  onChange,
}) => {
  const currentData = formData || data || ({} as TdsFormData);

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Your details</Text>

      {/* PAN Number */}
      <TdsInputField
        label="PAN Number"
        placeholder="ABCDE1234F"
        value={currentData.panNumber}
        onChangeText={(text) =>
          onChange("panNumber", text.toUpperCase().replace(/[^A-Z0-9]/g, ""))
        }
        error={errors.panNumber}
        maxLength={10}
        autoCapitalize="characters"
        characterCountText={`${(currentData.panNumber || "").length} / 10`}
        required
      />

      {/* Assessment Year Dropdown */}
      <TdsDropdownField
        label="Assessment Year"
        placeholder="Select an option"
        value={currentData.assessmentYear}
        options={ASSESSMENT_YEAR_OPTIONS}
        onSelect={(val) => onChange("assessmentYear", val)}
        error={errors.assessmentYear}
        required
      />

      {/* Total Income for the Year */}
      <TdsInputField
        label="Total Income for the Year"
        placeholder="0"
        value={formatIndianAmount(currentData.totalIncome)}
        onChangeText={(text) =>
          onChange("totalIncome", cleanNumericValue(text))
        }
        error={errors.totalIncome}
        isCurrency
        keyboardType="numeric"
        required
      />

      {/* Total Deductions Claimed */}
      <TdsInputField
        label="Total Deductions Claimed"
        placeholder="0"
        value={formatIndianAmount(currentData.totalDeductions)}
        onChangeText={(text) =>
          onChange("totalDeductions", cleanNumericValue(text))
        }
        error={errors.totalDeductions}
        isCurrency
        keyboardType="numeric"
      />

    </View>
  );
};

export default YourDetailsSection;
