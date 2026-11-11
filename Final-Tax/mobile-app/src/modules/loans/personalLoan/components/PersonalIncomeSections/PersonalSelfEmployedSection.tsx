import React from "react";
import { Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Dropdown } from "@/shared/components/Dropdown";
import { MoneyInputField } from "@/modules/loans/components/MoneyInputField";
import {
  NATURE_OF_BUSINESS_OPTIONS,
  YEARS_IN_BUSINESS_OPTIONS,
} from "../../types/personalLoan.types";
import { PersonalNameField } from "./PersonalNameField";
import type { PersonalIncomeSectionProps } from "./types";
import { styles } from "./PersonalIncomeSections.styles";

export const PersonalSelfEmployedSection: React.FC<PersonalIncomeSectionProps> = ({
  data,
  errors,
  onChangeField,
}) => (
  <View style={styles.card}>
    <View style={styles.headerRow}>
      <Ionicons name="storefront-outline" size={18} color="#083B75" />
      <Text style={styles.cardTitle}>Business / Profession Details</Text>
    </View>

    <PersonalNameField
      label="Business / Profession Name"
      value={data.businessOrProfessionName || data.professionName || ""}
      placeholder="e.g. Rohit Enterprises"
      error={errors.businessOrProfessionName || errors.professionName}
      onChange={(text) => onChangeField("businessOrProfessionName", text)}
    />

    <View style={styles.fieldWrapper}>
      <Dropdown
        label="Nature of Business / Profession"
        required
        options={[...NATURE_OF_BUSINESS_OPTIONS]}
        value={data.natureOfBusiness}
        onSelect={(val) => onChangeField("natureOfBusiness", val)}
        placeholder="Select nature of business"
        error={errors.natureOfBusiness}
      />
    </View>

    <MoneyInputField
      label="Average Monthly Income"
      required
      value={data.averageMonthlyIncome || data.monthlyIncome || ""}
      onChange={(digits) => onChangeField("averageMonthlyIncome", digits)}
      placeholder="e.g. 60,000"
      error={errors.averageMonthlyIncome || errors.monthlyIncome}
    />

    <View style={styles.fieldWrapper}>
      <Dropdown
        label="Years in Business"
        required
        options={[...YEARS_IN_BUSINESS_OPTIONS]}
        value={data.yearsInBusiness}
        onSelect={(val) => onChangeField("yearsInBusiness", val)}
        placeholder="Select years in business"
        error={errors.yearsInBusiness}
      />
    </View>
  </View>
);

export default PersonalSelfEmployedSection;
