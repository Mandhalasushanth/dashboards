import React, { useCallback } from "react";
import { getContinueLabel } from "../../../constants/continueLabels";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "@/shared/components/KeyboardAwareFormLayout";
import { KeyboardStickyFooter } from "@/shared/components/KeyboardStickyFooter";
import { LoanFlowHeader } from "../../../components/LoanFlowHeader";
import { getLoanFlowTotalSteps } from "../../../constants/loanFlow";
import { useLoansStore } from "../../../store/loansStore";
import {
  PropertyDetailsSection,
  PropertyRequirementSection,
} from "../../components";
import { styles } from "./PropertyLoanScreen.styles";

interface PropertyLoanScreenProps {
  onBackToKyc: () => void;
  onContinue: () => void;
  /** Opened from Review → Edit: no back button, "Update & Continue". */
  isEditMode?: boolean;
  /** Reached again with Back after being completed once: "Update & Continue", back stays. */
  isRevisit?: boolean;
}

/** Screen 2 of the Property / Home Loan: requirement and property details. */
export const PropertyLoanScreen: React.FC<PropertyLoanScreenProps> = ({
  onBackToKyc,
  onContinue,
  isEditMode = false,
  isRevisit = false,
}) => {
  const insets = useSafeAreaInsets();
  const propertyFormData = useLoansStore((state) => state.propertyFormData);
  const propertyErrors = useLoansStore((state) => state.propertyErrors);
  const setPropertyField = useLoansStore((state) => state.setPropertyField);
  const validatePropertyForm = useLoansStore(
    (state) => state.validatePropertyForm
  );

  const handleContinue = useCallback(() => {
    if (validatePropertyForm()) onContinue();
  }, [validatePropertyForm, onContinue]);

  const continueLabel = getContinueLabel(isEditMode || isRevisit, "Continue →");

  return (
    <View style={styles.container}>
      <LoanFlowHeader
        title="Tell us about your property"
        currentStep={2}
        totalSteps={getLoanFlowTotalSteps("property-loan")}
        subtitle="Property & Loan Details"
        isEditMode={isEditMode}
        onBack={onBackToKyc}
      />

      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <PropertyRequirementSection
          data={propertyFormData}
          errors={propertyErrors}
          onChangeField={setPropertyField}
        />
        <PropertyDetailsSection
          data={propertyFormData}
          errors={propertyErrors}
          onChangeField={setPropertyField}
        />
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

export default PropertyLoanScreen;
