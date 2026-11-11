/**
 * Message of a caught value: `Error`/`ApiError` messages and plain `{ message }` objects.
 * Returns undefined for anything without a string `message`, so callers keep their own fallback text.
 */
export const getErrorMessage = (error: unknown): string | undefined => {
  if (typeof error === "object" && error !== null && "message" in error) {
    const { message } = error;
    return typeof message === "string" ? message : undefined;
  }
  return undefined;
};

/** A named property of a caught value (e.g. `status`, `code`, `name`), or undefined. */
export const getErrorField = (error: unknown, field: string): unknown =>
  typeof error === "object" && error !== null && field in error
    ? (error as Record<string, unknown>)[field]
    : undefined;
