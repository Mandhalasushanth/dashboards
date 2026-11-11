import { ApiError } from "@/core/api/apiError";

export const describeSaveError = (err: unknown): string => {
  if (err instanceof ApiError) {
    if (err.code === "NETWORK_ERROR") return err.message;
    if (err.statusCode === 401) {
      return "Your session has expired. Please log in again and retry.";
    }
    if (err.statusCode === 403) {
      return `${err.message}\n\nThe server refused this request. Please log in again; if it persists, the TDS service may not be available on this server.`;
    }
    return err.message;
  }
  return (err as any)?.message || "Failed to save your TDS details. Please try again.";
};
