import type { Application } from "@/types/domain";

export type StatusCategory =
  | "ALL"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "UNDER_VERIFICATION"
  | "SUBMITTED"
  | "PENDING_DOCUMENTS"
  | "REJECTED"
  | "APPROVED";

export type NormalizedStatus = StatusCategory | "DRAFT" | "OTHER";

const COMPLETED_KEYWORDS = [
  "complete",
  "approved",
  "disbursed",
  "sanctioned",
  "certificate issued",
  "documents issued",
  "policy issued",
  "closed",
  "return filed",
  "e-verified",
  "e verified",
  "everified",
] as const;

const VERIFICATION_KEYWORDS = [
  "under verification",
  "under review",
  "under scrutiny",
  "officer review",
  "officer scrutiny",
  "internal tax review",
  "ca review",
  "documents under verification",
  "verification",
  "scrutiny",
  "underwriting",
] as const;

const SUBMITTED_KEYWORDS = [
  "submitted",
  "new request",
  "application received",
  "application submitted",
] as const;

const IN_PROGRESS_KEYWORDS = [
  "in progress",
  "progress",
  "processing",
  "document collection",
  "pending payment",
  "payment pending",
  "documents pending",
  "ready for filing",
  "return preparation",
  "data preparation",
  "customer approval",
  "customer review",
  "draft",
  "pending",
] as const;

export function normalizeApplicationStatus(status?: string): NormalizedStatus {
  if (!status || typeof status !== "string") {
    return "OTHER";
  }
  const s = status.trim().toLowerCase().replace(/[_-]/g, " ").replace(/\s+/g, " ");
  if (!s) {
    return "OTHER";
  }

  // Preserve terminal non-success statuses without falsely counting them
  if (
    s.includes("reject") ||
    s.includes("fail") ||
    s.includes("cancel") ||
    s.includes("suspend")
  ) {
    return "OTHER";
  }

  if (COMPLETED_KEYWORDS.some((kw) => s.includes(kw))) {
    return "COMPLETED";
  }

  if (
    !s.includes("customer review") &&
    (s === "review" || VERIFICATION_KEYWORDS.some((kw) => s.includes(kw)))
  ) {
    return "UNDER_VERIFICATION";
  }

  if (SUBMITTED_KEYWORDS.some((kw) => s.includes(kw))) {
    return "SUBMITTED";
  }

  if (IN_PROGRESS_KEYWORDS.some((kw) => s.includes(kw))) {
    return "IN_PROGRESS";
  }

  return "OTHER";
}

export function matchesStatusFilter(
  status: string | undefined,
  filter: StatusCategory | string
): boolean {
  if (filter === "ALL") {
    return true;
  }
  const normFilter = String(filter).toUpperCase().replace(/[\s-]+/g, "_");

  if (normFilter === "UNDER_VERIFICATION") {
    return normalizeApplicationStatus(status) === "UNDER_VERIFICATION";
  }

  if (normFilter === "COMPLETED") {
    return normalizeApplicationStatus(status) === "COMPLETED";
  }

  if (normFilter === "APPROVED") {
    const s = (status || "").trim().toLowerCase();
    return s.includes("approv") || s.includes("sanction");
  }

  if (normFilter === "SUBMITTED") {
    return normalizeApplicationStatus(status) === "SUBMITTED";
  }

  if (normFilter === "PENDING_DOCUMENTS" || normFilter === "DOCUMENTS_PENDING") {
    const s = (status || "").trim().toLowerCase().replace(/_/g, " ");
    return (
      s.includes("pending doc") ||
      s.includes("doc pending") ||
      s.includes("documents pending") ||
      s.includes("pending documents") ||
      s.includes("document collection") ||
      s.includes("kyc pending")
    );
  }

  if (normFilter === "REJECTED") {
    const s = (status || "").trim().toLowerCase();
    return (
      s.includes("reject") ||
      s.includes("fail") ||
      s.includes("cancel") ||
      s.includes("suspend")
    );
  }

  if (normFilter === "IN_PROGRESS") {
    return normalizeApplicationStatus(status) === "IN_PROGRESS";
  }

  return normalizeApplicationStatus(status) === normFilter;
}

export function deduplicateApplications(apps: readonly Application[]): Application[] {
  const seenIds = new Set<string>();
  return apps.filter((app) => {
    const id = app?.id?.trim();
    if (!id || seenIds.has(id)) {
      return false;
    }
    seenIds.add(id);
    return true;
  });
}

export interface ApplicationEmptyStateDetails {
  title: string;
  subtitle: string;
  buttonText: string | null;
  resetType: "STATUS" | "SEARCH" | "ALL" | null;
}

export function getApplicationEmptyState(
  totalCount: number,
  statusFilter: StatusCategory,
  searchQuery: string
): ApplicationEmptyStateDetails {
  if (totalCount === 0) {
    return {
      title: "No Applications Submitted",
      subtitle: "You haven't submitted any applications yet. Start by choosing a service that suits your needs.",
      buttonText: null,
      resetType: null,
    };
  }
  if (statusFilter === "IN_PROGRESS") {
    return {
      title: "No in-progress applications found",
      subtitle: "There are no applications currently in progress",
      buttonText: "Show All Applications",
      resetType: "STATUS",
    };
  }
  if (statusFilter === "COMPLETED") {
    return {
      title: "No completed applications found",
      subtitle: "There are no completed applications matching your criteria",
      buttonText: "Show All Applications",
      resetType: "STATUS",
    };
  }
  if (statusFilter === "UNDER_VERIFICATION") {
    return {
      title: "No applications under verification",
      subtitle: "There are no applications currently undergoing verification",
      buttonText: "Show All Applications",
      resetType: "STATUS",
    };
  }
  if (searchQuery.trim().length > 0) {
    return {
      title: `No results for "${searchQuery.trim()}"`,
      subtitle: "Check for typos or try clearing your search",
      buttonText: "Clear Search",
      resetType: "SEARCH",
    };
  }
  return {
    title: "No applications match your filter",
    subtitle: "Try resetting your active category filters",
    buttonText: "Reset Filters",
    resetType: "ALL",
  };
}

export function matchesCategoryFilter(
  app: Application,
  selectedFilterKey: string
): boolean {
  if (selectedFilterKey === "ALL") {
    return true;
  }
  const sid = (app.serviceId || "").toLowerCase();
  const cat = (app.category || "").toUpperCase();

  if (selectedFilterKey === "gst-registration") {
    return sid.includes("registration");
  }
  if (selectedFilterKey === "gst-amendment") {
    return sid.includes("amendment");
  }
  if (selectedFilterKey === "gst-filing") {
    return sid.includes("filing") && cat === "GST";
  }
  if (selectedFilterKey === "ITR") {
    return cat === "ITR" || sid.includes("itr") || sid.includes("tds");
  }
  if (selectedFilterKey === "LOANS") {
    return cat === "LOANS" || sid.startsWith("loan");
  }
  if (selectedFilterKey === "BUSINESS") {
    return cat === "BUSINESS" || sid.includes("company") || sid.includes("incorporation");
  }
  return true;
}

export function matchesSearchQuery(
  app: Application,
  searchQuery: string
): boolean {
  const q = searchQuery.trim().toLowerCase();
  if (!q) {
    return true;
  }
  return (
    app.id.toLowerCase().includes(q) ||
    (app.serviceName || "").toLowerCase().includes(q) ||
    Boolean(app.formData?.arn && String(app.formData.arn).toLowerCase().includes(q)) ||
    Boolean(app.formData?.applicationId && String(app.formData.applicationId).toLowerCase().includes(q)) ||
    Boolean(app.formData?.gstin && String(app.formData.gstin).toLowerCase().includes(q)) ||
    Boolean(app.formData?.pan && String(app.formData.pan).toLowerCase().includes(q))
  );
}

export function getResumeRoute(app: Application): string {
  return (
    (app.formData?.resumeRoute as string) ||
    (app.serviceId === "tds-refund"
      ? "/service/tds-form"
      : `/service/${app.serviceId || "itr"}`)
  );
}


