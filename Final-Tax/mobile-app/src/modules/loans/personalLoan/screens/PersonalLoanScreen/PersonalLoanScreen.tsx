import React, { useCallback, useMemo } from "react";
import { getContinueLabel } from "../../../constants/continueLabels";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "@/shared/components/KeyboardAwareFormLayout";
import { KeyboardStickyFooter } from "@/shared/components/KeyboardStickyFooter";
import { LoanFlowHeader } from "@/modules/loans/components/LoanFlowHeader";
import { PersonalEmploymentTypeSelector } from "../../components/PersonalEmploymentTypeSelector";
import {
  PersonalLoanAmountCard,
  PersonalSalariedSection,
  PersonalSelfEmployedSection,
} from "../../components/PersonalIncomeSections";
import { getLoanFlowTotalSteps } from "@/modules/loans/constants/loanFlow";
import { useLoansStore } from "@/modules/loans/store/loansStore";
import { isPersonalFormFilled } from "../../validation/personalLoanValidation";
import { styles } from "./PersonalLoanScreen.styles";

interface PersonalLoanScreenProps {
  onBackToKyc: () => void;
  onContinue: () => void;
  /** Opened from Review → Edit: no back button, "Update & Continue". */
  isEditMode?: boolean;
  /** Reached again with Back after being completed once: "Update & Continue", back stays. */
  isRevisit?: boolean;
}

export const PersonalLoanScreen: React.FC<PersonalLoanScreenProps> = ({
  onBackToKyc,
  onContinue,
  isEditMode = false,
  isRevisit = false,
}) => {
  const insets = useSafeAreaInsets();
  const personalFormData = useLoansStore((state) => state.personalFormData);
  const personalErrors = useLoansStore((state) => state.personalErrors);
  const setPersonalEmploymentType = useLoansStore(
    (state) => state.setPersonalEmploymentType
  );
  const setPersonalLoanField = useLoansStore(
    (state) => state.setPersonalLoanField
  );
  const validatePersonalForm = useLoansStore(
    (state) => state.validatePersonalForm
  );

  const isFormFilled = useMemo(
    () => isPersonalFormFilled(personalFormData),
    [personalFormData]
  );

  const handleContinuePress = useCallback(() => {
    if (validatePersonalForm()) onContinue();
  }, [validatePersonalForm, onContinue]);

  const continueLabel = getContinueLabel(isEditMode || isRevisit, "Continue →");
  const Section =
    personalFormData.employmentType === "salaried"
      ? PersonalSalariedSection
      : PersonalSelfEmployedSection;

  return (
    <View style={styles.container}>
      <LoanFlowHeader
        title="Tell us about your income"
        currentStep={2}
        totalSteps={getLoanFlowTotalSteps("personal-loan")}
        subtitle="Employment & Income"
        isEditMode={isEditMode}
        onBack={onBackToKyc}
      />

      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <PersonalLoanAmountCard
          value={
            personalFormData.loanAmount ||
            personalFormData.requestedAmount ||
            ""
          }
          error={personalErrors.loanAmount || personalErrors.requestedAmount}
          onChange={(digits) => setPersonalLoanField("loanAmount", digits)}
        />
        <PersonalEmploymentTypeSelector
          selectedType={personalFormData.employmentType}
          onSelectType={setPersonalEmploymentType}
        />
        <Section
          data={personalFormData}
          errors={personalErrors}
          onChangeField={setPersonalLoanField}
        />
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

export default PersonalLoanScreen;
