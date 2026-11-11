import React, { useCallback, useMemo } from "react";
import { getContinueLabel } from "../../../constants/continueLabels";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "@/shared/components/KeyboardAwareFormLayout";
import { KeyboardStickyFooter } from "@/shared/components/KeyboardStickyFooter";
import { Dropdown } from "@/shared/components/Dropdown";
import { LoanFlowHeader } from "@/modules/loans/components/LoanFlowHeader";
import { MoneyInputField } from "@/modules/loans/components/MoneyInputField";
import { getLoanFlowTotalSteps } from "@/modules/loans/constants/loanFlow";
import { useLoansStore } from "@/modules/loans/store/loansStore";
import {
  HOME_LOAN_PURPOSE_OPTIONS,
  HOME_LOAN_PROPERTY_STATUS_OPTIONS,
} from "../../types/homeLoan.types";
import { isHomeLoanRequirementFormFilled } from "../../validation/homeLoanValidation";
import { styles } from "./HomeLoanRequirementScreen.styles";

export interface HomeLoanRequirementScreenProps {
  onBackToKyc: () => void;
  onContinue: () => void;
  /** Opened from Review → Edit: no back button, "Update & Continue". */
  isEditMode?: boolean;
  /** Reached again with Back after being completed once: "Update & Continue", back stays. */
  isRevisit?: boolean;
}

export const HomeLoanRequirementScreen: React.FC<
  HomeLoanRequirementScreenProps
> = ({ onBackToKyc, onContinue, isEditMode = false, isRevisit = false }) => {
  const insets = useSafeAreaInsets();
  const homeLoanFormData = useLoansStore((state) => state.homeLoanFormData);
  const homeLoanErrors = useLoansStore((state) => state.homeLoanErrors);
  const setHomeLoanField = useLoansStore((state) => state.setHomeLoanField);
  const validateHomeLoanForm = useLoansStore(
    (state) => state.validateHomeLoanForm
  );

  const isFormFilled = useMemo(
    () => isHomeLoanRequirementFormFilled(homeLoanFormData),
    [homeLoanFormData]
  );

  const handleContinuePress = useCallback(() => {
    if (validateHomeLoanForm()) {
      onContinue();
    }
  }, [validateHomeLoanForm, onContinue]);

  const continueLabel = getContinueLabel(isEditMode || isRevisit, "Continue →");

  return (
    <View style={styles.container}>
      <LoanFlowHeader
        title="Tell us about your home loan"
        currentStep={2}
        totalSteps={getLoanFlowTotalSteps("home-loan")}
        subtitle="Home Loan Requirement"
        isEditMode={isEditMode}
        onBack={onBackToKyc}
      />

      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <MoneyInputField
            label="Requested Loan Amount"
            value={
              homeLoanFormData.loanAmount ||
              homeLoanFormData.requestedAmount ||
              ""
            }
            error={homeLoanErrors.loanAmount || homeLoanErrors.requestedAmount}
            onChange={(digits) => setHomeLoanField("loanAmount", digits)}
            placeholder="e.g. 25,00,000"
            required
          />

          <Dropdown
            label="What do you need the loan for?"
            value={homeLoanFormData.purpose}
            options={HOME_LOAN_PURPOSE_OPTIONS as unknown as string[]}
            placeholder="Select purpose"
            onSelect={(val) =>
              setHomeLoanField(
                "purpose",
                val as (typeof HOME_LOAN_PURPOSE_OPTIONS)[number]
              )
            }
            error={homeLoanErrors.purpose}
            required
          />

          <Dropdown
            label="Property Status"
            value={homeLoanFormData.propertyStatus}
            options={HOME_LOAN_PROPERTY_STATUS_OPTIONS as unknown as string[]}
            placeholder="Select property status"
            onSelect={(val) =>
              setHomeLoanField(
                "propertyStatus",
                val as (typeof HOME_LOAN_PROPERTY_STATUS_OPTIONS)[number]
              )
            }
            error={homeLoanErrors.propertyStatus}
            required
          />

          <MoneyInputField
            label="Approximate Property Value"
            value={
              homeLoanFormData.approximatePropertyValue ||
              homeLoanFormData.propertyValue ||
              ""
            }
            error={
              homeLoanErrors.approximatePropertyValue ||
              homeLoanErrors.propertyValue
            }
            onChange={(digits) =>
              setHomeLoanField("approximatePropertyValue", digits)
            }
            placeholder="e.g. 40,00,000"
            required
          />
        </View>
      </KeyboardAwareScrollView>

      <KeyboardStickyFooter>
        <View
          style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}
        >
          <TouchableOpacity
            style={[
              styles.continueButton,
              !isFormFilled && styles.continueButtonDisabled,
            ]}
            onPress={handleContinuePress}
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

export default HomeLoanRequirementScreen;
