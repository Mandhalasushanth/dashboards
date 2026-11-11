import { apiClient } from "../../../core/api/apiClient";
import { getActiveBaseUrl } from "../../../core/api/apiConfig";
import { tokenManager } from "../../../core/authentication/tokenManager";
import { tokenRefreshManager } from "../../../core/authentication/tokenRefreshManager";
import { getResolvedCustomerId } from "@/modules/gst/gst-filing/hooks/gstFilingHelpers";
import { logger } from "../../../core/logging/logger";
import type { CancellationFormData } from "../gst-cancellation/types/gstCancellationTypes";
import { appendFilePart } from "@/shared/utils/formDataFile";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
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

const getMimeType = (filename?: string, fallback = "application/pdf"): string => {
  if (!filename) return fallback;
  const lower = filename.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  return fallback;
};

export class GstCancellationError extends Error {
  constructor(message: string, public readonly statusCode?: number) {
    super(message);
    this.name = "GstCancellationError";
  }
}

export const gstCancellationApi = {
  createCancellation: async (data: CancellationFormData): Promise<any> => {
    const formData = new FormData();
    const custId = await getResolvedCustomerId();

    const dto = {
      customerId: custId || (data as any).customerId || "",
      gstin: data.gstin ? data.gstin.trim() : "29AAAAA0000A1Z5",
      reasonForCancellation:
        data.reason === "Other Valid Reason" ? data.otherReason : data.reason,
      dateCancellationIsSought: parseDateToISO(data.cancellationDate),
      closingStockAndInputTaxReversal: data.closingStock || "0",
      pendingDuesLiabilities: data.pendingLiabilities || "Nil",
      lastGstr3bFiledArnPeriod: data.lastGstr3b || "",
    };

    formData.append("data", JSON.stringify(dto));

    if (data.supportingDoc?.uri) {
      appendFilePart(formData, "supportingProofDocument", {
        uri: data.supportingDoc.uri,
        name: data.supportingDoc.name || "supporting_proof.pdf",
        type: data.supportingDoc.mimeType || getMimeType(data.supportingDoc.name),
      });
    }

    const baseUrl = apiClient.getBaseUrl() || (await getActiveBaseUrl());
    if (!baseUrl) {
      throw new GstCancellationError(
        "Backend URL is not configured. Set the API URL before submitting GST cancellation data."
      );
    }
    const url = `${baseUrl.replace(/\/$/, "")}/api/v1/gst/cancellation/register`;

    let token = await tokenManager.getAccessToken();
    if (!token || !(await tokenManager.hasValidToken())) {
      const refreshed = await tokenRefreshManager.attemptRefresh();
      if (refreshed) {
        token = await tokenManager.getAccessToken();
      }
    }

    return new Promise<any>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", url);

      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const parsed = JSON.parse(xhr.responseText);
            resolve(parsed);
          } catch (parseErr) {
            logger.debug("[gstCancellationApi] Non-JSON success response", { error: parseErr });
            resolve(xhr.responseText);
          }
        } else {
          let errText = xhr.responseText;
          try {
            const parsed = JSON.parse(xhr.responseText);
            errText = parsed.message || parsed.error || xhr.responseText;
          } catch (parseErr) {
            logger.debug("[gstCancellationApi] Non-JSON error response from server", { status: xhr.status, error: parseErr });
          }
          reject(
            new GstCancellationError(
              errText || `Cancellation submission failed (${xhr.status})`,
              xhr.status
            )
          );
        }
      };

      xhr.onerror = () => {
        reject(new GstCancellationError("Network error during GST Cancellation upload"));
      };

      xhr.send(formData);
    });
  },

  updateCancellation: async (
    _cancellationId: string,
    data: CancellationFormData
  ): Promise<any> => {
    // Backend registers and updates (upserts) cancellation details via POST /api/v1/gst/cancellation/register
    return gstCancellationApi.createCancellation(data);
  },

  getCancellation: async (cancellationId: string): Promise<any> => {
    const baseUrl = apiClient.getBaseUrl() || (await getActiveBaseUrl());
    if (!baseUrl) {
      throw new GstCancellationError("Backend URL is not configured.");
    }
    const url = `${baseUrl.replace(/\/$/, "")}/api/v1/gst/cancellation/${cancellationId}`;

    let token = await tokenManager.getAccessToken();
    if (!token || !(await tokenManager.hasValidToken())) {
      const refreshed = await tokenRefreshManager.attemptRefresh();
      if (refreshed) {
        token = await tokenManager.getAccessToken();
      }
    }

    const res = await fetch(url, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      const err = await res.text();
      throw new GstCancellationError(
        `Failed to fetch cancellation details: ${err}`,
        res.status
      );
    }

    return await res.json();
  },
};

export default gstCancellationApi;
