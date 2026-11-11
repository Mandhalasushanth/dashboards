import { ApiError } from "@/core/api/apiError";
import type { Application } from "@/types/domain";

/**
 * Extracts and validates applications array from raw API response.
 * Handles arrays, Spring Page/content, data, applications, results, items,
 * and nested wrappers without silently masking genuine server errors.
 */
export function extractApplicationsFromResponse(result: unknown): Application[] {
  if (result === null || result === undefined || result === "") {
    return [];
  }

  if (Array.isArray(result)) {
    return result as Application[];
  }

  if (typeof result === "object") {
    const obj = result as Record<string, unknown>;

    // Non-success status flags or error responses must throw genuine ApiError
    if (
      obj.success === false ||
      obj.status === "error" ||
      obj.status === "FAILED" ||
      (typeof obj.error === "string" &&
        obj.error &&
        !obj.applications &&
        !obj.data &&
        !obj.results &&
        !obj.items &&
        !obj.content)
    ) {
      const msg =
        (typeof obj.message === "string" && obj.message) ||
        (typeof obj.error === "string" && obj.error) ||
        "Request failed";
      if (
        msg.includes("404") ||
        msg.toLowerCase().includes("not found") ||
        msg.toLowerCase().includes("no applications") ||
        msg.toLowerCase().includes("no static resource")
      ) {
        return [];
      }
      throw new ApiError(msg, 400, "API_ERROR");
    }

    // Direct array properties
    if (Array.isArray(obj.applications)) return obj.applications as Application[];
    if (Array.isArray(obj.data)) return obj.data as Application[];
    if (Array.isArray(obj.content)) return obj.content as Application[];
    if (Array.isArray(obj.results)) return obj.results as Application[];
    if (Array.isArray(obj.items)) return obj.items as Application[];

    // Nested wrapper: { data: { applications/content/results/items: [] } }
    if (obj.data && typeof obj.data === "object") {
      const nested = obj.data as Record<string, unknown>;
      if (Array.isArray(nested.applications)) return nested.applications as Application[];
      if (Array.isArray(nested.content)) return nested.content as Application[];
      if (Array.isArray(nested.results)) return nested.results as Application[];
      if (Array.isArray(nested.items)) return nested.items as Application[];
    }

    // Confirmed empty response with count: 0, total: 0, or explicit empty message
    if (
      obj.success === true ||
      obj.status === "success" ||
      obj.status === 200 ||
      obj.code === 200
    ) {
      if (
        obj.count === 0 ||
        obj.total === 0 ||
        obj.totalElements === 0 ||
        obj.data === null ||
        obj.applications === null
      ) {
        return [];
      }
      const msg = typeof obj.message === "string" ? obj.message.toLowerCase() : "";
      if (
        msg.includes("no applications") ||
        msg.includes("no records") ||
        msg.includes("not found") ||
        msg.includes("empty")
      ) {
        return [];
      }
    }

    // Unrecognized or malformed object structure
    throw new ApiError(
      "Invalid application response format: expected list or recognized wrapper",
      500,
      "MALFORMED_RESPONSE"
    );
  }

  throw new ApiError(
    "Invalid application response format from server",
    500,
    "MALFORMED_RESPONSE"
  );
}
