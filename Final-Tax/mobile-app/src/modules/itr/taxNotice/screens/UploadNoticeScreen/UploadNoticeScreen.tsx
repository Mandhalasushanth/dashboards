import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  TaxNoticeHeader,
  TaxNoticeDatePickerInput,
} from "../../components/common";
import { NoticeUploadCard } from "../../components/upload";
import { TaxNoticeFormData } from "../../types/taxNotice.types";
import {
  INITIAL_TAX_NOTICE_FORM_DATA,
  NOTICE_TYPE_OPTIONS,
} from "../../mock/taxNoticeData";
import { useApplicationStore } from "@/store/applicationStore";
import { useAuthStore } from "@/modules/authentication/store/authStore";
import { UniversalDraftModal } from "@/shared/components/UniversalDraftModal";
import { useUniversalDraftGuard } from "@/shared/hooks/useUniversalDraftGuard";
import { taxNoticeApi } from "../../../services/taxNoticeApi";
import {
  styles,
  getContainerInsetsStyle,
  getScrollContentInsetsStyle,
  getBottomBarInsetsStyle,
} from "./UploadNoticeScreen.styles";
import { validateStep1Data, validateStep2Data } from "./UploadNoticeScreen.utils";
import { AssessmentYearDropdown, NoticeTypeDropdown } from "./UploadNoticeScreen.components";

export const UploadNoticeScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const taxNoticeDraft = useApplicationStore((state) => state.taxNoticeDraft);
  const saveTaxNoticeDraft = useApplicationStore((state) => state.saveTaxNoticeDraft);
  const clearTaxNoticeDraft = useApplicationStore((state) => state.clearTaxNoticeDraft);

  const authUser = useAuthStore((state) => state.authenticatedUser);
  const customer = useAuthStore((state) => state.customer);
  const profilePan = customer?.pan || authUser?.pan || "";

  // 2-step flow: 1 = Notice Details, 2 = Upload Notice
  const [currentStep, setCurrentStep] = useState<1 | 2>(() => {
    if (taxNoticeDraft?.step === "UPLOAD") return 2;
    return 1;
  });

  // Pure functional initial state: restore from draft or start clean (no predefined mock values)
  const [formData, setFormData] = useState<TaxNoticeFormData>(() => {
    if (taxNoticeDraft && taxNoticeDraft.formData) {
      return {
        ...INITIAL_TAX_NOTICE_FORM_DATA,
        ...taxNoticeDraft.formData,
        pan: taxNoticeDraft.formData.pan || "",
      } as TaxNoticeFormData;
    }
    return {
      ...INITIAL_TAX_NOTICE_FORM_DATA,
      pan: "",
    };
  });

  const [showAyDropdown, setShowAyDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showOtherAyInput, setShowOtherAyInput] = useState(false);

  // Universal Draft Guard Hook for intercepting back navigation
  const {
    showDraftModal,
    openDraftModal,
    handleSaveAndExit,
    handleDiscardAndExit,
    handleCancel,
  } = useUniversalDraftGuard({
    isDirty: () =>
      Boolean(
        (formData.pan && formData.pan !== profilePan) ||
        formData.noticeNumber ||
        formData.noticeDate ||
        formData.responseDueDate ||
        formData.customerExplanation ||
        formData.noticeFileName
      ),
    onSaveDraft: () => {
      saveTaxNoticeDraft({
        formData,
        step: currentStep === 1 ? "DETAILS" : "UPLOAD",
        updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    },
    onDiscardDraft: () => {
      clearTaxNoticeDraft();
    },
  });

  const handleFieldChange = (field: keyof TaxNoticeFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleUploadSuccess = (fileInfo: {
    uri: string;
    name: string;
    size: string;
  }) => {
    setFormData((prev) => ({
      ...prev,
      noticeFileUri: fileInfo.uri,
      noticeFileName: fileInfo.name,
      noticeFileSize: fileInfo.size,
    }));
    if (errors.file) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.file;
        return next;
      });
    }
  };

  const validateStep1 = (): boolean => validateStep1Data(formData, setErrors);

  const validateStep2 = (): boolean => validateStep2Data(formData, setErrors);
  const handleStep1Continue = async () => {
    if (!validateStep1()) return;

    try {
      setIsSubmitting(true);
      
      let noticeId = taxNoticeDraft?.formData?.noticeId;
      const payload = {
        pan: formData.pan,
        assessmentYear: formData.assessmentYear,
        noticeType: formData.noticeType,
        noticeDate: formData.noticeDate,
        noticeNumber: formData.noticeNumber,
        responseDueDate: formData.responseDueDate,
        customerExplanation: formData.customerExplanation,
        noticeFileUri: "",
        noticeFileName: "",
        noticeFileType: "application/pdf"
      };

      if (noticeId) {
        await taxNoticeApi.updateTaxNotice(noticeId, payload);
      } else {
        noticeId = await taxNoticeApi.registerTaxNotice(payload);
      }

      saveTaxNoticeDraft({
        formData,
        step: taxNoticeDraft?.step === "REVIEW" ? "REVIEW" : "DOCUMENTS",
        updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });

      router.push({
        pathname: (taxNoticeDraft?.step === "REVIEW" ? "/service/tax-notice-preview" : "/service/tax-notice-documents") as any,
        params: {
          noticeId,
          pan: formData.pan,
          noticeNumber: formData.noticeNumber,
          noticeDate: formData.noticeDate,
          responseDueDate: formData.responseDueDate,
          noticeType: formData.noticeType,
          assessmentYear: formData.assessmentYear,
        },
      });
    } catch (err: any) {
      console.error("API Error: ", err);
      Alert.alert("Registration Failed", err.message || "Could not register tax notice.");
    } finally {
      setIsSubmitting(false);
    }
  };

  

  const handleHeaderBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      openDraftModal();
    }
  };

  return (
    <View style={[styles.container, getContainerInsetsStyle(insets.top)]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header with Draft Action */}
            <TaxNoticeHeader
        subtitle="Notice Details"
        onBack={handleHeaderBack}
      />

      {/* Main Form Content */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          getScrollContentInsetsStyle(insets.bottom),
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        

                  {/* ================= STEP 1: NOTICE DETAILS ================= */}
          <View>
            
            <View style={styles.titleSection}>
              <Text style={styles.pageTitle}>Enter Notice Information</Text>
              <Text style={styles.pageSubtitle}>
                Provide details from your notice. This helps our Tax Executive analyze the legal sections and prepare your defense.
              </Text>
            </View>

            {/* Field 1: PAN */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Permanent Account Number (PAN) <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={[styles.textInput, errors.pan ? styles.inputError : null]}
                placeholder="Enter 10-digit PAN (e.g. ABCDE1234F)"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
                maxLength={10}
                value={formData.pan}
                onChangeText={(text) => handleFieldChange("pan", text.replace(/[^A-Za-z0-9]/g, "").toUpperCase())}
              />
              {errors.pan ? <Text style={styles.errorText}>{errors.pan}</Text> : null}
            </View>

            {/* Field 2: Assessment Year */}
            <AssessmentYearDropdown
              formData={formData}
              errors={errors}
              handleFieldChange={handleFieldChange}
              showOtherAyInput={showOtherAyInput}
              setShowOtherAyInput={setShowOtherAyInput}
              showAyDropdown={showAyDropdown}
              setShowAyDropdown={setShowAyDropdown}
            />

            {/* Field 3: Notice Type */}
            <NoticeTypeDropdown
              formData={formData}
              errors={errors}
              handleFieldChange={handleFieldChange}
              showTypeDropdown={showTypeDropdown}
              setShowTypeDropdown={setShowTypeDropdown}
            />

            {/* Field 4: Notice Date (Interactive Calendar DatePicker) */}
            <TaxNoticeDatePickerInput
              label="Notice Date"
              required
              value={formData.noticeDate}
              onChange={(dateStr) => handleFieldChange("noticeDate", dateStr)}
              placeholder="Select date mentioned on notice"
              helperText="Date of issuance stated on the top right of your notice"
              error={errors.noticeDate}
              maximumDate={new Date()}
            />

            {/* Field 5: Notice Reference Number / DIN */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Notice Reference Number / DIN <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  errors.noticeNumber ? styles.inputError : null,
                ]}
                placeholder="e.g. CPC/2526/A3/284419260 or DIN"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
                value={formData.noticeNumber}
                maxLength={50}
                  onChangeText={(text) => handleFieldChange("noticeNumber", text.replace(/[^A-Za-z0-9/\\-]/g, "").toUpperCase())}
              />
              <Text style={styles.inputHint}>
                Document Identification Number (DIN) or CPC Communication number
              </Text>
              {errors.noticeNumber ? (
                <Text style={styles.errorText}>{errors.noticeNumber}</Text>
              ) : null}
            </View>

            {/* Field 6: Response Due Date (Interactive Calendar DatePicker) */}
            <TaxNoticeDatePickerInput
              label="Response Due Date"
              required
              value={formData.responseDueDate}
              onChange={(dateStr) => handleFieldChange("responseDueDate", dateStr)}
              placeholder="Select response due date"
              helperText="Last date allowed by the IT Department to file response (typically 15-30 days)"
              error={errors.responseDueDate}
            />

            {/* Field 7: Customer Explanation */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Your Explanation / Background <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  errors.customerExplanation ? styles.inputError : null,
                ]}
                multiline
                numberOfLines={4}
                placeholder="Describe your case, income sources, reason for discrepancy, or if you already paid taxes..."
                placeholderTextColor="#94A3B8"
                value={formData.customerExplanation}
                maxLength={1000}
                  onChangeText={(text) => handleFieldChange("customerExplanation", text)}
              />
              {errors.customerExplanation ? (
                <Text style={styles.errorText}>{errors.customerExplanation}</Text>
              ) : null}
            </View>

                        {/* Blue Guidance Card */}
            <View style={styles.infoCard}>
              <View style={styles.infoIconCircle}>
                <Ionicons name="information" size={18} color="#FFFFFF" />
              </View>
              <Text style={styles.infoText}>
                You can find the DIN, notice date, and assessment year on the top portion of your Income Tax communication.
              </Text>
            </View>
          </View>
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View style={[styles.bottomBar, getBottomBarInsetsStyle(insets.bottom)]}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleStep1Continue}
          style={[styles.continueButton, isSubmitting && { opacity: 0.7 }]}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.continueButtonText}>{taxNoticeDraft?.step === "REVIEW" ? "Update & Continue" : "Continue to Supporting Documents"}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Universal Draft Confirmation Modal */}
      <UniversalDraftModal
        visible={showDraftModal}
        title="Save Notice Progress?"
        message="You have unsaved notice information. Save as draft to continue anytime without losing your inputs."
        onSaveAndExit={handleSaveAndExit}
        onDiscardAndExit={handleDiscardAndExit}
        onCancel={handleCancel}
      />
    </View>
  );
};

export default UploadNoticeScreen;


