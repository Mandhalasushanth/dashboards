import React from "react";
import { View, Text } from "react-native";
import { TdsFormData, TdsFormErrors } from "../../../types/tdsForm.types";
import { PREVIOUS_ITR_OPTIONS } from "../../../constants/tdsForm.constants";
import { TdsInputField } from "../TdsInputField";
import { TdsDropdownField } from "../TdsDropdownField";
import { styles } from "./RefundBankSection.styles";

interface RefundBankSectionProps {
  data?: TdsFormData;
  formData?: TdsFormData;
  errors: TdsFormErrors;
  onChange: (key: keyof TdsFormData, value: string) => void;
}

export const RefundBankSection: React.FC<RefundBankSectionProps> = ({
  data,
  formData,
  errors,
  onChange,
}) => {
  const currentData = formData || data || ({} as TdsFormData);

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Refund bank account</Text>

      {/* Bank Name */}
      <TdsInputField
        label="Bank Name"
        placeholder="HDFC Bank"
        value={currentData.bankName}
        onChangeText={(text) => onChange("bankName", text)}
        error={errors.bankName}
        required
      />

      {/* Account Number */}
      <TdsInputField
        label="Account Number"
        placeholder="Enter account number"
        value={currentData.accountNumber}
        onChangeText={(text) =>
          onChange("accountNumber", text.replace(/[^0-9]/g, ""))
        }
        error={errors.accountNumber}
        keyboardType="numeric"
        maxLength={18}
        characterCountText={`${(currentData.accountNumber || "").length} / 9–18 digits`}
        required
      />

      {/* IFSC Code */}
      <TdsInputField
        label="IFSC Code"
        placeholder="HDFC0001234"
        value={currentData.ifscCode}
        onChangeText={(text) =>
          onChange("ifscCode", text.toUpperCase().replace(/[^A-Z0-9]/g, ""))
        }
        error={errors.ifscCode}
        maxLength={11}
        autoCapitalize="characters"
        characterCountText={`${(currentData.ifscCode || "").length} / 11`}
        required
      />

      {/* Previous ITR Filed for this Year? */}
      <TdsDropdownField
        label="Previous ITR Filed for this Year?"
        placeholder="Select an option"
        value={currentData.previousItrFiled}
        options={PREVIOUS_ITR_OPTIONS}
        onSelect={(val) => onChange("previousItrFiled", val)}
        error={errors.previousItrFiled}
        required
      />

    </View>
  );
};

export default RefundBankSection;
