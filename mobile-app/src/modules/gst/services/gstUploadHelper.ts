import { apiClient, SERVER_IP, SERVER_PORT } from "../../../core/api/apiClient";
import { getActiveBaseUrl } from "../../../core/api/apiConfig";
import { tokenManager } from "../../../core/authentication/tokenManager";
import { logger } from "../../../core/logging/logger";

export interface UploadDocumentItem {
  id?: string;
  name?: string;
  fileUri?: string | null;
  fileName?: string | null;
  subtitle?: string | null;
  mimeType?: string | null;
}

export class GstApiUploadError extends Error {
  constructor(message: string, public readonly statusCode?: number) {
    super(message);
    this.name = "GstApiUploadError";
  }
}

/**
 * Normalizes document file URI across iOS and Android file picking APIs.
 */
export function normalizeDocumentUri(uri: string): string {
  if (!uri) return "";
  let clean = uri.trim();
  // Ensure file:// scheme exists on iOS if path starts with /
  if (clean.startsWith("/") && !clean.startsWith("file://") && !clean.startsWith("content://")) {
    return `file://${clean}`;
  }
  return clean;
}

/**
 * Resolves appropriate MIME type based on filename extension or explicit MIME.
 */
export function resolveDocumentMimeType(filename?: string | null, fallback = "application/pdf"): string {
  if (!filename) return fallback;
  const lower = filename.trim().toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".xlsx")) return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  if (lower.endsWith(".xls")) return "application/vnd.ms-excel";
  if (lower.endsWith(".csv")) return "text/csv";
  if (lower.endsWith(".json")) return "application/json";
  return fallback;
}

/**
 * Execute a multipart form-data upload via XMLHttpRequest (bulletproof in React Native).
 */
export async function executeXhrUpload(
  url: string,
  method: "POST" | "PUT",
  formData: FormData,
  onFallback?: () => Promise<string>
): Promise<string> {
  const token = await tokenManager.getAccessToken();

  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);

    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }

    xhr.onload = async () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.responseText);
      } else if ((xhr.status === 404 || xhr.status === 500 || xhr.status === 400) && onFallback) {
        try {
          const fallbackResult = await onFallback();
          resolve(fallbackResult);
        } catch (fbErr) {
          reject(fbErr);
        }
      } else {
        let errText = xhr.responseText;
        try {
          const parsed = JSON.parse(xhr.responseText);
          if (parsed.message) {
            errText = parsed.message;
          }
        } catch (parseErr) {
          logger.debug("[gstUploadHelper] Non-JSON error response during XHR upload", { status: xhr.status, error: parseErr });
        }
        reject(
          new GstApiUploadError(
            `Upload failed with status ${xhr.status}: ${errText}`,
            xhr.status
          )
        );
      }
    };

    xhr.onerror = () => {
      reject(new GstApiUploadError(`Network error during XHR ${method} upload to ${url}`));
    };

    xhr.send(formData);
  });
}

/**
 * Get active base URL with default fallback.
 * Checks apiClient.getBaseUrl() first, then AsyncStorage / centralized environment.
 */
export function resolveApiBaseUrl(): string {
  const clientBase = apiClient.getBaseUrl();
  if (clientBase && clientBase.trim()) {
    return clientBase.replace(/\/$/, "");
  }
  return `http://${SERVER_IP}:${SERVER_PORT}`;
}

/**
 * Asynchronously resolves active base URL ensuring custom storage config is fully loaded.
 */
export async function resolveAsyncApiBaseUrl(): Promise<string> {
  try {
    const loaded = await apiClient.ensureBaseUrlLoaded();
    if (loaded && loaded.trim()) {
      return loaded.replace(/\/$/, "");
    }
  } catch (err) {
    logger.debug("[gstUploadHelper] Failed to ensureBaseUrlLoaded, falling back to getActiveBaseUrl", { error: err });
  }
  try {
    const active = await getActiveBaseUrl();
    if (active && active.trim()) {
      return active.replace(/\/$/, "");
    }
  } catch (err) {
    logger.debug("[gstUploadHelper] Failed getActiveBaseUrl", { error: err });
  }
  return resolveApiBaseUrl();
}

/**
 * Map document key to registration backend field name.
 */
export function mapRegistrationDocField(key: string): string {
  const k = key.toLowerCase();
  if (k.includes("pan")) return "panCard";
  if (k.includes("aadhaar") || k.includes("adhar")) return "aadhaarCard";
  if (k.includes("business")) return "businessRegistrationProof";
  if (k.includes("address") || k.includes("place")) return "principalPlaceAddressProof";
  if (k.includes("bank") || k.includes("cheque") || k.includes("passbook") || k.includes("statement")) {
    return "bankPassbookOrCancelledCheque";
  }
  if (k.includes("photo") || k.includes("passport") || k.includes("image")) {
    return "passportSizePhotograph";
  }
  return "";
}

/**
 * Map document key to filing backend field name.
 */
export function mapFilingDocField(key: string): string {
  const k = key.toLowerCase();
  if (k.includes("sales")) return "salesInvoice";
  if (k.includes("purchase")) return "purchaseInvoices";
  if (k.includes("2b") || k.includes("itc")) return "gstr2bItcStatement";
  if (k.includes("credit")) return "creditNotes";
  if (k.includes("debit")) return "debitNotes";
  if (k.includes("e-invoice") || k.includes("einvoice")) return "eInvoiceData";
  if (k.includes("e-way") || k.includes("eway")) return "eWayBillData";
  if (k.includes("expense") || k.includes("voucher")) return "expenseInvoicesAndVouchers";
  if (k.includes("bank")) return "bankStatement";
  if (k.includes("previous") && k.includes("acknowledgement")) return "previousFilingAcknowledgement";
  if (k.includes("previous")) return "previousGstReturns";
  return "otherSupportingDocuments";
}

/**
 * Normalize address proof type enum.
 */
export function resolveAddressProofEnum(selectedType?: string | null): string {
  const raw = (selectedType || "RENTAL_AGREEMENT").toUpperCase().replace(/[^A-Z]/g, "_");
  if (raw.includes("OWNER")) return "OWNERSHIP_PROOF";
  if (raw.includes("ELECTRI")) return "ELECTRICITY_BILL";
  if (raw.includes("OTHER")) return "OTHER_ADDRESS_PROOF";
  return "RENTAL_AGREEMENT";
}
