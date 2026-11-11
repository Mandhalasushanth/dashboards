import type { AmendmentFileInput } from "./gstAmendmentApi.types";
import { apiClient, SERVER_IP, SERVER_PORT } from "@/core/api/apiClient";
import { tokenManager, JwtUtils } from "@/core/authentication/tokenManager";
import { tokenRefreshManager } from "@/core/authentication/tokenRefreshManager";
import { useAuthStore } from "@/store/authStore";
import { logger } from "@/core/logging/logger";

export const formatFile = (file: AmendmentFileInput) => {
  if (!file) return undefined;
  if (file.uri) {
    return {
      uri: file.uri,
      name: file.name || "proof.jpg",
      type: file.name?.toLowerCase().endsWith(".pdf")
        ? "application/pdf"
        : "image/jpeg",
      // React Native's FormData accepts { uri, name, type } file parts; the DOM typings do not model them.
    } as any;
  }
  return file;
};

export const mapNatureOfPremises = (nature?: string): string => {
  const lower = (nature || "").toLowerCase();
  switch (true) {
    case lower.includes("lease"):
      return "LEASED";
    case lower.includes("rent"):
      return "RENTED";
    case lower.includes("consent"):
      return "CONSENT";
    case lower.includes("share"):
      return "SHARED";
    case lower.includes("own"):
      return "OWNED";
    case lower.includes("warehouse"):
      return "WAREHOUSE";
    default:
      return "OTHERS";
  }
};

/**
 * Robust customer ID resolution ensuring valid ID or empty string, avoiding fake IDs.
 */
const resolveAmendmentCustomerId = (): string | null => {
  try {
    const authState = useAuthStore.getState();
    const candidate =
      authState.customer?.customerId ||
      authState.authenticatedUser?.customerId ||
      authState.authenticatedUser?.custId ||
      (authState.customer as any)?.custId ||
      authState.customer?.mobile ||
      authState.authenticatedUser?.mobileNumber;

    if (candidate && typeof candidate === "string" && candidate.trim() !== "") {
      return candidate.trim();
    }
  } catch (err) {
    logger.debug("[gstAmendmentTransport] Customer ID resolution fallback", { error: err });
  }
  return null;
};

// Utility for XHR Upload with proactive token validation and 401/403 refresh/retry
export const uploadAmendmentWithFile = async <T = unknown>(
  endpoint: string,
  formData: FormData,
  onSuccess: (data: T) => void,
  onError: (error: unknown) => void,
  method: "POST" | "PUT" = "POST",
  isRetry = false,
) => {
  try {
    const baseUrl =
      apiClient.getBaseUrl() || `http://${SERVER_IP}:${SERVER_PORT}`;
    const url = `${baseUrl}/api/v1/gst/amendment/${endpoint}`;
    logger.debug(`[gstAmendmentTransport] Submitting amendment via XHR (${method}) to:`, { endpoint, method });

    const custId = resolveAmendmentCustomerId();
    if (custId) {
      formData.append("customerId", custId);
    }

    // Proactive token check & refresh
    let token = await tokenManager.getAccessToken();
    const isTokenValid = token && JwtUtils.isStructureAndExpiryValid(token, 0);

    if (!isTokenValid) {
      const refreshed = await tokenRefreshManager.attemptRefresh();
      if (refreshed) {
        token = await tokenManager.getAccessToken();
      }
    }

    const xhr = new XMLHttpRequest();
    xhr.open(method, url);

    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }

    xhr.onload = async () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const parsed = JSON.parse(xhr.responseText);
          onSuccess(parsed);
        } catch {
          // Trust boundary: non-JSON replies are passed through as text, as before.
          onSuccess(xhr.responseText as T);
        }
      } else if ((xhr.status === 401 || xhr.status === 403) && !isRetry) {
        logger.warn(`[gstAmendmentTransport] Got HTTP ${xhr.status}. Attempting token refresh and retry...`);
        const refreshed = await tokenRefreshManager.attemptRefresh();
        if (refreshed) {
          uploadAmendmentWithFile<T>(endpoint, formData, onSuccess, onError, method, true);
          return;
        }

        let userMsg = "Authentication failed or session expired. Please log in again.";
        try {
          const parsed = JSON.parse(xhr.responseText);
          if (parsed.message) userMsg = parsed.message;
        } catch {
          // Ignore parse errors
        }
        onError(new Error(userMsg));
      } else {
        let errMessage = `API Error: ${xhr.status}`;
        try {
          const parsed = JSON.parse(xhr.responseText);
          if (parsed.message) {
            errMessage = parsed.message;
          } else if (parsed.error) {
            errMessage = parsed.error;
          }
        } catch {
          if (xhr.responseText && xhr.responseText.trim()) {
            errMessage = `${errMessage} - ${xhr.responseText}`;
          }
        }
        onError(new Error(errMessage));
      }
    };

    xhr.onerror = () => {
      onError(new Error("Network request failed during amendment upload. Please check your connection."));
    };

    xhr.send(formData);
  } catch (err) {
    onError(err);
  }
};
