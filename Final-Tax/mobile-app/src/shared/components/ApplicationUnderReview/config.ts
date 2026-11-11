import type { ApplicationReviewStatus } from "./types";

export const STATUS_LABELS: Record<ApplicationReviewStatus, string> = {
  under_review: "Under Review",
};

export const DEFAULT_NEXT_STEPS: readonly string[] = [
  "Our agent will review your application.",
  "We may contact you if additional information is required.",
  "You will be contacted with the next update.",
];

export const formatSubmittedAt = (iso: string | null): string => {
  if (!iso) return "—";
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
};
