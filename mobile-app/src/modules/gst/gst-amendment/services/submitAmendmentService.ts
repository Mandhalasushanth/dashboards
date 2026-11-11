import { gstAmendmentApi } from "@/modules/gst/services/gstAmendmentApi";
import { useAuthStore } from "@/modules/authentication/store/authStore";
import { getErrorMessage } from "@/core/error-handling/errorMessage";
import { logger } from "@/core/logging/logger";
import {
  AmendmentSectionConfig,
  AmendmentFormData,
  RegisteredDetails,
  SupportingDoc,
  SubmissionResult,
} from "../types/gstAmendmentTypes";
import {
  generateArn,
  buildComparisonSummaries,
  resolveEffectiveBusinessName,
} from "../utils/gstAmendmentHelpers";

/** Metadata stored on the tracked "GST Amendment" application. */
const buildAmendmentApplicationDetails = ({
  targetGstId,
  generatedArn,
  selectedSection,
  isCore,
  registeredDetails,
  dateStr,
  comparison,
  supportingDoc,
  amendmentId,
  effectiveBusinessName,
}: {
  targetGstId: string;
  generatedArn: string;
  selectedSection: AmendmentSectionConfig;
  isCore: boolean;
  registeredDetails: RegisteredDetails;
  dateStr: string;
  comparison: ReturnType<typeof buildComparisonSummaries>;
  supportingDoc: SupportingDoc;
  amendmentId?: number | string | null;
  effectiveBusinessName: string;
}) => {
  const { currentValSummary, requestedValSummary, currentValDict, requestedValDict } = comparison;
  return {
    gstin: targetGstId,
    arn: generatedArn,
    section: selectedSection.title,
    amendmentCategory: isCore ? "Core (officer approval)" : "Non-core (auto-approved)",
    isCore: isCore ? "true" : "false",
    applicantName: effectiveBusinessName,
    businessName: effectiveBusinessName,
    submissionDate: dateStr,
    currentValue: currentValSummary,
    requestedValue: requestedValSummary,
    currentValues: currentValDict ? JSON.stringify(currentValDict) : "",
    requestedValues: requestedValDict ? JSON.stringify(requestedValDict) : "",
    supportingDocName: supportingDoc.name,
    ...(amendmentId ? { amendmentId: String(amendmentId) } : {}),
  };
};

export async function submitAmendmentService(params: {
  selectedSectionId: string;
  targetGstId: string;
  formData: AmendmentFormData;
  supportingDoc: SupportingDoc;
  selectedSection: AmendmentSectionConfig;
  registeredDetails: RegisteredDetails;
  createApplication: Function;
  addNotification: Function;
  markSubmitted: Function;
  amendmentId?: number | string | null;
}): Promise<SubmissionResult> {
  const {
    selectedSectionId,
    targetGstId,
    formData,
    supportingDoc,
    selectedSection,
    registeredDetails,
    createApplication,
    addNotification,
    markSubmitted,
    amendmentId,
  } = params;

  let activeAmendmentId: number | string | null = amendmentId ?? null;

  // 1. If amendment was not previously persisted to database, create it now
  if (!activeAmendmentId) {
    logger.debug("[submitAmendmentService] Persisting new amendment record before submit", { selectedSectionId, targetGstId });
    const savedRecord = await gstAmendmentApi.saveAmendmentRecord(
      selectedSectionId,
      targetGstId,
      formData,
      supportingDoc
    );
    if (!savedRecord?.id) {
      throw new Error("Failed to persist amendment record. No amendment ID returned by server.");
    }
    activeAmendmentId = savedRecord.id;
  }

  // 2. Resolve push token from auth store
  let pushToken = "";
  try {
    const authState = useAuthStore.getState();
    pushToken =
      (authState.customer as any)?.pushToken ||
      authState.authenticatedUser?.pushToken ||
      "";
  } catch (tokenErr) {
    logger.debug("[submitAmendmentService] Push token resolution notice:", { error: tokenErr });
  }

  // 3. Call backend final submit endpoint for this amendment section
  try {
    logger.info("[submitAmendmentService] Submitting final amendment to backend", {
      section: selectedSectionId,
      targetGstId,
      id: activeAmendmentId,
      hasPushToken: Boolean(pushToken),
    });

    await gstAmendmentApi.submitFinalAmendmentRecord(
      selectedSectionId,
      targetGstId,
      activeAmendmentId,
      pushToken || undefined
    );
    logger.info(`[submitAmendmentService] Amendment (${selectedSectionId}) submitted successfully to backend.`);
  } catch (subErr) {
    const errMsg = getErrorMessage(subErr) || "";
    if (errMsg.includes("404") || errMsg.toLowerCase().includes("not found")) {
      logger.warn(`[submitAmendmentService] Stale amendment record not found on backend (404). Re-creating and retrying submit...`);
      const freshRecord = await gstAmendmentApi.saveAmendmentRecord(
        selectedSectionId,
        targetGstId,
        formData,
        supportingDoc
      );
      if (!freshRecord?.id) {
        throw new Error("Failed to re-create amendment record on server.");
      }
      activeAmendmentId = freshRecord.id;
      await gstAmendmentApi.submitFinalAmendmentRecord(
        selectedSectionId,
        targetGstId,
        activeAmendmentId,
        pushToken || undefined
      );
      logger.info(`[submitAmendmentService] Re-created amendment (${selectedSectionId}) and submitted successfully.`);
    } else {
      logger.error("[submitAmendmentService] Backend submit call failed:", { error: subErr });
      throw subErr;
    }
  }

  markSubmitted();

  const isCore = selectedSection.type === "core";
  const finalAppId = String(activeAmendmentId);
  const generatedArn = generateArn();
  const dateStr = new Date().toISOString();
  const effectiveBusinessName = resolveEffectiveBusinessName(
    selectedSectionId,
    formData,
    registeredDetails
  );

  const appId = createApplication(
    "gst-amendment",
    `GST Amendment - ${selectedSection.title}`,
    "GST",
    buildAmendmentApplicationDetails({
      targetGstId,
      generatedArn,
      selectedSection,
      isCore,
      registeredDetails,
      dateStr,
      comparison: buildComparisonSummaries(selectedSectionId, registeredDetails, formData),
      supportingDoc,
      amendmentId: activeAmendmentId,
      effectiveBusinessName,
    }),
    supportingDoc
      ? [{
          name: supportingDoc.name,
          status: "Uploaded" as const,
          fileUri: supportingDoc.uri,
          fileName: supportingDoc.name,
          fileSize: supportingDoc.size,
          category: selectedSection.title || "Supporting Proof",
        }]
      : [],
    999,
    "Pending",
    false,
    finalAppId
  );

  addNotification(
    "GST Amendment Filed",
    `Your GST Amendment request for ${selectedSection.title} (ID: ${finalAppId}, ARN: ${generatedArn}) has been submitted successfully.`,
    "gst"
  );

  return {
    arn: generatedArn,
    date: dateStr,
    appId: finalAppId || appId,
    sectionTitle: selectedSection.title,
    isCore,
    gstin: targetGstId,
    estCompletion: isCore ? "15 Working Days" : "Immediate / 1 Working Day",
    businessName: effectiveBusinessName,
  };
}
