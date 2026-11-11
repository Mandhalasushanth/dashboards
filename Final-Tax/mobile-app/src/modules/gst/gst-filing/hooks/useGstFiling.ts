/**
 * Custom Hook: useGstFiling
 * Manages the multi-step GST Filing workflow, state synchronization,
 * REST API persistence, drafts, and step progression.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useUniversalDraftGuard } from "@/shared/hooks/useUniversalDraftGuard";
import { useApplicationStore } from "@/store/applicationStore";
import { gstApi } from "@/modules/gst/services/gstApi";
import { logger } from "@/core/logging/logger";
import { useGstFilingForm } from "@/modules/gst/gst-filing/hooks/useGstFilingForm";
import { useGstFilingRestore } from "@/modules/gst/gst-filing/hooks/useGstFilingRestore";
import {
  mapDtoToPeriodData,
  mapDtoToFilingDocuments,
  resolveTargetFilingId,
} from "@/modules/gst/gst-filing/hooks/gstFilingHelpers";
import {
  submitPeriodStep,
  submitDocumentsStep,
  submitReviewStep,
} from "@/modules/gst/gst-filing/hooks/gstFilingStepHandlers";

export function useGstFiling() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    appId?: string;
    step?: string;
    filingId?: string;
    id?: string;
  }>();

  const [currentStep, setCurrentStep] = useState(0);
  const [filingId, setFilingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdAppId, setCreatedAppId] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  const handleEditStep = useCallback((stepIndex: number) => {
    setIsEditMode(true);
    setCurrentStep(stepIndex);
  }, []);

  const {
    periodData,
    setPeriodData,
    periodErrors,
    setPeriodErrors,
    documents,
    setDocuments,
    validatePeriodStep,
    validateDocumentsStep,
    handleUpdateDocuments,
    requiredDocs,
    missingDocsCount,
    uploadedDocsCount,
  } = useGstFilingForm(createdAppId);

  // Store access
  const gstFilingDraft = useApplicationStore((state) => state.gstFilingDraft);
  const saveGstFilingDraft = useApplicationStore((state) => state.saveGstFilingDraft);
  const clearGstFilingDraft = useApplicationStore((state) => state.clearGstFilingDraft);

  // Universal Draft Guard Hook
  const {
    showDraftModal,
    openDraftModal,
    handleSaveAndExit,
    handleDiscardAndExit,
    handleCancel,
  } = useUniversalDraftGuard({
    isSubmitted: () => currentStep >= 3,
    isDirty: () =>
      currentStep < 3 &&
      Boolean(
        periodData.periodType ||
          periodData.financialYear ||
          periodData.filingPeriod ||
          periodData.filingMonth ||
          periodData.gstin ||
          periodData.filingType ||
          documents.some((d) => Boolean(d.fileUri)),
      ),
    onSaveDraft: () => {
      saveGstFilingDraft({
        id: "gst-filing-draft",
        stepIndex: currentStep,
        periodData,
        documents,
        createdFilingId: filingId || undefined,
        updatedAt: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    },
    onDiscardDraft: () => {
      clearGstFilingDraft();
    },
  });

  // Restore previous filing draft or route-passed filing/app details
  useGstFilingRestore({
    params,
    setFilingId,
    setCreatedAppId,
    setCurrentStep,
    setPeriodData,
    setDocuments,
  });

  const getTargetFilingId = useCallback((): string => {
    return resolveTargetFilingId([
      filingId,
      createdAppId,
      gstFilingDraft?.createdFilingId,
      params.appId,
      params.filingId || params.id,
    ]);
  }, [
    filingId,
    createdAppId,
    gstFilingDraft?.createdFilingId,
    params.appId,
    params.filingId,
    params.id,
  ]);

  const [isFetchingReview, setIsFetchingReview] = useState(false);
  const lastFetchedReviewIdRef = useRef<string | null>(null);

  // Synchronize state with backend when entering Review step
  const fetchFilingDetails = useCallback(
    async (idToFetch: string) => {
      if (!idToFetch) return;
      setIsFetchingReview(true);
      try {
        const dto = await gstApi.getFiling(idToFetch);
        if (dto) {
          setPeriodData((prev) => mapDtoToPeriodData(dto, prev));
          setDocuments((prev) => mapDtoToFilingDocuments(dto, prev));
        }
      } catch (err) {
        logger.debug("[useGstFiling] Non-blocking live fetch details sync note:", {
          error: err,
          idToFetch,
        });
      } finally {
        setIsFetchingReview(false);
      }
    },
    [setPeriodData, setDocuments],
  );

  // Automatically retrieve from database when entering Review step (currentStep === 2)
  useEffect(() => {
    if (currentStep === 2) {
      const activeId = getTargetFilingId();
      if (activeId && lastFetchedReviewIdRef.current === activeId) {
        return;
      }
      lastFetchedReviewIdRef.current = activeId || "fetched";
      fetchFilingDetails(activeId);
    } else {
      lastFetchedReviewIdRef.current = null;
    }
  }, [currentStep, fetchFilingDetails, getTargetFilingId]);

  const getScreenTitle = useCallback(() => {
    switch (currentStep) {
      case 0:
        return "GST Filing Period";
      case 1:
        return "Filing Documents";
      case 2:
        return "Filing Review & Computation";
      default:
        return "Application Status";
    }
  }, [currentStep]);

  const getButtonText = useCallback(() => {
    if (isEditMode && (currentStep === 0 || currentStep === 1)) {
      return "Update & Review";
    }
    switch (currentStep) {
      case 0:
        return periodData.filingNature === "Nil Return"
          ? "Continue to Review"
          : "Continue to Documents";
      case 1:
        return "Continue to Review";
      case 2:
        return "Proceed to Submit →";
      default:
        return "";
    }
  }, [currentStep, isEditMode, periodData.filingNature]);

  const handleBack = useCallback(() => {
    if (isEditMode) { setIsEditMode(false); setCurrentStep(2); return; }
    if (currentStep === 3) { router.back(); return; }
    if (currentStep === 2) {
      setCurrentStep(periodData.filingNature === "Nil Return" ? 0 : 1);
      return;
    }
    if (currentStep === 1) { setCurrentStep(0); return; }
    // currentStep === 0: exiting the filing flow — show modal if any data entered
    const hasData = Boolean(
      periodData.periodType || periodData.financialYear || periodData.filingPeriod ||
      periodData.filingMonth || periodData.gstin || periodData.filingType ||
      documents.some((d) => Boolean(d.fileUri)),
    );
    if (hasData) {
      openDraftModal();
    } else {
      router.back();
    }
  }, [currentStep, router, isEditMode, periodData, documents, openDraftModal]);

  const handleContinue = useCallback(async () => {
    switch (currentStep) {
      case 0: {
        if (!validatePeriodStep()) return;
        await submitPeriodStep({
          periodData,
          targetFilingId: getTargetFilingId(),
          isEditMode,
          setFilingId,
          setCurrentStep,
          setIsEditMode,
          setIsSubmitting,
        });
        break;
      }

      case 1: {
        if (!validateDocumentsStep()) return;
        await submitDocumentsStep({
          targetFilingId: getTargetFilingId(),
          periodData,
          documents,
          isEditMode,
          setFilingId,
          setDocuments,
          setCurrentStep,
          setIsEditMode,
          setIsSubmitting,
        });
        break;
      }

      case 2: {
        await submitReviewStep({
          missingDocsCount,
          filingId,
          periodData,
          documents,
          setCreatedAppId,
          clearGstFilingDraft,
          setCurrentStep,
          setIsSubmitting,
        });
        break;
      }

      default:
        break;
    }
  }, [
    currentStep,
    validatePeriodStep,
    validateDocumentsStep,
    periodData,
    filingId,
    documents,
    missingDocsCount,
    setDocuments,
    clearGstFilingDraft,
    getTargetFilingId,
    isEditMode,
  ]);

  return {
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
    openDraftModal,
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
    validateDocumentsStep,
    isEditMode,
    handleEditStep,
    isFetchingReview,
    fetchFilingDetails,
  };
}
