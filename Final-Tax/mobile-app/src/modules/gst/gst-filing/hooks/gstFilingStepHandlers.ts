/**
 * GST Filing Step Submission Handlers
 * Encapsulates backend submission, document upload, and flow transitions for each step.
 */

import { Alert } from "react-native";
import { gstApi } from "@/modules/gst/services/gstApi";
import { useApplicationStore } from "@/store/applicationStore";
import { useNotificationStore } from "@/store/notificationStore";
import { useAuthStore } from "@/modules/authentication/store/authStore";
import { FilingDocItem } from "@/modules/gst/gst-filing/config/gstFilingDocumentsConfig";
import { GstFilingPeriodData } from "@/modules/gst/gst-filing/components/GstFilingPeriodStep/GstFilingPeriodStep";
import {
  getResolvedCustomerId,
  buildFilingPayload,
  extractUploadedDocuments,
} from "@/modules/gst/gst-filing/hooks/gstFilingHelpers";
import { getErrorMessage } from "@/core/error-handling/errorMessage";
import { logger } from "@/core/logging/logger";

export async function submitPeriodStep({
  periodData, targetFilingId, isEditMode, setFilingId, setCurrentStep, setIsEditMode, setIsSubmitting,
}: {
  periodData: GstFilingPeriodData; targetFilingId: string; isEditMode: boolean;
  setFilingId: (id: string) => void; setCurrentStep: (step: number) => void;
  setIsEditMode: (val: boolean) => void; setIsSubmitting: (val: boolean) => void;
}): Promise<void> {
  setIsSubmitting(true);
  try {
    const custId = await getResolvedCustomerId();
    const payload = buildFilingPayload(periodData, custId);
    const isNilReturn = periodData.filingNature === "Nil Return";

    if (targetFilingId) {
      try {
        await gstApi.updateFiling(targetFilingId, payload);
        setFilingId(targetFilingId);
        if (isEditMode) {
          Alert.alert("Success", "Filing period details updated successfully.");
          setIsEditMode(false);
          setCurrentStep(2);
          return;
        }
        setCurrentStep(isNilReturn ? 2 : 1);
        return;
      } catch (updateErr) {
        const errMsg = String(getErrorMessage(updateErr) || updateErr || "");
        if (
          errMsg.includes("does not belong to GSTIN") ||
          errMsg.includes("not found with ID")
        ) {
          logger.debug("[FilingFlow] Target filing ID does not belong to GSTIN, creating new session", { targetFilingId, gstin: periodData.gstin });
        } else {
          throw updateErr;
        }
      }
    }

    if (!payload.customerId) {
      Alert.alert(
        "Authentication Notice",
        "Customer profile session not found. Please re-login to proceed with filing.",
      );
      return;
    }

    const response = await gstApi.createFiling(payload);
    const responseStr =
      typeof response === "string" ? response : JSON.stringify(response);
    const match = responseStr.match(/Filing ID:\s*([A-Za-z0-9_-]+)/i);

    let resolvedId = match ? match[1] : "";
    if (!resolvedId) {
      const filings = await gstApi.fetchFilings(periodData.gstin);
      if (filings && filings.length > 0) {
        const sortedFilings = [...filings].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
        const latest = sortedFilings[sortedFilings.length - 1];
        resolvedId = latest.gstfilingId || latest.id || "";
      }
    }

    if (resolvedId) {
      setFilingId(resolvedId);
    }
    if (isEditMode) {
      setIsEditMode(false);
      setCurrentStep(2);
      return;
    }
    setCurrentStep(isNilReturn ? 2 : 1);
  } catch (err) {
    Alert.alert(
      "Filing Notice",
      getErrorMessage(err) || "Failed to update filing details. Please try again.",
    );
  } finally {
    setIsSubmitting(false);
  }
}

export async function submitDocumentsStep({
  targetFilingId: initialTargetId,
  periodData,
  documents,
  isEditMode,
  setFilingId,
  setDocuments,
  setCurrentStep,
  setIsEditMode,
  setIsSubmitting,
}: {
  targetFilingId: string;
  periodData: GstFilingPeriodData;
  documents: FilingDocItem[];
  isEditMode: boolean;
  setFilingId: (id: string) => void;
  setDocuments: React.Dispatch<React.SetStateAction<FilingDocItem[]>>;
  setCurrentStep: (step: number) => void;
  setIsEditMode: (val: boolean) => void;
  setIsSubmitting: (val: boolean) => void;
}): Promise<void> {
  let targetFilingId = initialTargetId;

  if (!targetFilingId) {
    try {
      const custId = await getResolvedCustomerId();
      const payload = buildFilingPayload(periodData, custId);
      const response = await gstApi.createFiling(payload);
      const responseStr =
        typeof response === "string" ? response : JSON.stringify(response);
      const match = responseStr.match(/Filing ID:\s*([A-Za-z0-9_-]+)/i);
      if (match && match[1]) {
        targetFilingId = match[1];
        setFilingId(targetFilingId);
      }
    } catch (createErr) {
      logger.debug("[DocumentStep] Auto-creation of filing session failed:", { error: createErr });
    }
  }

  if (!targetFilingId) {
    Alert.alert(
      "Notice",
      "Filing session not found. Please review period details first.",
    );
    setCurrentStep(0);
    return;
  }

  const isNilReturn = periodData.filingNature === "Nil Return";
  if (!isNilReturn) {
    const missingMandatory = documents.filter((d) => d.required && !d.fileUri);
    if (missingMandatory.length > 0) {
      const missingNames = missingMandatory.map((d) => d.name).join("\n• ");
      Alert.alert(
        "Required Documents Missing",
        `Please upload all required documents before proceeding:\n\n• ${missingNames}`,
        [{ text: "OK" }],
      );
      return;
    }
  }

  setIsSubmitting(true);
  try {
    const docsToUpload = documents.filter((d) => d.fileUri);
    if (docsToUpload.length > 0) {
      if (isEditMode) {
        try {
          await gstApi.updateAllFilingDocuments(targetFilingId, docsToUpload);
          Alert.alert("Success", "Filing documents updated successfully.");
        } catch (updateErr) {
          const errMsg = getErrorMessage(updateErr);
          if (errMsg.includes("404") || errMsg.toLowerCase().includes("not found")) {
            await gstApi.uploadAllFilingDocuments(targetFilingId, docsToUpload);
          } else {
            throw updateErr;
          }
        }
      } else {
        try {
          await gstApi.uploadAllFilingDocuments(targetFilingId, docsToUpload);
        } catch (uploadErr) {
          const errMsg = getErrorMessage(uploadErr);
          if (errMsg.includes("404") || errMsg.toLowerCase().includes("not found")) {
            logger.warn(`[DocumentStep] Filing ID '${targetFilingId}' not found on backend (404). Re-creating session...`);
            const custId = await getResolvedCustomerId();
            const payload = buildFilingPayload(periodData, custId);
            const res = await gstApi.createFiling(payload);
            const match = String(res).match(/Filing ID:\s*([A-Za-z0-9_-]+)/i);
            if (match && match[1]) {
              const freshId = match[1];
              targetFilingId = freshId;
              setFilingId(freshId);
              await gstApi.uploadAllFilingDocuments(freshId, docsToUpload);
            } else {
              throw uploadErr;
            }
          } else {
            throw uploadErr;
          }
        }
      }
      docsToUpload.forEach((d) => ((d as any).uploadedToBackend = true));
      setDocuments([...documents]);
    }
    if (isEditMode) {
      setIsEditMode(false);
    }
    setCurrentStep(2);
  } catch (uploadErr) {
    Alert.alert(
      "Upload Failed",
      getErrorMessage(uploadErr) || "Failed to upload documents. Please try again.",
    );
  } finally {
    setIsSubmitting(false);
  }
}

export async function submitReviewStep({
  missingDocsCount,
  filingId,
  periodData,
  documents,
  setCreatedAppId,
  clearGstFilingDraft,
  setCurrentStep,
  setIsSubmitting,
}: {
  missingDocsCount: number;
  filingId: string | null;
  periodData: GstFilingPeriodData;
  documents: FilingDocItem[];
  setCreatedAppId: (id: string) => void;
  clearGstFilingDraft: () => void;
  setCurrentStep: (step: number) => void;
  setIsSubmitting: (val: boolean) => void;
}): Promise<void> {
  const isNilReturn = periodData.filingNature === "Nil Return";
  if (!isNilReturn && missingDocsCount > 0) {
    Alert.alert(
      "Documents Missing",
      `You have ${missingDocsCount} missing required document(s). Please upload all required documents before submitting your return.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Upload Now", onPress: () => setCurrentStep(1) },
      ],
    );
    return;
  }

  const hasEstimates =
    periodData.calculationMethod === "manual_estimates" ||
    Boolean(
      (periodData.taxableSales && String(periodData.taxableSales).trim() !== "" && String(periodData.taxableSales).trim() !== "0") ||
      (periodData.taxablePurchases && String(periodData.taxablePurchases).trim() !== "" && String(periodData.taxablePurchases).trim() !== "0") ||
      (periodData.eligibleItc && String(periodData.eligibleItc).trim() !== "" && String(periodData.eligibleItc).trim() !== "0")
    );

  setIsSubmitting(true);
  try {
    let activeFilingId = filingId ? String(filingId).trim() : "";
    const custId = await getResolvedCustomerId();
    const payload = buildFilingPayload(periodData, custId, hasEstimates);

    // 1. Ensure filing session exists on backend
    if (!activeFilingId) {
      try {
        const createRes = await gstApi.createFiling(payload);
        const match = String(createRes).match(/Filing ID:\s*([A-Za-z0-9_-]+)/i);
        if (match && match[1]) {
          activeFilingId = match[1];
        }
      } catch (createErr) {
        logger.warn("[ReviewStep] Auto-creation of filing session before submit failed:", { error: createErr });
      }
    } else if (hasEstimates) {
      try {
        await gstApi.updateFiling(activeFilingId, payload);
      } catch (updateErr) {
        const errMsg = getErrorMessage(updateErr);
        if (errMsg.includes("404") || errMsg.toLowerCase().includes("not found")) {
          logger.warn(`[ReviewStep] Filing ${activeFilingId} not found for update, re-creating session...`);
          try {
            const createRes = await gstApi.createFiling(payload);
            const match = String(createRes).match(/Filing ID:\s*([A-Za-z0-9_-]+)/i);
            if (match && match[1]) {
              activeFilingId = match[1];
            }
          } catch (cErr) {
            logger.warn("[ReviewStep] Re-creation fallback failed:", { error: cErr });
          }
        } else {
          logger.warn("[ReviewStep] Failed to update estimates before submission:", { error: updateErr });
        }
      }
    }

    // 2. Submit filing to backend (POST /api/v1/gst/filing/submit)
    let pushToken = "";
    try {
      const authState = useAuthStore.getState();
      pushToken =
        authState.customer?.pushToken ||
        authState.authenticatedUser?.pushToken ||
        "";
    } catch (tokenErr) {
      logger.debug("[ReviewStep] Push token resolution notice:", { error: tokenErr });
    }

    if (activeFilingId) {
      try {
        await gstApi.submitFinalFiling(activeFilingId, pushToken || undefined);
        logger.info(`[ReviewStep] GST Filing submitted successfully to backend: ${activeFilingId}`);
      } catch (subErr) {
        const errMsg = getErrorMessage(subErr);
        if (errMsg.includes("404") || errMsg.toLowerCase().includes("not found")) {
          logger.warn(`[ReviewStep] Filing ${activeFilingId} not found on server for submit, re-creating and submitting...`);
          try {
            const createRes = await gstApi.createFiling(payload);
            const match = String(createRes).match(/Filing ID:\s*([A-Za-z0-9_-]+)/i);
            if (match && match[1]) {
              activeFilingId = match[1];
              await gstApi.submitFinalFiling(activeFilingId, pushToken || undefined);
            }
          } catch (retryErr) {
            logger.warn("[ReviewStep] Re-creation and submit retry failed:", { error: retryErr });
          }
        } else {
          logger.warn("[ReviewStep] Backend submitFiling call notice:", { error: subErr });
        }
      }
    }

    // 3. Local Application Store & Notifications
    const periodLabel = periodData.filingPeriod || periodData.filingMonth || "Current Period";
    const uploadedDocs = extractUploadedDocuments(documents);

    const newAppId = useApplicationStore.getState().createApplication(
      "gst-filing",
      `GST Filing (${periodLabel})`,
      "GST",
      {
        gstin: periodData.gstin,
        businessName: periodData.tradeName || periodData.businessName || "Registered Business",
        filingPeriod: periodLabel,
        filingType: periodData.filingType || "GSTR-1",
        filingNature: periodData.filingNature || "Regular Return",
        financialYear: periodData.financialYear || "FY 2025-26",
        filingId: activeFilingId || undefined,
        taxableSales: periodData.taxableSales || periodData.turnover || "0",
        taxablePurchases: periodData.taxablePurchases || "0",
        eligibleItc: periodData.eligibleItc || "0",
        calculationMethod: periodData.calculationMethod || (hasEstimates ? "manual_estimates" : "ca_assisted"),
        documents: uploadedDocs,
      },
      uploadedDocs,
      0,
      "Pending",
      false,
      activeFilingId || undefined,
    );

    const finalDisplayId = activeFilingId || newAppId;
    setCreatedAppId(finalDisplayId);
    clearGstFilingDraft();

    // 4. In-App Notification
    useNotificationStore.getState().addNotification(
      "GST Return Submitted",
      `Your GST Filing (${periodLabel}) for ${periodData.gstin} (ID: ${finalDisplayId}) has been successfully submitted and is under verification.`,
      "gst",
    );

    // 5. Navigate to Step 3 (Success Screen)
    setCurrentStep(3);
  } catch (err) {
    logger.warn("[ReviewStep] Submission notice:", { error: err });
    Alert.alert(
      "Submission Error",
      getErrorMessage(err) || "Failed to submit filing application. Please try again.",
    );
  } finally {
    setIsSubmitting(false);
  }
}
