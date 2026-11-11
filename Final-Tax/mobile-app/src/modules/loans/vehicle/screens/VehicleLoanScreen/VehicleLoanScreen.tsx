import React, { useCallback } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { INDIAN_STATES_AND_UTS } from "@/components/screens/create-profile/types";
import { Dropdown } from "@/shared/components/Dropdown";
import { KeyboardAwareScrollView } from "@/shared/components/KeyboardAwareFormLayout";
import { KeyboardStickyFooter } from "@/shared/components/KeyboardStickyFooter";
import { LoanFlowHeader } from "../../../components/LoanFlowHeader";
import { MoneyInputField } from "../../../components/MoneyInputField";
import { getContinueLabel } from "../../../constants/continueLabels";
import { getLoanFlowTotalSteps } from "../../../constants/loanFlow";
import { useLoansStore } from "../../../store/loansStore";
import {
  VEHICLE_CATEGORY_OPTIONS,
  VEHICLE_CONDITION_OPTIONS,
  VEHICLE_DEALER_OPTIONS,
  VEHICLE_PURCHASE_TIMELINE_OPTIONS,
  type VehicleCategory,
  type VehicleCondition,
  type VehicleDealerSelection,
  type VehiclePurchaseTimeline,
} from "../../types/vehicleLoan.types";
import {
  VEHICLE_DEALER_MAX_LENGTH,
  VEHICLE_MAKE_MAX_LENGTH,
  VEHICLE_MODEL_MAX_LENGTH,
  VEHICLE_OTHER_MAX_LENGTH,
} from "../../validation/vehicleLoanValidation";
import { styles } from "./VehicleLoanScreen.styles";

interface VehicleLoanScreenProps {
  onBackToKyc: () => void;
  onContinue: () => void;
  isEditMode?: boolean;
  isRevisit?: boolean;
}

type VehicleTextField =
  | "vehicleCategoryOther"
  | "make"
  | "model"
  | "dealerName";

export const VehicleLoanScreen: React.FC<VehicleLoanScreenProps> = ({
  onBackToKyc,
  onContinue,
  isEditMode = false,
  isRevisit = false,
}) => {
  const insets = useSafeAreaInsets();
  const form = useLoansStore((state) => state.vehicleFormData);
  const errors = useLoansStore((state) => state.vehicleErrors);
  const setField = useLoansStore((state) => state.setVehicleLoanField);
  const validateForm = useLoansStore((state) => state.validateVehicleLoanForm);

  const handleContinue = useCallback(() => {
    if (validateForm()) onContinue();
  }, [onContinue, validateForm]);

  const continueLabel = getContinueLabel(
    isEditMode || isRevisit,
    "Continue →"
  );

  const renderTextField = (
    field: VehicleTextField,
    label: string,
    placeholder: string,
    maxLength: number
  ) => (
    <View style={styles.field} key={field}>
      <Text style={styles.label}>
        {label} <Text style={styles.required}>*</Text>
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
      {errors[field] ? <Text style={styles.errorText}>{errors[field]}</Text> : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <LoanFlowHeader
        title="Tell us about your vehicle"
        currentStep={2}
        totalSteps={getLoanFlowTotalSteps("vehicle-loan")}
        subtitle="Vehicle & Loan Details"
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
            placeholder="e.g. 5,00,000"
            error={errors.requestedLoanAmount}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Vehicle Details</Text>
          <Dropdown
            label="Vehicle Condition"
            required
            options={[...VEHICLE_CONDITION_OPTIONS]}
            value={form.vehicleCondition}
            onSelect={(value) =>
              setField("vehicleCondition", value as VehicleCondition)
            }
            placeholder="Select condition"
            error={errors.vehicleCondition}
          />
          <Dropdown
            label="Vehicle Category"
            required
            options={[...VEHICLE_CATEGORY_OPTIONS]}
            value={form.vehicleCategory}
            onSelect={(value) =>
              setField("vehicleCategory", value as VehicleCategory)
            }
            placeholder="Select category"
            error={errors.vehicleCategory}
          />
          {form.vehicleCategory === "Other"
            ? renderTextField(
                "vehicleCategoryOther",
                "Please specify",
                "Vehicle category",
                VEHICLE_OTHER_MAX_LENGTH
              )
            : null}
          {renderTextField("make", "Vehicle Make / Brand", "e.g. Maruti Suzuki", VEHICLE_MAKE_MAX_LENGTH)}
          {renderTextField("model", "Vehicle Model", "e.g. Swift", VEHICLE_MODEL_MAX_LENGTH)}
          <MoneyInputField
            label="Approximate Vehicle Price"
            required
            value={form.approximateVehiclePrice}
            onChange={(value) => setField("approximateVehiclePrice", value)}
            placeholder="e.g. 8,00,000"
            error={errors.approximateVehiclePrice}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Purchase Details</Text>
          <Dropdown
            label="Dealer Selected?"
            required
            options={[...VEHICLE_DEALER_OPTIONS]}
            value={form.dealerSelected}
            onSelect={(value) =>
              setField("dealerSelected", value as VehicleDealerSelection)
            }
            placeholder="Select an option"
            error={errors.dealerSelected}
          />
          {form.dealerSelected === "Yes"
            ? renderTextField(
                "dealerName",
                "Dealer Name",
                "Enter dealer name",
                VEHICLE_DEALER_MAX_LENGTH
              )
            : null}
          <Dropdown
            label="Purchase Timeline"
            required
            options={[...VEHICLE_PURCHASE_TIMELINE_OPTIONS]}
            value={form.purchaseTimeline}
            onSelect={(value) =>
              setField("purchaseTimeline", value as VehiclePurchaseTimeline)
            }
            placeholder="Select timeline"
            error={errors.purchaseTimeline}
          />
          <Dropdown
            label="Registration State"
            required
            options={[...INDIAN_STATES_AND_UTS]}
            value={form.registrationState}
            onSelect={(value) => setField("registrationState", value)}
            placeholder="Select State / UT"
            error={errors.registrationState}
          />
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

export default VehicleLoanScreen;
