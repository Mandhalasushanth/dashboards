/**
 * API Service: GST Compliance
 * Handles multipart creation, updates, and retrieval of GST compliance requests.
 */

import { apiClient } from "@/core/api/apiClient";
import { getActiveBaseUrl } from "@/core/api/apiConfig";
import { tokenManager } from "@/core/authentication/tokenManager";
import { tokenRefreshManager } from "@/core/authentication/tokenRefreshManager";
import { getResolvedCustomerId } from "@/modules/gst/gst-filing/hooks/gstFilingHelpers";
import { appendFilePart } from "@/shared/utils/formDataFile";
import { logger } from "@/core/logging/logger";
import { ApiError } from "@/core/api/apiError";
import type { ComplianceFormData } from "@/modules/gst/validation/complianceSchema";

/**
 * Justified multipart upload timeout (45 seconds).
 * Standard JSON requests in Finsolz use 30 seconds (`apiClient.ts`). For GST Compliance,
 * payloads carry up to two 10 MiB attachments (up to 20 MiB total). On mobile uplinks
 * (3-5 Mbps), 10 MiB takes ~20-35 seconds. A 45-second timeout accommodates legitimate
 * uploads without hanging indefinitely on stalled connections.
 */
export const GST_COMPLIANCE_UPLOAD_TIMEOUT_MS = 45000;

/** Compliance form values; callers may attach the resolved customer id. */
type ComplianceSubmission = ComplianceFormData & { customerId?: string };

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function parseDateToISO(dateStr: string): string | null {
  if (!dateStr) return null;
  const parts = dateStr.trim().split(" ");
  if (parts.length === 3) {
    const d = parts[0].padStart(2, "0");
    const m = String(MONTHS.indexOf(parts[1]) + 1).padStart(2, "0");
    const y = parts[2];
    if (m !== "00") return `${y}-${m}-${d}`;
  }

  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split("T")[0];
  }
  return null;
}

const getMimeType = (filename?: string, fallback = "image/jpeg"): string => {
  if (!filename) return fallback;
  const lower = filename.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".xlsx")) return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  if (lower.endsWith(".xls")) return "application/vnd.ms-excel";
  if (lower.endsWith(".csv")) return "text/csv";
  return fallback;
};

export const gstComplianceApi = {
  createCompliance: async (data: ComplianceSubmission) => {
    const formData = new FormData();
    const custId = await getResolvedCustomerId();

    const dto = {
      customerId: custId || data.customerId || "",
      gstin: data.gstin ? data.gstin.trim() : "29AAAAA0000A1Z5",
      financialYear: data.financialYear || "2024-25",
      requestType:
        data.requestType === "Reconciliation Support"
          ? "RECONCILIATION_SUPPORT"
          : "NOTICE_RESPONSE",
      gstr2bNumber: data.gstr2bRef?.trim() ? data.gstr2bRef : "NOT_PROVIDED",
      noticeNumber: data.noticeNumber || "",
      noticeIssueDate: parseDateToISO(data.noticeIssueDate),
      replyDueDate: parseDateToISO(data.replyDueDate),
      message:
        data.requestType === "Reconciliation Support"
          ? data.reconciliationRemarks || ""
          : data.noticeRemarks || "",
    };

    formData.append("data", JSON.stringify(dto));

    if (data.purchaseDoc?.uri) {
      appendFilePart(formData, "reconciliationFile1", {
        uri: data.purchaseDoc.uri,
        name: data.purchaseDoc.name || "recon1.jpg",
        type: data.purchaseDoc.mimeType || getMimeType(data.purchaseDoc.name),
      });
    }

    if (data.salesDoc?.uri) {
      appendFilePart(formData, "reconciliationFile2", {
        uri: data.salesDoc.uri,
        name: data.salesDoc.name || "recon2.jpg",
        type: data.salesDoc.mimeType || getMimeType(data.salesDoc.name),
      });
    }

    if (data.noticeDoc?.uri) {
      appendFilePart(formData, "noticeFile", {
        uri: data.noticeDoc.uri,
        name: data.noticeDoc.name || "notice.jpg",
        type: data.noticeDoc.mimeType || getMimeType(data.noticeDoc.name),
      });
    }

    const baseUrl = apiClient.getBaseUrl() || (await getActiveBaseUrl());
    if (!baseUrl) {
      throw new Error(
        "Backend URL is not configured. Set the API URL before submitting GST compliance data.",
      );
    }
    const url = `${baseUrl.replace(/\/$/, "")}/api/v1/gst/compliance/create`;

    let token = await tokenManager.getAccessToken();
    if (!token || !(await tokenManager.hasValidToken())) {
      const refreshed = await tokenRefreshManager.attemptRefresh();
      if (refreshed) {
        token = await tokenManager.getAccessToken();
      }
    }

    return new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", url);
      xhr.timeout = GST_COMPLIANCE_UPLOAD_TIMEOUT_MS;

      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }

      xhr.ontimeout = () => {
        reject(
          new ApiError(
            "Compliance upload timed out. Please check your network connection and try again.",
            408,
            "TIMEOUT",
          ),
        );
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const parsed = JSON.parse(xhr.responseText);
            resolve(parsed);
          } catch (parseErr) {
            logger.debug("[gstComplianceApi] Non-JSON create response", { error: parseErr });
            resolve(xhr.responseText);
          }
        } else {
          let errText = xhr.responseText;
          let errorCode = "API_ERROR";
          let errorDetails: Record<string, string[]> | undefined = undefined;
          try {
            const parsed = JSON.parse(xhr.responseText);
            if (parsed.message) errText = parsed.message;
            if (parsed.code) errorCode = parsed.code;
            if (parsed.errors) errorDetails = parsed.errors;
          } catch (parseErr) {
            logger.debug("[gstComplianceApi] Non-JSON error response from createCompliance", { status: xhr.status, error: parseErr });
          }
          reject(new ApiError(errText || `Server responded with ${xhr.status}`, xhr.status, errorCode, errorDetails));
        }
      };

      xhr.onerror = () => {
        reject(new ApiError("Network connection error during compliance submission.", 0, "NETWORK_ERROR"));
      };

      xhr.send(formData);
    });
  },

  updateCompliance: async (
    gstin: string,
    id: string,
    data: ComplianceSubmission,
    modifiedDocKeys?: string[],
  ) => {
    const formData = new FormData();
    const custId = await getResolvedCustomerId();

    const dto = {
      customerId: custId || data.customerId || "",
      gstin: gstin.trim(),
      financialYear: data.financialYear || "2024-25",
      requestType:
        data.requestType === "Reconciliation Support"
          ? "RECONCILIATION_SUPPORT"
          : "NOTICE_RESPONSE",
      gstr2bNumber: data.gstr2bRef?.trim() ? data.gstr2bRef : "NOT_PROVIDED",
      noticeNumber: data.noticeNumber || "",
      noticeIssueDate: parseDateToISO(data.noticeIssueDate),
      replyDueDate: parseDateToISO(data.replyDueDate),
      message:
        data.requestType === "Reconciliation Support"
          ? data.reconciliationRemarks || ""
          : data.noticeRemarks || "",
    };

    formData.append("data", JSON.stringify(dto));

    // Only upload documents if modifiedDocKeys is not provided (backward compatibility)
    // or if the specific document is explicitly marked as modified.
    const shouldUploadPurchase =
      Boolean(data.purchaseDoc?.uri) &&
      (!modifiedDocKeys || modifiedDocKeys.includes("purchaseDoc"));
    if (shouldUploadPurchase && data.purchaseDoc) {
      appendFilePart(formData, "reconciliationFile1", {
        uri: data.purchaseDoc.uri,
        name: data.purchaseDoc.name || "recon1.jpg",
        type: data.purchaseDoc.mimeType || getMimeType(data.purchaseDoc.name),
      });
    }

    const shouldUploadSales =
      Boolean(data.salesDoc?.uri) &&
      (!modifiedDocKeys || modifiedDocKeys.includes("salesDoc"));
    if (shouldUploadSales && data.salesDoc) {
      appendFilePart(formData, "reconciliationFile2", {
        uri: data.salesDoc.uri,
        name: data.salesDoc.name || "recon2.jpg",
        type: data.salesDoc.mimeType || getMimeType(data.salesDoc.name),
      });
    }

    const shouldUploadNotice =
      Boolean(data.noticeDoc?.uri) &&
      (!modifiedDocKeys || modifiedDocKeys.includes("noticeDoc"));
    if (shouldUploadNotice && data.noticeDoc) {
      appendFilePart(formData, "noticeFile", {
        uri: data.noticeDoc.uri,
        name: data.noticeDoc.name || "notice.jpg",
        type: data.noticeDoc.mimeType || getMimeType(data.noticeDoc.name),
      });
    }

    const baseUrl = apiClient.getBaseUrl() || (await getActiveBaseUrl());
    const url = `${baseUrl.replace(/\/$/, "")}/api/v1/gst/compliance/${encodeURIComponent(gstin)}/${encodeURIComponent(id)}`;

    let token = await tokenManager.getAccessToken();
    return new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url);
      xhr.timeout = GST_COMPLIANCE_UPLOAD_TIMEOUT_MS;
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      xhr.ontimeout = () => {
        reject(
          new ApiError(
            "Compliance update timed out. Please check your network connection and try again.",
            408,
            "TIMEOUT",
          ),
        );
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const parsed = JSON.parse(xhr.responseText);
            resolve(parsed);
          } catch (parseErr) {
            logger.debug("[gstComplianceApi] Non-JSON update response", { error: parseErr });
            resolve(xhr.responseText);
          }
        } else {
          let errText = xhr.responseText;
          let errorCode = "API_ERROR";
          let errorDetails: Record<string, string[]> | undefined = undefined;
          try {
            const parsed = JSON.parse(xhr.responseText);
            if (parsed.message) errText = parsed.message;
            if (parsed.code) errorCode = parsed.code;
            if (parsed.errors) errorDetails = parsed.errors;
          } catch (parseErr) {
            logger.debug("[gstComplianceApi] Non-JSON error response from updateCompliance", { status: xhr.status, error: parseErr });
          }
          reject(new ApiError(errText || `Server responded with ${xhr.status}`, xhr.status, errorCode, errorDetails));
        }
      };
      xhr.onerror = () => reject(new ApiError("Network connection error during compliance update.", 0, "NETWORK_ERROR"));
      xhr.send(formData);
    });
  },

  getCompliance: async (gstin: string, id: string) => {
    return apiClient.get<any>(
      `/api/v1/gst/compliance/${encodeURIComponent(gstin)}/${encodeURIComponent(id)}`,
    );
  },

  submitFinalCompliance: async (complianceId: string, pushToken?: string) => {
    const token = await tokenManager.getAccessToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const cleanId = String(complianceId || "").trim();
    const params: Record<string, string> = { complianceId: cleanId };
    if (pushToken) params.pushToken = pushToken;
    return apiClient.post<string>("/api/v1/gst/compliance/submit", undefined, { headers, params });
  },
};
