import React, { useCallback } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Dropdown } from "@/shared/components/Dropdown";
import { KeyboardAwareScrollView } from "@/shared/components/KeyboardAwareFormLayout";
import { KeyboardStickyFooter } from "@/shared/components/KeyboardStickyFooter";
import { LoanFlowHeader } from "../../../components/LoanFlowHeader";
import { MoneyInputField } from "../../../components/MoneyInputField";
import { getContinueLabel } from "../../../constants/continueLabels";
import { getLoanFlowTotalSteps } from "../../../constants/loanFlow";
import { useLoansStore } from "../../../store/loansStore";
import {
  MACHINERY_CONDITION_OPTIONS,
  MACHINERY_PURCHASE_TYPE_OPTIONS,
  MACHINERY_TYPE_OPTIONS,
  type MachineryCondition,
  type MachineryPurchaseType,
  type MachineryType,
} from "../../types/machinery.types";
import {
  MACHINERY_DEALER_MAX_LENGTH,
  MACHINERY_NAME_MAX_LENGTH,
  MACHINERY_OTHER_SUPPLIER_MAX_LENGTH,
  MACHINERY_OTHER_TYPE_MAX_LENGTH,
} from "../../validation/machineryLoanValidation";
import { styles } from "./MachineryLoanScreen.styles";

export interface MachineryLoanScreenProps {
  onBackToKyc: () => void;
  onContinue: () => void;
  isEditMode?: boolean;
  isRevisit?: boolean;
}

type MachineryTextField =
  | "machineryTypeOther"
  | "machineryName"
  | "purchaseTypeOther"
  | "dealerName";

export const MachineryLoanScreen: React.FC<MachineryLoanScreenProps> = ({
  onBackToKyc,
  onContinue,
  isEditMode = false,
  isRevisit = false,
}) => {
  const insets = useSafeAreaInsets();
  const form = useLoansStore((state) => state.machineryFormData);
  const errors = useLoansStore((state) => state.machineryErrors);
  const setField = useLoansStore((state) => state.setMachineryLoanField);
  const validateForm = useLoansStore(
    (state) => state.validateMachineryLoanForm
  );

  const handleContinue = useCallback(() => {
    if (validateForm()) onContinue();
  }, [onContinue, validateForm]);

  const continueLabel = getContinueLabel(
    isEditMode || isRevisit,
    "Continue →"
  );

  const renderTextField = (
    field: MachineryTextField,
    label: string,
    placeholder: string,
    maxLength: number,
    required: boolean
  ) => (
    <View style={styles.field} key={field}>
      <Text style={styles.label}>
        {label} {required ? <Text style={styles.required}>*</Text> : null}
      </Text>
      <TextInput
        style={[styles.input, errors[field] ? styles.inputError : null]}
        value={form[field]}
        onChangeText={(value) => setField(field, value)}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        maxLength={maxLength}
        autoCapitalize="words"
        accessibilityLabel={label}
      />
      {errors[field] ? (
        <Text style={styles.errorText}>{errors[field]}</Text>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <LoanFlowHeader
        title="Machinery Loan"
        currentStep={2}
        totalSteps={getLoanFlowTotalSteps("machinery-loan")}
        subtitle="Machinery & Loan Details"
        isEditMode={isEditMode}
        onBack={onBackToKyc}
      />

      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Loan Requirement</Text>
          <MoneyInputField
            label="Requested Loan Amount"
            required
            value={form.requestedLoanAmount}
            onChange={(value) => setField("requestedLoanAmount", value)}
            placeholder="Enter requested loan amount"
            error={errors.requestedLoanAmount}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Machinery Details</Text>
          <Dropdown
            label="Machinery Type"
            required
            options={[...MACHINERY_TYPE_OPTIONS]}
            value={form.machineryType}
            onSelect={(value) =>
              setField("machineryType", value as MachineryType)
            }
            placeholder="Select machinery type"
            error={errors.machineryType}
          />
          {form.machineryType === "Other"
            ? renderTextField(
                "machineryTypeOther",
                "Please specify machinery type",
                "Enter machinery type",
                MACHINERY_OTHER_TYPE_MAX_LENGTH,
                true
              )
            : null}
          {renderTextField(
            "machineryName",
            "Machinery Name / Description",
            "e.g. CNC Turning Machine",
            MACHINERY_NAME_MAX_LENGTH,
            true
          )}
          <Dropdown
            label="Machinery Condition"
            required
            options={[...MACHINERY_CONDITION_OPTIONS]}
            value={form.machineryCondition}
            onSelect={(value) =>
              setField("machineryCondition", value as MachineryCondition)
            }
            placeholder="Select condition"
            error={errors.machineryCondition}
          />
          <Dropdown
            label="Machinery Purchase Type"
            required
            options={[...MACHINERY_PURCHASE_TYPE_OPTIONS]}
            value={form.purchaseType}
            onSelect={(value) =>
              setField("purchaseType", value as MachineryPurchaseType)
            }
            placeholder="Select purchase type"
            error={errors.purchaseType}
          />
          {form.purchaseType === "Other Supplier"
            ? renderTextField(
                "purchaseTypeOther",
                "Please specify supplier type",
                "Enter supplier type",
                MACHINERY_OTHER_SUPPLIER_MAX_LENGTH,
                true
              )
            : null}
          <MoneyInputField
            label="Approximate Machinery Cost"
            required
            value={form.approximateMachineryCost}
            onChange={(value) => setField("approximateMachineryCost", value)}
            placeholder="Enter approximate machinery cost"
            error={errors.approximateMachineryCost}
          />
          {renderTextField(
            "dealerName",
            "Dealer / Supplier Name",
            "Enter dealer or supplier name",
            MACHINERY_DEALER_MAX_LENGTH,
            false
          )}
        </View>
      </KeyboardAwareScrollView>

      <KeyboardStickyFooter>
        <View
          style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}
        >
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={continueLabel}
          >
            <Text style={styles.continueButtonText}>{continueLabel}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardStickyFooter>
    </View>
  );
};

export default MachineryLoanScreen;
