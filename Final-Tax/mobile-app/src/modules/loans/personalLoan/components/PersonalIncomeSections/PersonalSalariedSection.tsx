import React from "react";
import { Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Dropdown } from "@/shared/components/Dropdown";
import { MoneyInputField } from "@/modules/loans/components/MoneyInputField";
import {
  JOB_TYPE_OPTIONS,
  SALARY_CREDIT_METHOD_OPTIONS,
  WORK_EXPERIENCE_OPTIONS,
  type SalaryCreditMethod,
} from "../../types/personalLoan.types";
import { PersonalNameField } from "./PersonalNameField";
import type { PersonalIncomeSectionProps } from "./types";
import { styles } from "./PersonalIncomeSections.styles";

export const PersonalSalariedSection: React.FC<PersonalIncomeSectionProps> = ({
  data,
  errors,
  onChangeField,
}) => (
  <View style={styles.card}>
    <View style={styles.headerRow}>
      <Ionicons name="briefcase-outline" size={18} color="#083B75" />
      <Text style={styles.cardTitle}>Employment Details</Text>
    </View>

    <PersonalNameField
      label="Company / Employer Name"
      value={data.employerName || data.companyName || ""}
      placeholder="e.g. Tata Consultancy Services"
      error={errors.employerName || errors.companyName}
      onChange={(text) => onChangeField("employerName", text)}
    />

    <View style={styles.fieldWrapper}>
      <Dropdown
        label="Job Type"
        required
        options={[...JOB_TYPE_OPTIONS]}
        value={data.jobType}
        onSelect={(val) => onChangeField("jobType", val)}
        placeholder="Select Job Type"
        error={errors.jobType}
      />
    </View>

    <MoneyInputField
      label="Monthly Net Salary"
      required
      value={data.monthlyNetSalary || data.monthlySalary || ""}
      onChange={(digits) => onChangeField("monthlyNetSalary", digits)}
      placeholder="e.g. 75,000"
      error={errors.monthlyNetSalary || errors.monthlySalary}
    />

    <View style={styles.fieldWrapper}>
      <Dropdown
        label="Work Experience"
        required
        options={[...WORK_EXPERIENCE_OPTIONS]}
        value={data.workExperience}
        onSelect={(val) => onChangeField("workExperience", val)}
        placeholder="Select Work Experience"
        error={errors.workExperience}
      />
    </View>

    <View style={styles.fieldWrapper}>
      <Dropdown
        label="How do you receive your salary?"
        required
        options={[...SALARY_CREDIT_METHOD_OPTIONS]}
        value={data.salaryCreditMethod}
        onSelect={(val) =>
          onChangeField("salaryCreditMethod", val as SalaryCreditMethod)
        }
        placeholder="Select salary credit method"
        error={errors.salaryCreditMethod}
      />
    </View>
  </View>
);

export default PersonalSalariedSection;
