import React from "react";
import { normalizeMoneyInput } from "@/modules/loans/utils/moneyInput";
import { View, Text, TextInput } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Dropdown } from "@/shared/components/Dropdown";
import {
  groupIndianDigits,
  formatCurrencyINR,
} from "@/shared/formatters/currencyFormatter";
import {
  BUSINESS_TEXT_LIMITS,
  isProjectCostRequired,
} from "../../validation/businessLoanValidation";
import {
  BUSINESS_LOAN_PURPOSE_OPTIONS,
} from "../../types/businessLoan.types";
import type {
  BusinessLoanDetails,
  BusinessLoanErrors,
  BusinessLoanPurpose,
} from "../../types/businessLoan.types";
import { styles } from "./DynamicBusinessLoanSection.styles";

interface DynamicBusinessLoanSectionProps {
  data: BusinessLoanDetails;
  errors: BusinessLoanErrors;
  onChangeField: <K extends keyof BusinessLoanDetails>(
    field: K,
    value: BusinessLoanDetails[K]
  ) => void;
}

export const DynamicBusinessLoanSection: React.FC<
  DynamicBusinessLoanSectionProps
> = ({ data, errors, onChangeField }) => {
  const handleAmountChange = (text: string) => {
    const raw = normalizeMoneyInput(text);
    onChangeField("loanAmount", raw);
  };

  const handleProjectCostChange = (text: string) => {
    const raw = normalizeMoneyInput(text);
    onChangeField("projectCost", raw);
  };

  const showProjectCost = isProjectCostRequired(data.purpose);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconBox}>
          <Ionicons name="trending-up-outline" size={18} color="#083B75" />
        </View>
        <Text style={styles.title}>Business Term Loan Requirements</Text>
      </View>
      <Text style={styles.subtitle}>
        Specify capital outlay and intended business asset deployment
      </Text>

      {/* Loan Amount */}
      <View style={styles.fieldWrapper}>
        <Text style={styles.fieldLabel}>
          Loan Amount Required <Text style={styles.requiredStar}>*</Text>
        </Text>
        <View
          style={[
            styles.inputRow,
            errors.businessLoanAmount && styles.inputRowError,
          ]}
        >
          <Text style={styles.currencyPrefix}>₹</Text>
          <TextInput
            style={styles.currencyInput}
            value={
              data.loanAmount
                ? /^\d+$/.test(data.loanAmount)
                  ? groupIndianDigits(data.loanAmount)
                  : data.loanAmount
                : ""
            }
            onChangeText={handleAmountChange}
            placeholder="e.g. 10,00,000"
            placeholderTextColor="#94A3B8"
            keyboardType="number-pad"
            maxLength={11}
          />
        </View>
        {errors.businessLoanAmount ? (
          <Text style={styles.errorText}>{errors.businessLoanAmount}</Text>
        ) : (
          <Text style={styles.helperText}>
            {data.loanAmount ? `Sanction target: ${formatCurrencyINR(data.loanAmount)}` : "Minimum ₹25,000"}
          </Text>
        )}
      </View>

      {/* Purpose Dropdown */}
      <View style={styles.fieldWrapper}>
        <Dropdown
          label="Purpose of Loan"
          required
          options={[...BUSINESS_LOAN_PURPOSE_OPTIONS]}
          value={data.purpose}
          onSelect={(val) => onChangeField("purpose", val as BusinessLoanPurpose)}
          placeholder="Select strategic loan objective"
          error={errors.businessLoanPurpose}
        />
      </View>

      {/* Conditional Other Purpose */}
      {data.purpose === "Other" && (
        <View style={styles.fieldWrapper}>
          <Text style={styles.fieldLabel}>
            Specify Loan Purpose <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.standardInput,
              errors.businessLoanPurposeOther && styles.standardInputError,
            ]}
            value={data.purposeOther}
            onChangeText={(val) => onChangeField("purposeOther", val)}
            maxLength={BUSINESS_TEXT_LIMITS.other}
            placeholder="e.g. Tech upgrade, Branch acquisition"
            placeholderTextColor="#94A3B8"
          />
          {errors.businessLoanPurposeOther ? (
            <Text style={styles.errorText}>
              {errors.businessLoanPurposeOther}
            </Text>
          ) : null}
        </View>
      )}

      {/* Project / Equipment Cost (Conditional on purpose) */}
      {showProjectCost && (
        <View style={styles.fieldWrapper}>
          <Text style={styles.fieldLabel}>
            Estimated Project / Equipment Cost <Text style={styles.requiredStar}>*</Text>
          </Text>
          <View
            style={[
              styles.inputRow,
              errors.businessLoanProjectCost && styles.inputRowError,
            ]}
          >
            <Text style={styles.currencyPrefix}>₹</Text>
            <TextInput
              style={styles.currencyInput}
              value={
                data.projectCost
                  ? /^\d+$/.test(data.projectCost)
                    ? groupIndianDigits(data.projectCost)
                    : data.projectCost
                  : ""
              }
              onChangeText={handleProjectCostChange}
              placeholder="e.g. 15,00,000"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              maxLength={11}
            />
          </View>
          {errors.businessLoanProjectCost ? (
            <Text style={styles.errorText}>
              {errors.businessLoanProjectCost}
            </Text>
          ) : (
            <Text style={styles.helperText}>
              {data.projectCost
                ? `Total quotation cost: ${formatCurrencyINR(data.projectCost)}`
                : "Required for asset acquisition/renovation valuation"}
            </Text>
          )}
        </View>
      )}

      {/* Brief Purpose Description */}
      <View style={styles.fieldWrapper}>
        <Text style={styles.fieldLabel}>
          Brief Purpose Description <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          style={[
            styles.standardInput,
            styles.textArea,
            errors.businessLoanDescription && styles.standardInputError,
          ]}
          value={data.purposeDescription}
          onChangeText={(val) => onChangeField("purposeDescription", val)}
          maxLength={BUSINESS_TEXT_LIMITS.description}
          placeholder="Describe how the financing will be utilized to generate business returns"
          placeholderTextColor="#94A3B8"
          multiline
          numberOfLines={2}
        />
        {errors.businessLoanDescription ? (
          <Text style={styles.errorText}>
            {errors.businessLoanDescription}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

export default DynamicBusinessLoanSection;
