import React, { useCallback, useMemo } from "react";
import { getContinueLabel } from "../../../constants/continueLabels";
import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { KeyboardAwareScrollView } from "@/shared/components/KeyboardAwareFormLayout";
import { KeyboardStickyFooter } from "@/shared/components/KeyboardStickyFooter";
import { LoanFlowHeader } from "@/modules/loans/components/LoanFlowHeader";
import { useLoansStore } from "@/modules/loans/store/loansStore";
import { LoanTypeSelector } from "../../components/LoanTypeSelector";
import { CommonBusinessProfileSection } from "../../components/CommonBusinessProfileSection";
import { DynamicBusinessLoanSection } from "../../components/DynamicBusinessLoanSection";
import { DynamicWorkingCapitalSection } from "../../components/DynamicWorkingCapitalSection";
import { isProjectCostRequired } from "../../validation/businessLoanValidation";
import { styles } from "./BusinessLoanScreen.styles";

interface BusinessLoanScreenProps {
  onBackToKyc: () => void;
  onContinue: () => void;
  /** Opened from Review → Edit: no back button, "Update & Continue". */
  isEditMode?: boolean;
  /** Reached again with Back after being completed once: "Update & Continue", back stays. */
  isRevisit?: boolean;
}

export const BusinessLoanScreen: React.FC<BusinessLoanScreenProps> = ({
  onBackToKyc,
  onContinue,
  isEditMode = false,
  isRevisit = false,
}) => {
  const continueLabel = getContinueLabel(
    isEditMode || isRevisit,
    "Continue to Documents"
  );
  const insets = useSafeAreaInsets();

  const selectedCategory = useLoansStore((state) => state.selectedCategory);
  const businessFormData = useLoansStore((state) => state.businessFormData);
  const businessErrors = useLoansStore((state) => state.businessErrors);

  const setLoanType = useLoansStore((state) => state.setLoanType);
  const setBusinessProfileField = useLoansStore(
    (state) => state.setBusinessProfileField
  );
  const setBusinessLoanField = useLoansStore(
    (state) => state.setBusinessLoanField
  );
  const setWorkingCapitalField = useLoansStore(
    (state) => state.setWorkingCapitalField
  );
  const validateBusinessForm = useLoansStore(
    (state) => state.validateBusinessForm
  );

  const isFormFilled = useMemo(() => {
    const { businessProfile, loanType, businessLoan, workingCapital } =
      businessFormData;

    // Common Profile Checks
    const hasName = Boolean(businessProfile.businessName?.trim());
    const hasConstitution =
      businessProfile.constitution === "Other"
        ? Boolean(businessProfile.constitutionOther?.trim())
        : Boolean(businessProfile.constitution);
    const hasActivity =
      businessProfile.businessActivity === "Other"
        ? Boolean(businessProfile.activityOther?.trim())
        : Boolean(businessProfile.businessActivity);
    const hasEstDate = Boolean(businessProfile.establishmentDate?.trim());
    const hasAddress = Boolean(businessProfile.businessAddress?.trim());
    const hasPincode = Boolean(businessProfile.pincode?.trim());
    const hasGst = businessProfile.isGstRegistered
      ? Boolean(businessProfile.gstin?.trim())
      : true;

    const commonValid =
      hasName &&
      hasConstitution &&
      hasActivity &&
      hasEstDate &&
      hasAddress &&
      hasPincode &&
      hasGst;

    if (!commonValid) return false;

    // Loan Type Specific Checks
    if (loanType === "business-loan") {
      const hasAmount = Boolean(businessLoan.loanAmount?.trim());
      const hasPurpose =
        businessLoan.purpose === "Other"
          ? Boolean(businessLoan.purposeOther?.trim())
          : Boolean(businessLoan.purpose);
      const hasDesc = Boolean(businessLoan.purposeDescription?.trim());
      const hasProjectCost = isProjectCostRequired(businessLoan.purpose)
        ? Boolean(businessLoan.projectCost?.trim())
        : true;

      return hasAmount && hasPurpose && hasDesc && hasProjectCost;
    }

    if (loanType === "working-capital") {
      const hasAmount = Boolean(workingCapital.loanAmount?.trim());
      const hasPurpose =
        workingCapital.purpose === "Other"
          ? Boolean(workingCapital.purposeOther?.trim())
          : Boolean(workingCapital.purpose);
      const hasDesc = Boolean(workingCapital.purposeDescription?.trim());
      const hasSales = Boolean(workingCapital.monthlySales?.trim());
      const hasExpenses = Boolean(workingCapital.monthlyExpenses?.trim());

      return hasAmount && hasPurpose && hasDesc && hasSales && hasExpenses;
    }

    return false;
  }, [businessFormData]);

  const handleContinuePress = useCallback(() => {
    const isValid = validateBusinessForm();
    if (isValid) {
      onContinue();
    }
  }, [validateBusinessForm, onContinue]);

  return (
    <View style={styles.container}>
      <LoanFlowHeader
        title={selectedCategory?.title ?? "Business Loan"}
        currentStep={2}
        totalSteps={5}
        subtitle="Business Details"
        isEditMode={isEditMode}
        onBack={onBackToKyc}
      />

      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <LoanTypeSelector
          selectedType={businessFormData.loanType}
          onSelectType={setLoanType}
        />

        <CommonBusinessProfileSection
          data={businessFormData.businessProfile}
          errors={businessErrors}
          onChangeField={setBusinessProfileField}
        />

        {businessFormData.loanType === "business-loan" ? (
          <DynamicBusinessLoanSection
            data={businessFormData.businessLoan}
            errors={businessErrors}
            onChangeField={setBusinessLoanField}
          />
        ) : (
          <DynamicWorkingCapitalSection
            data={businessFormData.workingCapital}
            errors={businessErrors}
            onChangeField={setWorkingCapitalField}
          />
        )}
      </KeyboardAwareScrollView>

      <KeyboardStickyFooter
        style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) + 4 }]}
      >
        <TouchableOpacity
          style={[
            styles.continueButton,
            !isFormFilled && styles.continueButtonDisabled,
          ]}
          disabled={!isFormFilled}
          activeOpacity={0.8}
          onPress={handleContinuePress}
          accessibilityRole="button"
          accessibilityLabel={continueLabel}
        >
          <Text style={styles.continueButtonText}>
            {continueLabel}
          </Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </KeyboardStickyFooter>
    </View>
  );
};

export default BusinessLoanScreen;
