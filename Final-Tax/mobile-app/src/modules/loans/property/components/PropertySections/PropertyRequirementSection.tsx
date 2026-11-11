import React from "react";
import { Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Dropdown } from "@/shared/components/Dropdown";
import { MoneyInputField } from "../../../components/MoneyInputField";
import {
  PROPERTY_PURPOSE_OPTIONS,
  type PropertyPurpose,
  type PropertyStageValue,
} from "../../types/property.types";
import { getStageQuestion } from "../../utils/propertyFlow";
import { PROPERTY_OTHER_MAX_LENGTH } from "../../validation/propertyLoanValidation";
import { PropertyTextField } from "../PropertyTextField/PropertyTextField";
import type { PropertySectionProps } from "./types";
import { styles } from "./PropertySections.styles";

const PURPOSE_OPTIONS = [...PROPERTY_PURPOSE_OPTIONS];

/** Section A: how much, what for, and the one status question that fits the purpose. */
export const PropertyRequirementSection: React.FC<PropertySectionProps> = ({
  data,
  errors,
  onChangeField,
}) => {
  const question = getStageQuestion(data.purpose);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Ionicons name="cash-outline" size={18} color="#083B75" />
        <Text style={styles.title}>Loan Requirement</Text>
      </View>

      <MoneyInputField
        label="Requested Loan Amount"
        required
        value={data.requestedAmount}
        onChange={(digits) => onChangeField("requestedAmount", digits)}
        placeholder="e.g. 25,00,000"
        error={errors.requestedAmount}
      />

      <Dropdown
        label="Purpose of Loan"
        required
        options={PURPOSE_OPTIONS}
        value={data.purpose}
        onSelect={(value) => onChangeField("purpose", value as PropertyPurpose)}
        placeholder="Select purpose"
        error={errors.purpose}
      />

      {data.purpose === "Other" ? (
        <PropertyTextField
          label="Please specify"
          value={data.purposeOther}
          onChange={(text) => onChangeField("purposeOther", text)}
          placeholder="Purpose of the loan"
          maxLength={PROPERTY_OTHER_MAX_LENGTH}
          error={errors.purposeOther}
        />
      ) : null}

      {question ? (
        <Dropdown
          label={question.label}
          required
          options={[...question.options]}
          value={data[question.field]}
          onSelect={(value) =>
            onChangeField(question.field, value as PropertyStageValue)
          }
          placeholder={question.placeholder}
          error={errors[question.field]}
        />
      ) : null}
    </View>
  );
};
