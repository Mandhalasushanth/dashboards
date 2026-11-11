import React, { useCallback, useEffect, useMemo, useState } from "react";
import { resolveLoanDocumentRequirements } from "../../constants/loanDocumentResolver";
import {
  ActivityIndicator,
  Animated,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { KeyboardAwareScrollView } from "@/shared/components/KeyboardAwareFormLayout";
import { KeyboardStickyFooter } from "@/shared/components/KeyboardStickyFooter";
import { useLoansStore } from "../../store/loansStore";
import { LoanFlowHeader } from "../../components/LoanFlowHeader";
import { ApplicationSummarySection } from "../../components/ApplicationSummarySection";
import { ReviewDocumentsSummary } from "../../components/ReviewDocumentsSummary";
import { ReviewConsentCard } from "../../components/ReviewConsentCard";
import { getLoanFlowTotalSteps } from "../../constants/loanFlow";
import { getLoanDocumentChecklist } from "../../validation/loanDocumentsValidation";
import { styles } from "./LoanReviewScreen.styles";

interface LoanReviewScreenProps {
  /** Back arrow: returns to the Documents screen. */
  onBack: () => void;
  onEditKyc: () => void;
  onEditBusiness: () => void;
  onEditDocuments: () => void;
  onSubmitSuccess: () => void;
}

/**
 * Screen 4: a read-only summary of the application with an Edit action per section.
 * Documents are shown as a status list only; uploading happens on the Documents screen.
 */
export const LoanReviewScreen: React.FC<LoanReviewScreenProps> = ({
  onBack,
  onEditKyc,
  onEditBusiness,
  onEditDocuments,
  onSubmitSuccess,
}) => {
  const insets = useSafeAreaInsets();

  const selectedCategory = useLoansStore((state) => state.selectedCategory);
  const kycData = useLoansStore((state) => state.kycData);
  const businessFormData = useLoansStore((state) => state.businessFormData);
  const personalFormData = useLoansStore((state) => state.personalFormData);
  const homeLoanFormData = useLoansStore((state) => state.homeLoanFormData);
  const uploadedDocuments = useLoansStore((state) => state.uploadedDocuments);
  const isReviewConsentGiven = useLoansStore((state) => state.isReviewConsentGiven);
  const reviewErrors = useLoansStore((state) => state.reviewErrors);
  const isSubmitting = useLoansStore((state) => state.isSubmitting);
  const setReviewConsent = useLoansStore((state) => state.setReviewConsent);
  const submitLoanApplication = useLoansStore((state) => state.submitLoanApplication);

  const propertyFormData = useLoansStore((state) => state.propertyFormData);
  const vehicleFormData = useLoansStore((state) => state.vehicleFormData);
  const machineryFormData = useLoansStore((state) => state.machineryFormData);
  const msmeFormData = useLoansStore((state) => state.msmeFormData);
  const requirements = useMemo(
    () =>
      resolveLoanDocumentRequirements({
        categoryId: selectedCategory?.id,
        businessFormData,
        personalFormData,
        homeLoanFormData,
        propertyFormData,
        vehicleFormData,
        machineryFormData,
        msmeFormData,
      }),
    [
      selectedCategory?.id,
      businessFormData,
      personalFormData,
      homeLoanFormData,
      propertyFormData,
      vehicleFormData,
      machineryFormData,
      msmeFormData,
    ]
  );
  const checklist = useMemo(
    () => getLoanDocumentChecklist(requirements, uploadedDocuments),
    [requirements, uploadedDocuments]
  );

  const documentsError = useMemo(() => {
    const missing = Object.values(reviewErrors.documents ?? {});
    if (missing.length === 0) return undefined;
    return missing.length === 1
      ? missing[0]
      : `${missing.length} required documents are still missing.`;
  }, [reviewErrors.documents]);

  const [fade] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [fade]);

  const handleSubmit = useCallback(async () => {
    const isSubmitted = await submitLoanApplication();
    if (isSubmitted) onSubmitSuccess();
  }, [submitLoanApplication, onSubmitSuccess]);

  return (
    <View style={styles.container}>
      <LoanFlowHeader
        title="Review Your Application"
        currentStep={4}
        totalSteps={
          selectedCategory ? getLoanFlowTotalSteps(selectedCategory.id) : 5
        }
        subtitle="Review & Submit"
        onBack={onBack}
      />

      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={{ opacity: fade }}>
          {reviewErrors.general &&
          !reviewErrors.applicant &&
          !reviewErrors.business &&
          !reviewErrors.vehicle &&
          !reviewErrors.machinery &&
          !reviewErrors.msme &&
          !reviewErrors.loan ? (
            <View style={styles.generalErrorBox}>
              <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
              <Text style={styles.generalErrorText}>{reviewErrors.general}</Text>
            </View>
          ) : null}

          <ApplicationSummarySection
            kycData={kycData}
            businessFormData={businessFormData}
            personalFormData={personalFormData}
            homeLoanFormData={homeLoanFormData}
            propertyFormData={propertyFormData}
            vehicleFormData={vehicleFormData}
            machineryFormData={machineryFormData}
            msmeFormData={msmeFormData}
            categoryId={selectedCategory?.id}
            onEditKyc={onEditKyc}
            onEditBusiness={onEditBusiness}
            sectionErrors={{
              applicant: reviewErrors.applicant,
              business: reviewErrors.business,
              employment: reviewErrors.employment || reviewErrors.business,
              loan: reviewErrors.loan,
              property: reviewErrors.property,
              vehicle: reviewErrors.vehicle,
              machinery: reviewErrors.machinery,
              msme: reviewErrors.msme || reviewErrors.business,
            }}
          />

          <ReviewDocumentsSummary
            items={checklist}
            onEditDocuments={onEditDocuments}
            error={documentsError}
          />

          <ReviewConsentCard
            isConfirmed={isReviewConsentGiven}
            onToggleConfirm={setReviewConsent}
            error={reviewErrors.consent}
          />
        </Animated.View>
      </KeyboardAwareScrollView>

      <KeyboardStickyFooter
        style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) + 4 }]}
      >
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          disabled={isSubmitting}
          activeOpacity={0.85}
          onPress={handleSubmit}
          accessibilityRole="button"
          accessibilityLabel="Submit application"
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={BrandColors.WHITE} />
          ) : (
            <>
              <Text style={styles.submitButtonText}>Submit Application</Text>
              <Ionicons name="arrow-forward" size={18} color={BrandColors.WHITE} />
            </>
          )}
        </TouchableOpacity>
        <View style={styles.secureRow}>
          <Ionicons name="lock-closed-outline" size={13} color={BrandColors.TEXT_SECONDARY} />
          <Text style={styles.secureText}>Your information is secure and encrypted</Text>
        </View>
      </KeyboardStickyFooter>
    </View>
  );
};

export default LoanReviewScreen;
