import { useState, useRef, useEffect, useCallback, ElementRef } from "react";
import { ScrollView, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { File as ExpoFile } from "expo-file-system";
import * as FileSystemLegacy from "expo-file-system/legacy";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useApplicationStore } from "@/store/applicationStore";
import { useNotificationStore } from "@/store/notificationStore";
import { useAuthStore } from "@/store/authStore";
import { pickImageFromCamera } from "@/modules/gst/utils/imageUploadHelper";
import { useUniversalDraftGuard } from "@/shared/hooks/useUniversalDraftGuard";
import { removeDraftFromIndex } from "@/shared/hooks/useServiceDraft";
import { pickDocumentFromDrive } from "@/shared/utils/driveDocumentUploader";
import { logger } from "@/core/logging/logger";

import {
  AmendmentStep, SupportingDoc, PickerModalState, SubmissionResult, AmendmentFormData, INITIAL_AMENDMENT_FORM_DATA,

} from "../types/gstAmendmentTypes";
import { AMENDMENT_SECTIONS } from "../config/gstNonCoreAmendmentConfig";
import {
  validateGstinInput, validateSectionForm, validateFieldRealtime, isFormDataDirty,
} from "../utils/gstAmendmentValidation";
import { validateGstinLive } from "@/modules/gst/utils/gstValidation";
import { resolveTargetGstId } from "../utils/gstAmendmentHelpers";
import { useGstAmendmentDetails } from "./useGstAmendmentDetails";
import { submitAmendmentService } from "../services/submitAmendmentService";
import { persistAmendmentForReview } from "../services/persistAmendmentForReview";
import { getErrorMessage } from "@/core/error-handling/errorMessage";
import {
  persistSupportingDocument,
  verifyFileAccessible,
} from "../utils/gstDocumentPersistence";

const stripImageData = (data: any): any => {
  if (!data || typeof data !== "object") return data;
  const { imageData, ...rest } = data;
  return rest;
};

export function useGstAmendmentWorkflow() {
  const router = useRouter();
  const params = useLocalSearchParams<{ gstin?: string; section?: string; step?: string; resume?: string }>();
  const scrollViewRef = useRef<ElementRef<typeof ScrollView>>(null);

  const customer = useAuthStore((state) => state.customer);
  const gstDraft = useApplicationStore((state) => state.gstDraft);
  const applications = useApplicationStore((state) => state.applications);
  const createApplication = useApplicationStore((state) => state.createApplication);
  const gstAmendmentDraft = useApplicationStore((state) => state.gstAmendmentDraft);
  const saveGstAmendmentDraft = useApplicationStore((state) => state.saveGstAmendmentDraft);
  const clearGstAmendmentDraft = useApplicationStore((state) => state.clearGstAmendmentDraft);
  const addNotification = useNotificationStore((state) => state.addNotification);

  // Workflow state
  const [currentStep, setCurrentStep] = useState<AmendmentStep>("LANDING");
  const [gstin, setGstin] = useState<string>("");
  const [selectedSectionId, setSelectedSectionId] = useState<string>("legal-name");
  const [formData, setFormData] = useState<AmendmentFormData>(INITIAL_AMENDMENT_FORM_DATA);
  const [sectionDocs, setSectionDocs] = useState<Record<string, SupportingDoc | null>>({});
  const [declared, setDeclared] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [isProofsExpanded, setIsProofsExpanded] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [amendmentId, setAmendmentId] = useState<number | string | null>(null);
  const [dbReviewData, setDbReviewData] = useState<any>(null);
  const [isSavingRecord, setIsSavingRecord] = useState(false);
  const savedDraftStepRef = useRef<AmendmentStep | null>(null);
  const savedDraftSectionIdRef = useRef<string | null>(null);

  const [pickerModal, setPickerModal] = useState<PickerModalState>({
    isOpen: false,
    title: "",
    options: [],
    selectedVal: "",
    onSelect: () => {},
  });

  const targetGstId = resolveTargetGstId(gstin, customer, gstDraft, applications);
  const registeredDetails = useGstAmendmentDetails(targetGstId, selectedSectionId);

  // Initial Draft Restoration on mount
  // Initial Draft Restoration on mount (aligned with GST Registration lifecycle)
  const hasRestoredDraftRef = useRef(false);
  useEffect(() => {
    if (hasRestoredDraftRef.current) return;
    hasRestoredDraftRef.current = true;

    const restoreDraft = async () => {
      try {
        const clean = customer?.mobile ? String(customer.mobile).replace(/\D/g, "") : "";
        let savedData: any = gstAmendmentDraft?.formData || {};
        let savedStep: AmendmentStep | undefined = gstAmendmentDraft?.step as AmendmentStep | undefined;

        if (!savedData.gstin && clean) {
          const draftKey = `@finsolz_draft_${clean}_gst-amendment`;
          const raw = await AsyncStorage.getItem(draftKey);
          if (raw) {
            const parsed = JSON.parse(raw);
            savedData = parsed.formData || {};
            savedStep = parsed.step;
          }
        }

        savedDraftStepRef.current = (savedStep as AmendmentStep) || null;
        savedDraftSectionIdRef.current = savedData.selectedSectionId || null;

        const isExplicitResume = Boolean(params.resume === "true" || params.step);

        if (params.gstin) {
          setGstin(params.gstin);
        } else if (savedData.gstin) {
          setGstin(savedData.gstin);
        }

        if (params.section) {
          setSelectedSectionId(params.section);
        } else if (savedData.selectedSectionId) {
          setSelectedSectionId(savedData.selectedSectionId);
        }

        if (savedData && Object.keys(savedData).length > 0) {
          setFormData((prev) => ({ ...prev, ...savedData }));
          if (savedData._sectionDocs) {
            setSectionDocs(savedData._sectionDocs);
          }
          if (savedData.amendmentId) {
            setAmendmentId(savedData.amendmentId);
          }
          if (savedData.dbReviewData) {
            setDbReviewData(savedData.dbReviewData);
          }
        }

        if (isExplicitResume) {
          const targetStep = (params.step as AmendmentStep) || savedStep || "EDIT";
          if (targetStep !== "SUCCESS") {
            setCurrentStep(targetStep);
          }
        } else {
          setCurrentStep("LANDING");
        }
      } catch (err) {
        logger.warn("[useGstAmendmentWorkflow] Error restoring draft:", { error: err });
      }
    };

    restoreDraft();
  }, [customer?.mobile, gstAmendmentDraft, params.gstin, params.resume, params.section, params.step]);


  const selectedSection =
    AMENDMENT_SECTIONS.find((s) => s.id === selectedSectionId) || AMENDMENT_SECTIONS[0];

  const supportingDoc = sectionDocs[selectedSectionId] || null;

  // Universal Draft Guard Integration with section-scoped docs
  const draftGuard = useUniversalDraftGuard({
    isDirty: () => isFormDataDirty(currentStep, formData, sectionDocs),
    onSaveDraft: () => {
      savedDraftStepRef.current = currentStep;
      savedDraftSectionIdRef.current = selectedSectionId;
      saveGstAmendmentDraft({
        formData: { gstin, selectedSectionId, ...formData, _sectionDocs: sectionDocs, amendmentId, dbReviewData: stripImageData(dbReviewData) },
        step: currentStep,
        updatedAt: new Date().toISOString().split("T")[0],
      });
    },
    onDiscardDraft: () => {
      savedDraftStepRef.current = null;
      savedDraftSectionIdRef.current = null;
      clearGstAmendmentDraft();
      setFormData(INITIAL_AMENDMENT_FORM_DATA);
      setSectionDocs({});
      setCurrentStep("LANDING");
    },
    isSubmitted: () => currentStep === "SUCCESS",
  });

  const clearError = useCallback((key: string) => {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const updateFormField = useCallback((field: keyof AmendmentFormData, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      const fieldError = validateFieldRealtime(field, value, next);
      setErrors((prevErr) => {
        const copy = { ...prevErr };
        if (fieldError) copy[field] = fieldError;
        else delete copy[field];

        // Cross-field revalidation: if bank account changed and confirm has value, revalidate confirm
        if (field === "newBankAccountNumber" && next.confirmBankAccountNumber) {
          const confirmErr = validateFieldRealtime("confirmBankAccountNumber", next.confirmBankAccountNumber, next);
          if (confirmErr) copy.confirmBankAccountNumber = confirmErr;
          else delete copy.confirmBankAccountNumber;
        }
        return copy;
      });
      return next;
    });
  }, []);

  const handleGstinChange = useCallback((text: string) => {
    const cleaned = text.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    setGstin(cleaned);
    setFormData(INITIAL_AMENDMENT_FORM_DATA);
    setSectionDocs({});
    setAmendmentId(null);
    setDbReviewData(null);
    savedDraftStepRef.current = null;
    savedDraftSectionIdRef.current = null;

    // Live validation feedback
    if (!cleaned) {
      clearError("gstin");
    } else {
      const err = validateGstinLive(cleaned);
      if (err) {
        setErrors((prev) => ({ ...prev, gstin: err }));
      } else {
        clearError("gstin");
      }
    }
  }, [clearError]);

  const handleUploadSuccess = useCallback(async (doc: SupportingDoc) => {
    // Persist document immediately into internal storage so it remains accessible
    const persisted = await persistSupportingDocument(doc);
    setSectionDocs((prev) => ({
      ...prev,
      [selectedSectionId]: persisted,
    }));
    clearError("supportingDoc");
  }, [clearError, selectedSectionId]);

  const handleExplicitSaveDraft = useCallback(async () => {
    savedDraftStepRef.current = currentStep;
    savedDraftSectionIdRef.current = selectedSectionId;
    saveGstAmendmentDraft({
      formData: { gstin, selectedSectionId, ...formData, _sectionDocs: sectionDocs, amendmentId, dbReviewData: stripImageData(dbReviewData) },
      step: currentStep,
      updatedAt: new Date().toISOString().split("T")[0],
    });
    Alert.alert("Draft Saved", "Your GST amendment progress has been saved. You can resume anytime from Incomplete Applications on Home.", [{ text: "OK", onPress: () => router.replace("/(main)/home") }]);
  }, [amendmentId, currentStep, dbReviewData, formData, gstin, router, saveGstAmendmentDraft, sectionDocs, selectedSectionId]);

  const handleBrowseFiles = useCallback(async () => {
    const doc = await pickDocumentFromDrive({
      maxSizeBytes: 10 * 1024 * 1024,
    });
    if (doc) {
      const persisted = await persistSupportingDocument({
        uri: doc.uri,
        name: doc.name,
        size: doc.size,
        mimeType: doc.mimeType,
      });
      setSectionDocs((prev) => ({
        ...prev,
        [selectedSectionId]: persisted,
      }));
      clearError("supportingDoc");
    }
  }, [clearError, selectedSectionId]);

  const handleScanFile = useCallback(async () => {
    const uri = await pickImageFromCamera(false);
    if (uri) {
      const persisted = await persistSupportingDocument({
        uri,
        name: `Scan_${Date.now().toString().slice(-4)}.jpg`,
        size: "1.4 MB",
        mimeType: "image/jpeg",
      });
      setSectionDocs((prev) => ({
        ...prev,
        [selectedSectionId]: persisted,
      }));
      clearError("supportingDoc");
    }
  }, [clearError, selectedSectionId]);

  const handleDeleteDoc = useCallback(() => {
    setSectionDocs((prev) => ({
      ...prev,
      [selectedSectionId]: null,
    }));
  }, [selectedSectionId]);

  const handleSelectSection = useCallback((sectionId: string) => {
    const validation = validateGstinInput(gstin);
    if (!validation.isValid) {
      setErrors({ gstin: validation.error });
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    clearError("gstin");
    setSelectedSectionId(sectionId);
    setIsProofsExpanded(false);
    setErrors({});
    const hasSavedReview =
      savedDraftStepRef.current === "REVIEW" &&
      savedDraftSectionIdRef.current === sectionId;
    if (hasSavedReview) {
      setCurrentStep("REVIEW");
    } else {
      setCurrentStep("EDIT");
    }
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, [clearError, gstin]);

  const openPickerModal = useCallback((
    title: string,
    options: string[],
    selectedVal: string,
    onSelect: (val: string) => void
  ) => {
    setPickerModal({ isOpen: true, title, options, selectedVal, onSelect });
  }, []);

  const closePickerModal = useCallback(() => {
    setPickerModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleReviewChanges = useCallback(async () => {
    const { isValid, errors: validationErrs } = validateSectionForm(
      selectedSectionId,
      formData,
      supportingDoc
    );

    if (!isValid) {
      setErrors(validationErrs);
      Alert.alert(
        "Required Information",
        "Please fill in the required amendment details and attach supporting proof."
      );
      return;
    }

    setErrors({});
    setIsSavingRecord(true);

    try {
      await persistAmendmentForReview(
        {
          isEditMode,
          amendmentId,
          sectionId: selectedSectionId,
          targetGstId,
          formData,
          supportingDoc,
        },
        { onSaved: setAmendmentId, onReviewData: setDbReviewData }
      );
      if (isEditMode) {
        setIsEditMode(false);
      }
      savedDraftStepRef.current = "REVIEW";
      savedDraftSectionIdRef.current = selectedSectionId;
      saveGstAmendmentDraft({
        formData: { gstin, selectedSectionId, ...formData, _sectionDocs: sectionDocs, amendmentId, dbReviewData: stripImageData(dbReviewData) },
        step: "REVIEW",
        updatedAt: new Date().toISOString().split("T")[0],
      });
      setCurrentStep("REVIEW");
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } catch (err) {
      logger.error("[useGstAmendmentWorkflow] Error saving/updating amendment record:", { error: err });
      Alert.alert(
        "Save Failed",
        getErrorMessage(err) || "Failed to save amendment record. Please try again."
      );
    } finally {
      setIsSavingRecord(false);
    }
  }, [amendmentId, dbReviewData, formData, gstin, isEditMode, saveGstAmendmentDraft, sectionDocs, selectedSectionId, supportingDoc, targetGstId]);

  const handleEditFromReview = useCallback(() => {
    setIsEditMode(true);
    setErrors({});
    setCurrentStep("EDIT");
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  const handleBackFromEdit = useCallback(() => {
    if (isEditMode) {
      setIsEditMode(false);
      setCurrentStep("REVIEW");
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else if (isFormDataDirty(currentStep, formData, sectionDocs)) {
      draftGuard.openDraftModal();
    } else {
      setCurrentStep("LANDING");
    }
  }, [currentStep, draftGuard, formData, isEditMode, sectionDocs]);

  const handleSubmitAmendment = useCallback(async () => {
    if (isSubmitting) return;

    if (!declared) {
      Alert.alert(
        "Declaration Required",
        "Please tick the declaration checkbox to authorise Finsolz to file your amendment."
      );
      return;
    }

    if (!supportingDoc || !supportingDoc.uri) {
      Alert.alert(
        "Supporting Proof Required",
        "Please attach a supporting proof document before submitting your amendment."
      );
      return;
    }

    // Live FileSystem accessibility check immediately before submission
    try {
      const isAccessible = await verifyFileAccessible(supportingDoc.uri);
      if (!isAccessible) {
        // Critical: Do NOT clear sectionDocs. Preserve the selected document so the user doesn't lose it.
        Alert.alert(
          "Document Unavailable",
          "The attached proof file is no longer accessible on this device. Please re-attach the document before submitting."
        );
        return;
      }
    } catch (fsErr) {
      logger.warn("[useGstAmendmentWorkflow] FileSystem check error, proceeding with cautious submission:", { error: fsErr });
    }

    setIsSubmitting(true);

    try {
      const result = await submitAmendmentService({
        selectedSectionId,
        targetGstId,
        formData,
        supportingDoc,
        selectedSection,
        registeredDetails,
        createApplication,
        addNotification,
        markSubmitted: draftGuard.markSubmitted,
        amendmentId,
      });

      savedDraftStepRef.current = null;
      savedDraftSectionIdRef.current = null;
      clearGstAmendmentDraft();

      const cleanMobile = customer?.mobile ? String(customer.mobile).replace(/\D/g, "") : "";
      if (cleanMobile) {
        removeDraftFromIndex(cleanMobile, "gst-amendment");
        AsyncStorage.removeItem(`@finsolz_draft_${cleanMobile}_gst-amendment`).catch((e) => {
          logger.debug("[useGstAmendmentWorkflow] Failed to remove draft key", { error: e });
        });
      }

      setSubmissionResult(result);
      setCurrentStep("SUCCESS");
    } catch (error) {
      logger.error("[useGstAmendmentWorkflow] Amendment Submission Error:", { error });
      Alert.alert(
        "Submission Failed",
        getErrorMessage(error) || "Failed to submit amendment. Please check your network connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [addNotification, amendmentId, clearGstAmendmentDraft, createApplication, customer, declared, draftGuard.markSubmitted, formData, isSubmitting, registeredDetails, selectedSection, selectedSectionId, supportingDoc, targetGstId]);

  return {
    router, scrollViewRef, currentStep, setCurrentStep, gstin, selectedSection,
    selectedSectionId, formData, supportingDoc, sectionDocs, setSectionDocs,
    handleDeleteDoc, declared, setDeclared, errors, isSubmitting, submissionResult,
    isProofsExpanded, setIsProofsExpanded, isEditMode, amendmentId, dbReviewData,
    isSavingRecord, pickerModal, registeredDetails, draftGuard, updateFormField,
    clearError, handleGstinChange, handleUploadSuccess, handleExplicitSaveDraft,
    handleBrowseFiles, handleScanFile, handleSelectSection, openPickerModal,
    closePickerModal, handleReviewChanges, handleEditFromReview, handleBackFromEdit,
    handleSubmitAmendment,
  };
}
