import React from "react";
import { View, Text } from "react-native";
import { TdsFormData, TdsFormErrors } from "../../../types/tdsForm.types";
import { TDS_SECTIONS_OPTIONS } from "../../../constants/tdsForm.constants";
import { TdsInputField } from "../TdsInputField";
import { TdsDropdownField } from "../TdsDropdownField";
import { formatIndianAmount, cleanNumericValue } from "../../../utils/formatters";
import { styles } from "./DeductorSection.styles";

interface DeductorSectionProps {
  data?: TdsFormData;
  formData?: TdsFormData;
  errors: TdsFormErrors;
  onChange: (key: keyof TdsFormData, value: string) => void;
}

export const DeductorSection: React.FC<DeductorSectionProps> = ({
  data,
  formData,
  errors,
  onChange,
}) => {
  const currentData = formData || data || ({} as TdsFormData);

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Deductor</Text>

      {/* Employer / Deductor Name */}
      <TdsInputField
        label="Employer / Deductor Name"
        placeholder="Company or bank that deducted TDS"
        value={currentData.deductorName}
        onChangeText={(text) => onChange("deductorName", text)}
        error={errors.deductorName}
        required
      />

      {/* Deductor TAN */}
      <TdsInputField
        label="Deductor TAN"
        placeholder="BLRA12345C"
        value={currentData.deductorTan}
        onChangeText={(text) =>
          onChange("deductorTan", text.toUpperCase().replace(/[^A-Z0-9]/g, ""))
        }
        error={errors.deductorTan}
        maxLength={10}
        autoCapitalize="characters"
        characterCountText={`${(currentData.deductorTan || "").length} / 10`}
        required
      />

      {/* TDS Amount Deducted */}
      <TdsInputField
        label="TDS Amount Deducted"
        placeholder="0"
        value={formatIndianAmount(currentData.tdsAmount)}
        onChangeText={(text) =>
          onChange("tdsAmount", cleanNumericValue(text))
        }
        error={errors.tdsAmount}
        isCurrency
        keyboardType="numeric"
        required
      />

      {/* Deducted Under Section */}
      <TdsDropdownField
        label="Deducted Under Section"
        placeholder="Select section"
        value={currentData.deductedSection}
        options={TDS_SECTIONS_OPTIONS}
        onSelect={(val) => onChange("deductedSection", val)}
        error={errors.deductedSection}
        required
      />
    </View>
  );
};

export default DeductorSection;
