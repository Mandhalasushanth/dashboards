import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/shared/hooks/useTheme";
import { BrandColors } from "@/shared/theme";
import {
  KeyboardAwareScrollView,
  KeyboardAwareScrollController,
} from "@/shared/components/KeyboardAwareFormLayout";
import { ComplianceHeader } from "@/modules/gst/gst-compliance/components/ComplianceHeader/ComplianceHeader";
import {
  BottomSheetSelector,
  SelectorOption,
} from "@/modules/gst/gst-compliance/components/BottomSheetSelector/BottomSheetSelector";
import { RequestTypeSection } from "@/modules/gst/gst-compliance/components/RequestTypeSection/RequestTypeSection";
import { FloatingLabelInput } from "@/modules/gst/gst-compliance/components/FloatingLabelInput/FloatingLabelInput";
import { GstinInfoIcon } from "@/modules/gst/components/common";
import { UniversalDraftModal } from "@/shared/components/UniversalDraftModal";
import { GstComplianceReviewStep } from "@/modules/gst/gst-compliance/components/GstComplianceReviewStep/GstComplianceReviewStep";
import { useComplianceForm } from "@/modules/gst/gst-compliance/hooks/useComplianceForm";
import {
  styles,
  getRootBgStyle,
  getScrollContentStyle,
} from "@/modules/gst/gst-compliance/screens/GstComplianceScreen/GstComplianceScreen.styles";

const FINANCIAL_YEARS: SelectorOption[] = [
  { label: "2025-26", value: "2025-26", icon: "calendar-outline" },
  { label: "2024-25", value: "2024-25", icon: "calendar-outline" },
  { label: "2023-24", value: "2023-24", icon: "calendar-outline" },
  { label: "2022-23", value: "2022-23", icon: "calendar-outline" },
];

const REQUEST_TYPES: SelectorOption[] = [
  {
    label: "Reconciliation Support",
    value: "Reconciliation Support",
    icon: "git-compare-outline",
    subtitle: "Reconcile Purchase & Sales registers against GSTR-2B",
  },
  {
    label: "Notice Response",
    value: "Notice Response",
    icon: "document-text-outline",
    subtitle: "Expert CA response drafting for GST department notices",
  },
];

export function GstComplianceScreen() {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const scrollViewRef = useRef<ScrollView>(null);
  const kbControllerRef = useRef<KeyboardAwareScrollController>(null);
  const sectionPositionsRef = useRef<Record<string, number>>({});
  const innerPositionsRef = useRef<Record<string, number>>({});
  const requestTypeSectionYRef = useRef<number>(0);

  const handleScrollToTarget = useCallback((targetY: number) => {
    scrollViewRef.current?.scrollTo({ y: Math.max(0, targetY - 12), animated: true });
  }, []);

  const handleValidationError = useCallback((firstField: string) => {
    if (firstField === "gstin" || firstField === "financialYear" || firstField === "requestType") {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    const sectionKey =
      firstField === "noticeDoc" || firstField === "purchaseDoc" || firstField === "salesDoc"
        ? "documents"
        : firstField.startsWith("notice") || firstField === "replyDueDate"
        ? "notice"
        : firstField === "gstr2bRef" || firstField === "reconciliationRemarks"
        ? "recon"
        : undefined;

    const targetY = (sectionKey ? sectionPositionsRef.current[sectionKey] : undefined) ?? sectionPositionsRef.current[firstField];
    if (typeof targetY === "number" && targetY > 0) {
      setTimeout(() => handleScrollToTarget(targetY), 60);
    }
  }, [handleScrollToTarget]);

  const {
    currentStep, isEditMode, editSection, formData, errors,
    isSubmitting, isSaving, complianceId, dbReviewData,
    showConfirmModal, setShowConfirmModal, draftGuard,
    hasEnteredReview,
    updateField, clearError, setFieldError, handleGstinChange,
    handleEditStep, handleContinue, handleBack, handleReturnToReview,
    handleConfirmSubmit, getButtonText,
  } = useComplianceForm({ onValidationError: handleValidationError });

  const handleSectionLayout = useCallback((section: string, relativeY: number) => {
    innerPositionsRef.current[section] = relativeY;
    sectionPositionsRef.current[section] = requestTypeSectionYRef.current + relativeY;
  }, []);

  const handleRequestTypeContainerLayout = useCallback((e: { nativeEvent: { layout: { y: number } } }) => {
    const parentY = e.nativeEvent.layout.y;
    requestTypeSectionYRef.current = parentY;
    Object.keys(innerPositionsRef.current).forEach((sec) => {
      sectionPositionsRef.current[sec] = parentY + innerPositionsRef.current[sec];
    });
  }, []);

  // Consistent screen initialization: on step transitions (Review <-> Form),
  // reset scroll position cleanly to the top without arbitrary delayed jumps.
  const prevStepRef = useRef<number>(currentStep);
  useEffect(() => {
    if (prevStepRef.current !== currentStep) {
      prevStepRef.current = currentStep;
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }
  }, [currentStep]);

  const handleScrollField = useCallback((fieldName: string) => {
    if (fieldName === "gstin") {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    kbControllerRef.current?.scrollToFocusedInput();

    const targetY =
      sectionPositionsRef.current[fieldName] ??
      (fieldName.includes("notice") ? sectionPositionsRef.current["notice"] : undefined) ??
      (fieldName.includes("recon") ? sectionPositionsRef.current["recon"] : undefined);

    if (typeof targetY === "number" && targetY > 0) {
      handleScrollToTarget(targetY);
    }
  }, [handleScrollToTarget]);

  const [showFyModal, setShowFyModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);

  return (
    <View style={[styles.root, getRootBgStyle(isDark)]}>
      {/* Top Header Bar with ITR-style step indicator */}
      <ComplianceHeader
        title={currentStep === 1 ? "Review Compliance Request" : "GST Compliance"}
        currentStep={currentStep + 1}
        totalSteps={2}
        stepLabel={currentStep === 1 ? "Review & Submit" : "Request Details"}
        onBackPress={isEditMode ? undefined : handleBack}
        showBack={!isEditMode && currentStep !== 1}
      />

      <KeyboardAwareScrollView
        ref={scrollViewRef}
        controllerRef={kbControllerRef}
        style={[styles.scrollView, isDark ? styles.scrollViewDark : styles.scrollViewLight]}
        contentContainerStyle={[styles.scrollContent, getScrollContentStyle(insets.bottom)]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        bounces={false}
        extraScrollHeight={72}
      >

          {/* Step 0: Input Form & Upload Cards */}
          {currentStep === 0 && (
            <>
              {/* Business & Filing Details Card */}
              <View
                style={[
                  styles.card,
                  isDark ? styles.cardDark : styles.cardLight,
                ]}
              >
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIconBox, isDark && styles.sectionIconBoxDark]}>
                    <Ionicons name="document-text-outline" size={18} color={BrandColors.PRIMARY_ORANGE} />
                  </View>
                  <View style={styles.sectionTitleWrap}>
                    <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                      Business & Filing Details
                    </Text>
                    <Text style={[styles.sectionSubtitle, isDark && styles.sectionSubtitleDark]}>
                      GSTIN, Financial Year & Request Type
                    </Text>
                  </View>
                </View>

                {/* 1. GSTIN Floating Label */}
                <FloatingLabelInput
                  label="GSTIN"
                  floatingLabel="GSTIN"
                  placeholder="Enter GSTIN"
                  required
                  labelAbove
                  value={formData.gstin}
                  onChangeText={handleGstinChange}
                  autoCapitalize="characters"
                  maxLength={15}
                  autoCorrect={false}
                  error={errors.gstin}
                  cardBackground={isDark ? "#1E293B" : BrandColors.WHITE}
                  labelRightElement={<GstinInfoIcon size={16} />}
                  rightElement={
                    formData.gstin.length === 15 && !errors.gstin ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color="#16A34A"
                      />
                    ) : null
                  }
                  onClear={() => {
                    updateField("gstin", "");
                    clearError("gstin");
                  }}
                  onFocusScroll={() => handleScrollField("gstin")}
                />

                {/* 2. Financial Year Selector */}
                <View style={styles.fieldGroup}>
                  <Text style={[styles.label, isDark && styles.labelDark]}>
                    Financial Year <Text style={styles.star}>*</Text>
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setShowFyModal(true)}
                    style={[styles.selectorBox, isDark && styles.selectorBoxDark, Boolean(errors.financialYear) && styles.selectorBoxError]}
                  >
                    <Text
                      style={[
                        styles.selectorText,
                        isDark && styles.selectorTextDark,
                        !formData.financialYear && (isDark ? styles.selectorPlaceholderDark : styles.selectorPlaceholder),
                      ]}
                    >
                      {formData.financialYear || "Select Financial Year"}
                    </Text>
                    <Ionicons name="chevron-down" size={18} color={isDark ? "#94A3B8" : "#64748B"} />
                  </TouchableOpacity>
                  {errors.financialYear ? <Text style={styles.errorText}>{errors.financialYear}</Text> : null}
                </View>

                {/* 3. Request Type Selector */}
                <View style={styles.fieldGroup}>
                  <Text style={[styles.label, isDark && styles.labelDark]}>
                    Request Type <Text style={styles.star}>*</Text>
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setShowTypeModal(true)}
                    style={[styles.selectorBox, isDark && styles.selectorBoxDark, Boolean(errors.requestType) && styles.selectorBoxError]}
                  >
                    <Text
                      style={[
                        styles.selectorText,
                        isDark && styles.selectorTextDark,
                        !formData.requestType && (isDark ? styles.selectorPlaceholderDark : styles.selectorPlaceholder),
                      ]}
                    >
                      {formData.requestType || "Select Request Type"}
                    </Text>
                    <Ionicons name="chevron-down" size={18} color={isDark ? "#94A3B8" : "#64748B"} />
                  </TouchableOpacity>
                  {errors.requestType ? <Text style={styles.errorText}>{errors.requestType}</Text> : null}
                </View>
              </View>

              {/* Dynamic Section (Reconciliation vs Notice Response + Image 1 Document Cards) */}
              <View onLayout={handleRequestTypeContainerLayout}>
                <RequestTypeSection
                  formData={formData}
                  errors={errors}
                  onUpdateField={updateField}
                  onClearError={clearError}
                  onScrollField={handleScrollField}
                  onSetError={setFieldError}
                  onSectionLayout={handleSectionLayout}
                />
              </View>
            </>
          )}

          {/* Step 1: Review Application Screen with Edit Buttons */}
          {currentStep === 1 && (
            <GstComplianceReviewStep
              formData={formData}
              dbData={dbReviewData}
              complianceId={complianceId}
              onEditStep={handleEditStep}
            />
          )}

          {/* Primary Action Button (Continue / Update & Review / Submit) */}
          <View style={styles.submitWrapper}>
            <TouchableOpacity
              style={[
                styles.submitBtn,
                (isSubmitting || isSaving) && styles.submitBtnDisabled,
              ]}
              activeOpacity={0.85}
              onPress={handleContinue}
              disabled={isSubmitting || isSaving}
            >
              {isSubmitting || isSaving ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>
                    {isSubmitting ? "Submitting Request..." : "Please wait..."}
                  </Text>
                </View>
              ) : (
                <Text style={styles.submitBtnText}>{getButtonText()}</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>

      {/* Financial Year Selector Modal */}
      <BottomSheetSelector
        visible={showFyModal}
        title="Select Financial Year"
        options={FINANCIAL_YEARS}
        selectedValue={formData.financialYear}
        onSelect={(val) => { updateField("financialYear", val); clearError("financialYear"); }}
        onClose={() => setShowFyModal(false)}
      />

      {/* Request Type Selector Modal */}
      <BottomSheetSelector
        visible={showTypeModal}
        title="Select Request Type"
        options={REQUEST_TYPES}
        selectedValue={formData.requestType}
        onSelect={(val) => {
          updateField("requestType", val as "Reconciliation Support" | "Notice Response");
          clearError("requestType");
        }}
        onClose={() => setShowTypeModal(false)}
      />

      {/* Universal Draft Modal */}
      <UniversalDraftModal
        visible={draftGuard.showDraftModal}
        onSaveAndExit={draftGuard.handleSaveAndExit}
        onDiscardAndExit={draftGuard.handleDiscardAndExit}
        onCancel={draftGuard.handleCancel}
      />
    </View>
  );
}

export default GstComplianceScreen;
