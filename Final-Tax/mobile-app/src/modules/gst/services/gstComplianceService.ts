/**
 * Service: GST Compliance
 * Manages compliance request persistence, local application store sync, and notifications.
 */

import { useApplicationStore } from "@/store/applicationStore";
import { useNotificationStore } from "@/store/notificationStore";
import { useAuthStore } from "@/modules/authentication/store/authStore";
import { ComplianceFormData } from "@/modules/gst/validation/complianceSchema";
import {
  generateComplianceRefId,
  getTodayFormatted,
} from "@/modules/gst/utils/gstValidation";
import { gstComplianceApi } from "@/modules/gst/services/gstComplianceApi";
import { getErrorMessage } from "@/core/error-handling/errorMessage";
import { logger } from "@/core/logging/logger";

export interface StructuredCompliancePayload {
  service: "GST_COMPLIANCE";
  requestType: "RECONCILIATION_SUPPORT" | "NOTICE_RESPONSE";
  financialYear: string;
  gstin: string;
  documents: {
    category: string;
    name: string;
    uri: string;
    sizeFormatted: string;
  }[];
  noticeNumber?: string;
  noticeIssueDate?: string;
  replyDueDate?: string;
  gstr2bRef?: string;
  remarks?: string;
  submittedAt: string;
  referenceId: string;
}

export interface SubmissionResult {
  success: boolean;
  referenceId: string;
  submittedAt: string;
  estimatedResponse: string;
  error?: string;
}

/**
 * Transforms form state into structured production payload
 */
export function buildCompliancePayload(
  data: ComplianceFormData,
  refId: string,
): StructuredCompliancePayload {
  const isRecon = data.requestType === "Reconciliation Support";
  const docs: StructuredCompliancePayload["documents"] = [];

  if (isRecon) {
    if (data.purchaseDoc) {
      docs.push({
        category: "Purchase Register",
        name: data.purchaseDoc.name,
        uri: data.purchaseDoc.uri,
        sizeFormatted: data.purchaseDoc.sizeFormatted,
      });
    }
    if (data.salesDoc) {
      docs.push({
        category: "Sales Register",
        name: data.salesDoc.name,
        uri: data.salesDoc.uri,
        sizeFormatted: data.salesDoc.sizeFormatted,
      });
    }
  } else {
    if (data.noticeDoc) {
      docs.push({
        category: "Notice Copy",
        name: data.noticeDoc.name,
        uri: data.noticeDoc.uri,
        sizeFormatted: data.noticeDoc.sizeFormatted,
      });
    }
  }

  return {
    service: "GST_COMPLIANCE",
    requestType: isRecon ? "RECONCILIATION_SUPPORT" : "NOTICE_RESPONSE",
    financialYear: data.financialYear,
    gstin: data.gstin,
    documents: docs,
    noticeNumber: !isRecon ? data.noticeNumber : undefined,
    noticeIssueDate: !isRecon ? data.noticeIssueDate : undefined,
    replyDueDate: !isRecon ? data.replyDueDate : undefined,
    gstr2bRef: isRecon && data.gstr2bRef ? data.gstr2bRef : undefined,
    remarks: isRecon ? data.reconciliationRemarks : data.noticeRemarks,
    submittedAt: getTodayFormatted(),
    referenceId: refId,
  };
}

/**
 * Submits the compliance request, records application & notification in store
 */
export async function submitComplianceRequest(
  data: ComplianceFormData,
  existingComplianceId?: string | null,
): Promise<SubmissionResult> {
  const referenceId = generateComplianceRefId();
  const submittedAt = getTodayFormatted();
  const estimatedResponse = "Within 24 Hours";

  try {
    const payload = buildCompliancePayload(data, referenceId);
    let resolvedId = existingComplianceId ? String(existingComplianceId).trim() : null;

    // 1. Call Spring Boot backend API to store in database if not already saved
    if (!resolvedId) {
      try {
        const backendResponse: any = await gstComplianceApi.createCompliance(data);
        logger.debug("[GST] Compliance API Response received", { hasResponse: !!backendResponse });

        let parsedId = null;
        try {
          const parsed = typeof backendResponse === "string" ? JSON.parse(backendResponse) : backendResponse;
          parsedId = parsed?.complianceId;
        } catch (parseErr) {
          logger.debug("[GST] JSON parse fallback for complianceId", { error: parseErr });
          const match = String(backendResponse).match(/Compliance ID:\s*([A-Za-z0-9_-]+)/i);
          parsedId = match ? match[1] : null;
        }
        resolvedId = parsedId || null;
      } catch (createErr) {
        logger.warn("[GST] Error creating compliance record before submit:", { error: createErr });
      }
    }

    // 2. Resolve push token
    let pushToken = "";
    try {
      const authState = useAuthStore.getState();
      pushToken =
        authState.customer?.pushToken ||
        authState.authenticatedUser?.pushToken ||
        "";
    } catch (tokenErr) {
      logger.debug("[GST] Push token resolution notice:", { error: tokenErr });
    }

    // 3. Submit final compliance to backend (POST /api/v1/gst/compliance/submit)
    if (resolvedId) {
      try {
        await gstComplianceApi.submitFinalCompliance(resolvedId, pushToken || undefined);
        logger.info(`[GST] Compliance submitted successfully to backend: ${resolvedId}`);
      } catch (subErr) {
        const errMsg = getErrorMessage(subErr);
        if (errMsg.includes("404") || errMsg.toLowerCase().includes("not found")) {
          logger.warn(`[GST] Compliance ID '${resolvedId}' not found on backend (404). Re-creating and retrying submit...`);
          try {
            const createRes: any = await gstComplianceApi.createCompliance(data);
            const parsed = typeof createRes === "string" ? JSON.parse(createRes) : createRes;
            const freshId = parsed?.complianceId || (String(createRes).match(/Compliance ID:\s*([A-Za-z0-9_-]+)/i)?.[1]);
            if (freshId) {
              resolvedId = freshId;
              await gstComplianceApi.submitFinalCompliance(freshId, pushToken || undefined);
            }
          } catch (retryErr) {
            logger.warn("[GST] Re-creation and submit retry failed:", { error: retryErr });
          }
        } else {
          logger.warn("[GST] Backend submitCompliance call notice:", { error: subErr });
        }
      }
    }

    const finalDisplayId = resolvedId || referenceId;

    const mappedDocs = payload.documents.map((d) => ({
      name: d.name,
      status: "Uploaded" as const,
      fileUri: d.uri,
      fileName: d.name,
      fileSize: d.sizeFormatted,
      category: d.category,
      uploadedAt: payload.submittedAt,
    }));

    // 4. Save to centralized application store
    useApplicationStore.getState().createApplication(
      "gst-compliance",
      `GST Compliance - ${data.requestType}`,
      "GST",
      {
        service: payload.service,
        requestType: data.requestType,
        financialYear: payload.financialYear,
        gstin: payload.gstin,
        referenceId: finalDisplayId,
        complianceId: resolvedId || undefined,
        submittedAt: payload.submittedAt,
        estimatedResponse,
        purchaseDoc: data.purchaseDoc || undefined,
        salesDoc: data.salesDoc || undefined,
        noticeDoc: data.noticeDoc || undefined,
        documents: mappedDocs,
        ...(payload.noticeNumber ? { noticeNumber: payload.noticeNumber } : {}),
        ...(payload.noticeIssueDate
          ? { noticeIssueDate: payload.noticeIssueDate }
          : {}),
        ...(payload.replyDueDate ? { replyDueDate: payload.replyDueDate } : {}),
        ...(payload.gstr2bRef ? { gstr2bRef: payload.gstr2bRef } : {}),
        ...(payload.remarks ? { remarks: payload.remarks } : {}),
      },
      mappedDocs,
      0,
      "Pending",
      false,
      finalDisplayId,
    );

    // 5. Add in-app notification
    useNotificationStore
      .getState()
      .addNotification(
        "GST Compliance Request Submitted",
        `Your request (${data.requestType}) for ${data.gstin} (ID: ${finalDisplayId}) has been submitted and is under verification.`,
        "gst",
      );

    return {
      success: true,
      referenceId: finalDisplayId,
      submittedAt,
      estimatedResponse,
    };
  } catch (err) {
    return {
      success: false,
      referenceId: "",
      submittedAt: "",
      estimatedResponse: "",
      error: getErrorMessage(err) || "Failed to submit request. Please try again.",
    };
  }
}
