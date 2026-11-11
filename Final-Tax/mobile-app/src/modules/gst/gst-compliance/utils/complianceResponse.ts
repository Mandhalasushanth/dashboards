import { ApiError } from "@/core/api/apiError";
import { getErrorMessage } from "@/core/error-handling/errorMessage";

/**
 * Compliance id from the create response: JSON `{ complianceId }`, or the
 * "Compliance ID: …" text the backend returns when it replies with plain text.
 */
export const parseCreatedComplianceId = (res: unknown): string | null => {
  if (!res) return null;
  let parsedId: string | null = null;
  try {
    const parsed = typeof res === "string" ? JSON.parse(res) : res;
    parsedId = parsed?.complianceId ?? null;
  } catch {
    const match = String(res).match(/Compliance ID:\s*([A-Za-z0-9_-]+)/i);
    parsedId = match ? match[1] : null;
  }
  return (typeof parsedId === "string" && parsedId.trim()) ? parsedId.trim() : null;
};

const TECHNICAL_ERROR_MARKERS = [
  "sql",
  "hibernate",
  "exception",
  "nullpointer",
  "syntax",
  "constraint",
  "foreign key",
  "table ",
  "column ",
  "org.",
  "com.finsolz",
  "\\tat ",
  "traceback",
];

const INTERNAL_IDENTIFIER_MARKERS = ["id:", "cust-", "cust_", "customer id"];

/**
 * Sanitizes compliance backend and transport errors into user-friendly messages.
 * Masks raw database errors, stack traces, schema details, and internal IDs while
 * preserving legitimate, human-readable domain validation messages.
 */
export function sanitizeComplianceSaveError(error: unknown): string {
  const status =
    (error instanceof ApiError ? error.statusCode : undefined) ??
    (typeof error === "object" && error !== null && "status" in error
      ? Number((error as any).status)
      : undefined);

  const rawMessage = (getErrorMessage(error) || "").trim();
  const lowerMsg = rawMessage.toLowerCase();

  // 1. Request Timeout (evaluated first so timeout messages with network context map properly)
  if (status === 408 || lowerMsg.includes("timed out") || lowerMsg.includes("timeout")) {
    return "The request timed out. Please check your network connection and try again.";
  }

  // 2. Network / Transport errors
  if (
    status === 0 ||
    lowerMsg.includes("network connection") ||
    lowerMsg.includes("network error") ||
    lowerMsg.includes("network request failed") ||
    lowerMsg.includes("failed to fetch") ||
    lowerMsg.includes("fetch failed")
  ) {
    return "Unable to connect to the server. Please check your internet connection and try again.";
  }

  // 3. Session / Authentication errors
  if (
    status === 401 ||
    status === 403 ||
    lowerMsg.includes("unauthorized") ||
    lowerMsg.includes("session expired") ||
    lowerMsg.includes("forbidden")
  ) {
    return "Your session has expired. Please sign in again to continue.";
  }

  // 4. Document size error (413 Payload Too Large)
  if (status === 413 || lowerMsg.includes("10 mb") || lowerMsg.includes("payload too large")) {
    return "Uploaded documents must not exceed 10 MB. Please reduce file size and try again.";
  }

  // 5. Internal Server Errors (5xx) — unconditionally masked
  if (status && status >= 500) {
    return "Unable to save compliance details at this time. Please try again later.";
  }

  // 6. Client validation & domain business messages (400, 409, 422)
  if (
    (status === 400 || status === 409 || status === 422 || !status) &&
    rawMessage.length > 0 &&
    rawMessage.length <= 200
  ) {
    const hasMarkup = rawMessage.includes("<") || rawMessage.includes(">");
    const hasTechnical = TECHNICAL_ERROR_MARKERS.some((marker) => lowerMsg.includes(marker));
    const hasInternalId = INTERNAL_IDENTIFIER_MARKERS.some((marker) => lowerMsg.includes(marker));

    if (!hasMarkup && !hasTechnical && !hasInternalId) {
      return rawMessage;
    }
    return "Invalid compliance details. Please check your inputs and try again.";
  }

  return "Failed to save compliance details. Please check your inputs and try again.";
}

