import React from "react";
import { BUSINESS_TEXT_LIMITS } from "../../validation/businessLoanValidation";
import { normalizeMoneyInput } from "@/modules/loans/utils/moneyInput";
import { View, Text, TextInput } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Dropdown } from "@/shared/components/Dropdown";
import {
  groupIndianDigits,
  formatCurrencyINR,
} from "@/shared/formatters/currencyFormatter";
import { WORKING_CAPITAL_PURPOSE_OPTIONS } from "../../types/businessLoan.types";
import type {
  WorkingCapitalDetails,
  BusinessLoanErrors,
  WorkingCapitalPurpose,
} from "../../types/businessLoan.types";
import { styles } from "./DynamicWorkingCapitalSection.styles";

interface DynamicWorkingCapitalSectionProps {
  data: WorkingCapitalDetails;
  errors: BusinessLoanErrors;
  onChangeField: <K extends keyof WorkingCapitalDetails>(
    field: K,
    value: WorkingCapitalDetails[K]
  ) => void;
}

export const DynamicWorkingCapitalSection: React.FC<
  DynamicWorkingCapitalSectionProps
> = ({ data, errors, onChangeField }) => {
  const handleAmountChange = (text: string) => {
    const raw = normalizeMoneyInput(text);
    onChangeField("loanAmount", raw);
  };

  const handleSalesChange = (text: string) => {
    const raw = normalizeMoneyInput(text);
    onChangeField("monthlySales", raw);
  };

  const handleExpensesChange = (text: string) => {
    const raw = normalizeMoneyInput(text);
    onChangeField("monthlyExpenses", raw);
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconBox}>
          <Ionicons name="repeat-outline" size={18} color="#083B75" />
        </View>
        <Text style={styles.title}>Working Capital Facility Details</Text>
      </View>
      <Text style={styles.subtitle}>
        Operating cash flow requirements and monthly financial metrics
      </Text>

      {/* Facility Amount */}
      <View style={styles.fieldWrapper}>
        <Text style={styles.fieldLabel}>
          Working Capital Limit Required <Text style={styles.requiredStar}>*</Text>
        </Text>
        <View
          style={[
            styles.inputRow,
            errors.workingCapitalAmount && styles.inputRowError,
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
            placeholder="e.g. 5,00,000"
            placeholderTextColor="#94A3B8"
            keyboardType="number-pad"
            maxLength={11}
          />
        </View>
        {errors.workingCapitalAmount ? (
          <Text style={styles.errorText}>{errors.workingCapitalAmount}</Text>
        ) : (
          <Text style={styles.helperText}>
            {data.loanAmount
              ? `Revolving limit: ${formatCurrencyINR(data.loanAmount)}`
              : "Overdraft / Cash credit limit required"}
          </Text>
        )}
      </View>

      {/* Purpose of Funds */}
      <View style={styles.fieldWrapper}>
        <Dropdown
          label="Purpose of Funds"
          required
          options={[...WORKING_CAPITAL_PURPOSE_OPTIONS]}
          value={data.purpose}
          onSelect={(val) => onChangeField("purpose", val as WorkingCapitalPurpose)}
          placeholder="Select working capital requirement"
          error={errors.workingCapitalPurpose}
        />
      </View>

      {/* Conditional Other Purpose */}
      {data.purpose === "Other" && (
        <View style={styles.fieldWrapper}>
          <Text style={styles.fieldLabel}>
            Specify Purpose of Funds <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.standardInput,
              errors.workingCapitalPurposeOther && styles.standardInputError,
            ]}
            value={data.purposeOther}
            onChangeText={(val) => onChangeField("purposeOther", val)}
            maxLength={BUSINESS_TEXT_LIMITS.other}
            placeholder="e.g. Bulk discount procurement"
            placeholderTextColor="#94A3B8"
          />
          {errors.workingCapitalPurposeOther ? (
            <Text style={styles.errorText}>
              {errors.workingCapitalPurposeOther}
            </Text>
          ) : null}
        </View>
      )}

      {/* Brief Purpose Description */}
      <View style={styles.fieldWrapper}>
        <Text style={styles.fieldLabel}>
          Brief Description of Cash-Flow Need <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          style={[
            styles.standardInput,
            styles.textArea,
            errors.workingCapitalDescription && styles.standardInputError,
          ]}
          value={data.purposeDescription}
          onChangeText={(val) => onChangeField("purposeDescription", val)}
          maxLength={BUSINESS_TEXT_LIMITS.description}
          placeholder="Briefly state operating cash-conversion cycles or immediate payable obligations"
          placeholderTextColor="#94A3B8"
          multiline
          numberOfLines={2}
        />
        {errors.workingCapitalDescription ? (
          <Text style={styles.errorText}>
            {errors.workingCapitalDescription}
          </Text>
        ) : null}
      </View>

      {/* Monthly Sales & Monthly Expenses */}
      <View style={styles.twoColRow}>
        <View style={[styles.col, styles.fieldWrapper]}>
          <Text style={styles.fieldLabel}>
            Avg Monthly Sales <Text style={styles.requiredStar}>*</Text>
          </Text>
          <View
            style={[
              styles.inputRow,
              errors.monthlySales && styles.inputRowError,
            ]}
          >
            <Text style={styles.currencyPrefix}>₹</Text>
            <TextInput
              style={styles.currencyInput}
              value={
                data.monthlySales
                  ? /^\d+$/.test(data.monthlySales)
                    ? groupIndianDigits(data.monthlySales)
                    : data.monthlySales
                  : ""
              }
              onChangeText={handleSalesChange}
              placeholder="e.g. 8,00,000"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              maxLength={11}
            />
          </View>
          {errors.monthlySales ? (
            <Text style={styles.errorText}>{errors.monthlySales}</Text>
          ) : (
            <Text style={styles.helperText}>Gross revenue</Text>
          )}
        </View>

        <View style={[styles.col, styles.fieldWrapper]}>
          <Text style={styles.fieldLabel}>
            Avg Monthly Expenses <Text style={styles.requiredStar}>*</Text>
          </Text>
          <View
            style={[
              styles.inputRow,
              errors.monthlyExpenses && styles.inputRowError,
            ]}
          >
            <Text style={styles.currencyPrefix}>₹</Text>
            <TextInput
              style={styles.currencyInput}
              value={
                data.monthlyExpenses
                  ? /^\d+$/.test(data.monthlyExpenses)
                    ? groupIndianDigits(data.monthlyExpenses)
                    : data.monthlyExpenses
                  : ""
              }
              onChangeText={handleExpensesChange}
              placeholder="e.g. 5,50,000"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              maxLength={11}
            />
          </View>
          {errors.monthlyExpenses ? (
            <Text style={styles.errorText}>{errors.monthlyExpenses}</Text>
          ) : (
            <Text style={styles.helperText}>Rent, stock, payroll</Text>
          )}
        </View>
      </View>
    </View>
  );
};

export default DynamicWorkingCapitalSection;
