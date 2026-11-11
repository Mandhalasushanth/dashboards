import React, { useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { GstFilingPeriodStep } from "@/modules/gst/gst-filing/components/GstFilingPeriodStep/GstFilingPeriodStep";
import { GstFilingDocumentsStep } from "@/modules/gst/gst-filing/components/GstFilingDocumentsStep/GstFilingDocumentsStep";
import { GstFilingReviewStep } from "@/modules/gst/gst-filing/components/GstFilingReviewStep/GstFilingReviewStep";
import { GstApplicationStatusStep } from "@/modules/gst/gst-status/components/GstApplicationStatusStep/GstApplicationStatusStep";
import { UniversalDraftModal } from "@/shared/components/UniversalDraftModal";
import { KeyboardAwareScrollView } from "@/shared/components/KeyboardAwareFormLayout";
import { formatSubmissionDate } from "@/shared/formatters/dateFormatter";
import { useApplicationStore } from "@/store/applicationStore";
import { applicationService } from "@/modules/applications/services/applicationService";
import { gstApi } from "@/modules/gst/services/gstApi";
import { logger } from "@/core/logging/logger";
import { useGstFiling } from "@/modules/gst/gst-filing/hooks/useGstFiling";
import { buildFilingPayload } from "@/modules/gst/gst-filing/hooks/gstFilingHelpers";
import { GstStepHeader } from "@/modules/gst/components/GstStepHeader/GstStepHeader";
import {
  styles,
  getHeaderBarStyle,
  getScrollContentStyle,
  getSubmitButtonStyle,
} from "@/modules/gst/gst-filing/screens/GstFilingScreen/GstFilingScreen.styles";

const FILING_STEP_LABELS = [
  "Filing Period",
  "Upload Documents",
  "Review & Summary",
];

export const GstFilingScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const {
    currentStep,
    setCurrentStep,
    isSubmitting,
    periodData,
    setPeriodData,
    periodErrors,
    setPeriodErrors,
    documents,
    createdAppId,
    filingId,
    showDraftModal,
    handleSaveAndExit,
    handleDiscardAndExit,
    handleCancel,
    getScreenTitle,
    getButtonText,
    handleBack,
    handleContinue,
    handleUpdateDocuments,
    requiredDocs,
    missingDocsCount,
    uploadedDocsCount,
    isEditMode,
    handleEditStep,
    isFetchingReview,
  } = useGstFiling();

  // Scroll to top on step transition
  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, [currentStep]);

  const handleComputationChange = (turnover: number, itc: number, purchases?: number) => {
    const updatedPeriod = {
      ...periodData,
      taxableSales: String(turnover),
      turnover: String(turnover),
      taxablePurchases: purchases !== undefined ? String(purchases) : (periodData.taxablePurchases || "0"),
      eligibleItc: String(itc),
      calculationMethod: "manual_estimates" as const,
    };
    setPeriodData(updatedPeriod);

    if (filingId) {
      const payload = buildFilingPayload(updatedPeriod, undefined, true);
      gstApi.updateFiling(filingId, payload).catch((err) => {
        logger.warn("[GstFilingScreen] Failed to update computation:", { error: err, filingId });
      });
    }
    if (createdAppId) {
      const existing = useApplicationStore
        .getState()
        .applications.find((a) => a.id === createdAppId);
      if (existing) {
        applicationService
          .updateApplication({
            ...existing,
            formData: {
              ...existing.formData,
              taxableSales: String(turnover),
              turnover: String(turnover),
              taxablePurchases: purchases !== undefined ? String(purchases) : (existing.formData?.taxablePurchases || "0"),
              eligibleItc: String(itc),
              calculationMethod: "manual_estimates",
            },
          })
          .catch((err) => {
            logger.warn("[GstFilingScreen] Failed to sync application draft computation:", { error: err, createdAppId });
          });
      }
    }
  };

  const periodLabel =
    periodData.filingPeriod || periodData.filingMonth || "Current Period";
  const returnFormLabel = periodData.filingType
    ? periodData.filingType.split(" ")[0]
    : "GSTR-1";
  const businessDisplayName =
    periodData.tradeName || periodData.businessName || "Registered Business";

  // Lookup application details from store if present to get stored submission date
  const existingApp = useApplicationStore
    .getState()
    .applications.find(
      (a) =>
        a.id === createdAppId ||
        a.id === filingId ||
        a.formData?.filingId === filingId ||
        a.formData?.filingId === createdAppId ||
        a.formData?.applicationId === createdAppId,
    );

  const appliedDate =
    formatSubmissionDate(
      existingApp?.formData?.submissionDate ||
        existingApp?.formData?.appliedDate ||
        existingApp?.submittedAt ||
        existingApp?.createdAt,
    ) || formatSubmissionDate(new Date());

  return (
    <View style={styles.root}>
      {/* Top Header Bar with ITR-style step indicator */}
      {currentStep < 3 ? (
        <GstStepHeader
          title="GST Filing"
          currentStep={currentStep + 1}
          totalSteps={3}
          stepLabel={FILING_STEP_LABELS[currentStep] || "Filing"}
          onBack={isEditMode ? undefined : handleBack}
          showBack={!isEditMode && currentStep !== 2}
        />
      ) : (
        <View style={[styles.headerBar, getHeaderBarStyle(insets.top)]}>
          <View style={styles.placeholderBox} />
          <Text style={styles.headerTitle}>{getScreenTitle()}</Text>
          <View style={styles.placeholderBox} />
        </View>
      )}

      {/* Main Scroll Content */}
      <KeyboardAwareScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          getScrollContentStyle(currentStep >= 3),
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={true}
        overScrollMode="always"
        nestedScrollEnabled={true}
      >
        {currentStep === 0 && (
          <GstFilingPeriodStep
            data={periodData}
            errors={periodErrors}
            onError={(field, error) => {
              setPeriodErrors((prev) => {
                if (error) {
                  return { ...prev, [field]: error };
                }
                const { [field]: _removed, ...rest } = prev;
                return rest;
              });
            }}
            onChange={(fields) => {
              setPeriodData((prev) => ({ ...prev, ...fields }));
              setPeriodErrors((prev) => {
                const keys = Object.keys(fields).filter((k) => k !== "gstin");
                if (keys.length === 0) return prev;
                return Object.fromEntries(
                  Object.entries(prev).filter(([k]) => !keys.includes(k))
                );
              });
            }}
          />
        )}

        {currentStep === 1 && (
          <GstFilingDocumentsStep
            documents={documents}
            onUpdateDocuments={handleUpdateDocuments}
            filingPeriodText={`${returnFormLabel} — ${periodLabel}`}
            filingNature={periodData.filingNature || "Regular Return"}
          />
        )}

        {currentStep === 2 && (
          <GstFilingReviewStep
            key={`${periodData.taxableSales || periodData.turnover || "0"}-${periodData.taxablePurchases || "0"}-${periodData.eligibleItc || "0"}-${periodData.calculationMethod || "ca"}-${periodData.filingNature || "reg"}`}
            gstin={periodData.gstin}
            businessName={businessDisplayName}
            taxpayerScheme={periodData.taxpayerScheme || "Regular Scheme"}
            filingNature={periodData.filingNature || "Regular Return"}
            financialYear={periodData.financialYear || "FY 2025-26"}
            filingMonth={periodLabel}
            filingType={periodData.filingType || "GSTR-1"}
            filingFrequency={periodData.periodType || "Monthly"}
            uploadedDocsCount={uploadedDocsCount}
            totalRequiredDocsCount={requiredDocs.length}
            missingDocsCount={missingDocsCount}
            grossTaxableTurnover={
              periodData.taxableSales || periodData.turnover || 0
            }
            taxablePurchases={periodData.taxablePurchases || 0}
            eligibleItc={periodData.eligibleItc || 0}
            calculationMethod={periodData.calculationMethod}
            isFetching={isFetchingReview}
            onEditFilingDetails={() => handleEditStep(0)}
            onEditTaxComputation={() => handleEditStep(0)}
            onEditDocuments={() => handleEditStep(1)}
            onReuploadDocuments={() => handleEditStep(1)}
            onUpdateComputation={handleComputationChange}
            onApprove={handleContinue}
            onRequestChanges={() =>
              Alert.alert(
                "Request Changes",
                "Your request has been forwarded to our Chartered Accountant. You will receive an updated return summary shortly.",
              )
            }
          />
        )}

        {currentStep === 3 && (
          <GstApplicationStatusStep
            appId={createdAppId || "Not available"}
            businessName={
              periodData.tradeName ||
              periodData.businessName ||
              (periodData.gstin
                ? `GSTIN: ${periodData.gstin}`
                : "Registered Business")
            }
            serviceName={`GST Filing (${periodLabel})`}
            appliedDate={appliedDate}
            estCompletion="1-2 Business Days"
            isFilingWorkflow={true}
            onReuploadDocuments={() => setCurrentStep(1)}
          />
        )}

        {/* Action Button */}
        {currentStep <= 2 && (
          <View style={styles.buttonWrapper}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleContinue}
              style={getSubmitButtonStyle(isSubmitting)}
              disabled={isSubmitting}
            >
              <Text style={styles.submitBtnText}>
                {isSubmitting ? "Saving..." : getButtonText()}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAwareScrollView>

      {/* Universal Save As Draft Confirmation Modal */}
      <UniversalDraftModal
        visible={showDraftModal && currentStep < 3}
        title="Save Filing Progress?"
        message="You have unsaved changes in your GST return filing. Save your progress so you can resume anytime without re-entering details."
        saveButtonText="Save as Draft & Exit"
        discardButtonText="Discard & Exit"
        cancelButtonText="Keep Editing"
        onSaveAndExit={handleSaveAndExit}
        onDiscardAndExit={handleDiscardAndExit}
        onCancel={handleCancel}
      />
    </View>
  );
};

export default GstFilingScreen;
