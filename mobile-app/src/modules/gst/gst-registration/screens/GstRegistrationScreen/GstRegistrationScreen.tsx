/**
 * Screen: GST Registration
 * Refactored: Modular Monolith architecture. Strictly UI only. No inline styles.
 */

import React, { useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";

import { GstStepHeader } from "@/modules/gst/components/GstStepHeader";
import { GstBusinessStep } from "@/modules/gst/gst-registration/components/GstBusinessStep/GstBusinessStep";
import { GstUnifiedDocumentStep } from "@/modules/gst/gst-registration/components/GstUnifiedDocumentStep/GstUnifiedDocumentStep";
import { GstReviewStep } from "@/modules/gst/gst-registration/components/GstReviewStep/GstReviewStep";
import { GstApplicationStatusStep } from "@/modules/gst/gst-status/components/GstApplicationStatusStep/GstApplicationStatusStep";
import { UniversalDraftModal } from "@/shared/components/UniversalDraftModal";
import { KeyboardAwareScrollView } from "@/shared/components/KeyboardAwareFormLayout";

import { useGstRegistrationFlow } from "@/modules/gst/gst-registration/hooks/useGstRegistrationFlow";
import { styles, getHeaderBarStyle } from "./GstRegistrationScreen.styles";

const STEP_LABELS = [
  "Business Details",
  "Upload Documents",
  "Review Application",
];

const getButtonText = (index: number, isEditMode: boolean = false) => {
  if (isEditMode && (index === 0 || index === 1)) {
    return "Update & Review";
  }
  const texts = [
    "Continue to Documents",
    "Continue to Review",
    "Submit Application",
  ];
  return texts[index] || "";
};

export const GstRegistrationScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const {
    screenIndex,
    isLoading,
    declared,
    setDeclared,
    businessData,
    businessErrors,
    documents,
    createdAppId,
    createdGstId,
    draftGuard,
    handleBusinessChange,
    handleBusinessBlur,
    handleUpdateDocuments,
    handleContinue,
    handleBack,
    isEditMode,
    editSection,
    handleEditStep,
    isFetchingReview,
    reviewFetchError,
    handleRetryReviewFetch,
    handleSectionLayout,
    handleFieldLayout,
    focusedField,
    appliedDate,
  } = useGstRegistrationFlow(scrollViewRef);

  const handleRequestScrollToSection = useCallback((_section: "bank" | "signatory", y?: number) => {
    setTimeout(() => {
      const targetY = typeof y === "number" && y > 0 ? y - 10 : 600;
      scrollViewRef.current?.scrollTo({ y: targetY, animated: true });
    }, 120);
  }, []);

  return (
    <View style={styles.root}>
      {/* Header & Step Tracker */}
      {screenIndex < 3 ? (
        <GstStepHeader
          title="GST Registration"
          currentStep={screenIndex + 1}
          totalSteps={3}
          stepLabel={STEP_LABELS[screenIndex]}
          onBack={isEditMode ? undefined : handleBack}
          showBack={!isEditMode}
        />
      ) : (
        <View style={[styles.headerBar, getHeaderBarStyle(insets.top)]}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleBack}
            style={styles.backButton}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={BrandColors.TEXT_PRIMARY}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Application Status</Text>
          <View style={styles.placeholderBox} />
        </View>
      )}

      {/* Main Scroll Content with Shared Keyboard-Aware Avoidance */}
      <KeyboardAwareScrollView
        ref={scrollViewRef}
        extraScrollHeight={64}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 16) + (screenIndex === 3 ? 24 : 36) },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        bounces={true}
        overScrollMode="always"
        nestedScrollEnabled={true}
      >
        {screenIndex === 0 && (
          <GstBusinessStep
            data={businessData}
            errors={businessErrors}
            onChange={handleBusinessChange}
            onBlurField={handleBusinessBlur}
            onRequestScrollToSection={handleRequestScrollToSection}
            initialExpandedSection={editSection}
            onSectionLayout={handleSectionLayout}
            onFieldLayout={handleFieldLayout}
            focusedField={focusedField}
          />
        )}

        {screenIndex === 1 && (
          <GstUnifiedDocumentStep
            documents={documents}
            onUpdateDocument={(docId, patch) => {
              const updated = documents.map((d) =>
                d.id === docId ? { ...d, ...patch } : d,
              );
              handleUpdateDocuments(updated);
            }}
          />
        )}

        {screenIndex === 2 && (
          <GstReviewStep
            businessData={businessData}
            documents={documents}
            onEditStep={handleEditStep}
            declared={declared}
            onToggleDeclaration={() => setDeclared((prev: boolean) => !prev)}
            isFetching={isFetchingReview}
            reviewFetchError={reviewFetchError}
            onRetry={handleRetryReviewFetch}
          />
        )}

        {screenIndex === 3 && (
          <GstApplicationStatusStep
            appId={createdGstId || createdAppId || businessData.gstId}
            businessName={businessData.businessName || "Your Business"}
            appliedDate={appliedDate}
            serviceName="GST Registration"
          />
        )}

        {/* Action Button */}
        {screenIndex < 3 && (
          <View style={styles.buttonWrapper}>
            {isEditMode ? (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleContinue}
                style={styles.updateReviewBtn}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <View style={styles.updateReviewContent}>
                    <Ionicons name="checkmark-circle-outline" size={19} color="#FFFFFF" />
                    <Text style={styles.updateReviewBtnText}>Update & Review</Text>
                  </View>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleContinue}
                style={styles.submitBtn}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {getButtonText(screenIndex)}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </KeyboardAwareScrollView>

      {/* Universal Save As Draft Confirmation Modal */}
      <UniversalDraftModal
        visible={draftGuard.showDraftModal}
        title="Save Application Progress?"
        message="You have unsaved changes. Save your progress so you can resume anytime without re-entering details."
        saveButtonText="Save as Draft & Exit"
        discardButtonText="Discard & Exit"
        cancelButtonText="Keep Editing"
        onSaveAndExit={draftGuard.handleSaveAndExit}
        onDiscardAndExit={draftGuard.handleDiscardAndExit}
        onCancel={draftGuard.handleCancel}
      />
    </View>
  );
};

export default GstRegistrationScreen;
