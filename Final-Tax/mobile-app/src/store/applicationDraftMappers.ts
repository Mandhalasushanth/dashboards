import type {
  Application,
  ApplicationDocument,
  ApplicationTimelineStep,
  ServiceCategoryId,
} from "@/types/domain";
import { logger } from "@/core/logging/logger";
import { getErrorMessage } from "@/core/error-handling/errorMessage";

/**
 * Normalizes various representations of a draft step into a zero-based number.
 */
export function normalizeDraftStep(step: unknown): number {
  if (typeof step === "number" && Number.isFinite(step)) return step;
  if (typeof step !== "string") return 0;

  const stepMap: Record<string, number> = {
    FORM: 0,
    DETAILS: 0,
    UPLOAD: 1,
    DOCUMENTS: 1,
    SUMMARY: 2,
    REVIEW: 3,
    ESTIMATE: 2,
    PAYMENT: 3,
  };

  return stepMap[step.toUpperCase()] ?? 0;
}

/**
 * Returns the deep-link resume route for a draft based on service and step.
 */
export function getDraftResumeRoute(serviceKey: string, step: unknown): string {
  if (serviceKey === "tds-refund") {
    const routeMap: Record<string, string> = {
      DOCUMENTS: "/service/tds-checklist",
      ESTIMATE: "/service/tds-estimate",
      PAYMENT: "/service/tds-payment",
    };
    return routeMap[String(step || "").toUpperCase()] || "/service/tds-form";
  }

  const routeMap: Record<string, string> = {
    "tax-notice": "/service/tax-notice-assistance",
    "previous-year-itr": "/service/previous-year-itr",
    "revised-itr": "/service/revised-itr",
  };

  return routeMap[serviceKey] || `/service/${serviceKey}`;
}

/**
 * Safely extracts documents from draft payloads of any service.
 */
export function normalizeDraftDocuments(draft: Record<string, unknown>): ApplicationDocument[] {
  try {
    return extractAllApplicationDocuments({
      formData: (draft.formData as Record<string, any>) || draft,
      documents: Array.isArray(draft.documents) ? (draft.documents as any) : undefined,
    });
  } catch (error) {
    logger.warn("Failed to normalize draft documents", { error: getErrorMessage(error) });
    return [];
  }
}

/**
 * Normalizes and extracts all uploaded / associated documents for any application type.
 * Unifies documents from app.documents, app.formData (purchaseDoc, salesDoc, noticeDoc,
 * supportingDoc, document, uploadedDocuments, savedDocs, checklist, etc.),
 * and explicit documents props.
 */
export function extractAllApplicationDocuments(
  app?: Partial<Application> | null,
  fallbackDocs?: (string | ApplicationDocument)[]
): ApplicationDocument[] {
  try {
    const fd = (app?.formData || {}) as Record<string, any>;
    const rawList: unknown[] = [];

    if (Array.isArray(fallbackDocs)) rawList.push(...fallbackDocs);
    if (Array.isArray(app?.documents)) rawList.push(...app.documents);

    if (fd.purchaseDoc && typeof fd.purchaseDoc === "object") {
      rawList.push({
        name: fd.purchaseDoc.name || "Purchase Register",
        category: fd.purchaseDoc.category || "Purchase Register",
        fileUri: fd.purchaseDoc.uri || fd.purchaseDoc.fileUri,
        fileName: fd.purchaseDoc.name,
        fileSize: fd.purchaseDoc.sizeFormatted || fd.purchaseDoc.size,
        status: "Uploaded",
      });
    }
    if (fd.salesDoc && typeof fd.salesDoc === "object") {
      rawList.push({
        name: fd.salesDoc.name || "Sales Register",
        category: fd.salesDoc.category || "Sales Register",
        fileUri: fd.salesDoc.uri || fd.salesDoc.fileUri,
        fileName: fd.salesDoc.name,
        fileSize: fd.salesDoc.sizeFormatted || fd.salesDoc.size,
        status: "Uploaded",
      });
    }
    if (fd.noticeDoc && typeof fd.noticeDoc === "object") {
      rawList.push({
        name: fd.noticeDoc.name || "Notice Copy",
        category: fd.noticeDoc.category || "Notice Copy",
        fileUri: fd.noticeDoc.uri || fd.noticeDoc.fileUri,
        fileName: fd.noticeDoc.name,
        fileSize: fd.noticeDoc.sizeFormatted || fd.noticeDoc.size,
        status: "Uploaded",
      });
    }
    if (fd.document && typeof fd.document === "object") {
      rawList.push({
        name: fd.document.name || "Supporting Document",
        category: fd.document.category || fd.section || "Supporting Proof",
        fileUri: fd.document.uri || fd.document.fileUri,
        fileName: fd.document.name,
        fileSize: fd.document.size || fd.document.sizeFormatted,
        status: "Uploaded",
      });
    }
    if (fd.supportingDoc && typeof fd.supportingDoc === "object") {
      rawList.push({
        name: fd.supportingDoc.name || "Supporting Proof",
        category: fd.supportingDoc.category || "Supporting Proof",
        fileUri: fd.supportingDoc.uri || fd.supportingDoc.fileUri,
        fileName: fd.supportingDoc.name,
        fileSize: fd.supportingDoc.size || fd.supportingDoc.sizeFormatted,
        status: "Uploaded",
      });
    }
    if (typeof fd.pdfUri === "string" && fd.pdfUri.trim()) {
      rawList.push({
        name: fd.fileName || "Registration Certificate",
        category: "Certificate",
        fileUri: fd.pdfUri,
        fileName: fd.fileName || "GST_Certificate.pdf",
        fileSize: "Generated PDF",
        status: "Uploaded",
      });
    }

    if (Array.isArray(fd.documents)) rawList.push(...fd.documents);
    if (Array.isArray(fd.uploadedDocuments)) rawList.push(...fd.uploadedDocuments);
    if (Array.isArray(fd.savedDocs)) rawList.push(...fd.savedDocs);
    if (Array.isArray(fd.checklist)) rawList.push(...fd.checklist);

    const mergedMap = new Map<string, ApplicationDocument>();

    for (const item of rawList) {
      if (!item) continue;
      const isStr = typeof item === "string";
      const doc = isStr ? {} : (item as Record<string, any>);
      const name = String(isStr ? item : doc.name || doc.fileName || doc.title || doc.id || "").trim();
      if (!name) continue;

      const fileUri = typeof doc.fileUri === "string"
        ? doc.fileUri
        : typeof doc.uri === "string"
          ? doc.uri
          : typeof doc.fileUrl === "string"
            ? doc.fileUrl
            : typeof doc.url === "string"
              ? doc.url
              : undefined;

      const rawStatus = String(doc.status || "").toLowerCase();
      const isUploaded =
        rawStatus === "uploaded" ||
        rawStatus === "verified" ||
        rawStatus === "completed" ||
        Boolean(fileUri);

      const status: ApplicationDocument["status"] = isUploaded
        ? "Uploaded"
        : rawStatus === "rejected"
          ? "Rejected"
          : "Pending";

      const fileName =
        typeof doc.fileName === "string" && doc.fileName.trim()
          ? doc.fileName.trim()
          : fileUri
            ? fileUri.split("/").pop()?.split("?")[0]
            : undefined;

      const rawSize = doc.fileSize || doc.sizeFormatted || doc.size;
      const fileSize =
        typeof rawSize === "number"
          ? `${Math.round(rawSize / 1024)} KB`
          : typeof rawSize === "string" && rawSize.trim()
            ? rawSize.trim()
            : isUploaded && fileUri
              ? "245 KB"
              : undefined;

      const category =
        typeof doc.category === "string" && doc.category.trim()
          ? doc.category.trim()
          : typeof doc.documentType === "string" && doc.documentType.trim()
            ? doc.documentType.trim()
            : undefined;

      const uploadedAt =
        typeof doc.uploadedAt === "string" && doc.uploadedAt.trim()
          ? doc.uploadedAt.trim()
          : typeof doc.appliedDate === "string" && doc.appliedDate.trim()
            ? doc.appliedDate.trim()
            : typeof doc.date === "string" && doc.date.trim()
              ? doc.date.trim()
              : typeof fd.submissionDate === "string" && fd.submissionDate.trim()
                ? fd.submissionDate.trim()
                : typeof app?.createdAt === "string"
                  ? app.createdAt
                  : undefined;

      const itemCandidate: ApplicationDocument = {
        name,
        status,
        ...(fileUri ? { fileUri } : {}),
        ...(fileName ? { fileName } : {}),
        ...(fileSize ? { fileSize } : {}),
        ...(category ? { category } : {}),
        ...(uploadedAt ? { uploadedAt } : {}),
      };

      let matchKey: string | undefined;
      for (const [key, existing] of mergedMap.entries()) {
        const sameUri = fileUri && existing.fileUri && fileUri === existing.fileUri;
        const sameName = existing.name.toLowerCase() === name.toLowerCase();
        const sameCategory =
          category && existing.category &&
          existing.category.toLowerCase() === category.toLowerCase();
        const nameMatchesCategory =
          (existing.name.toLowerCase() === (category || "").toLowerCase()) ||
          ((existing.category || "").toLowerCase() === name.toLowerCase());

        if (sameUri || sameName || sameCategory || nameMatchesCategory) {
          matchKey = key;
          break;
        }
      }

      if (matchKey) {
        const existing = mergedMap.get(matchKey)!;
        const preferNew = !existing.fileUri && Boolean(fileUri);
        const preferNewStatus = existing.status === "Pending" && status === "Uploaded";

        mergedMap.set(matchKey, {
          name: preferNew ? name : existing.name,
          status: preferNewStatus || status === "Uploaded" ? "Uploaded" : existing.status,
          fileUri: fileUri || existing.fileUri,
          fileName: fileName || existing.fileName,
          fileSize: fileSize || existing.fileSize,
          category: category || existing.category,
          uploadedAt: uploadedAt || existing.uploadedAt,
        });
      } else {
        const uniqueKey = fileUri || `${name.toLowerCase()}#${category?.toLowerCase() || ""}`;
        mergedMap.set(uniqueKey, itemCandidate);
      }
    }

    return Array.from(mergedMap.values());
  } catch (error) {
    logger.warn("Failed to extract application documents", { error: getErrorMessage(error) });
    return [];
  }
}

/**
 * Converts a raw stored service draft into an Application domain entity.
 */
export function draftToApplication(
  draft: Record<string, unknown>,
  cleanMobile: string
): Application {
  const sid = String(draft.serviceKey || draft.serviceId || "service");
  const cat: ServiceCategoryId =
    (draft.category as ServiceCategoryId) ||
    (sid.startsWith("gst") ? "GST" : "ITR");
  const serviceName =
    String(draft.serviceName || "") ||
    sid
      .split("-")
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const rawStep = draft.step ?? draft.stepIndex ?? draft.savedStep;
  const stepNum = normalizeDraftStep(rawStep);
  const documents = normalizeDraftDocuments(draft);
  const updatedAt = typeof draft.updatedAt === "string" ? draft.updatedAt : new Date().toISOString();

  return {
    id: String(draft.id || `DRAFT-${sid.toUpperCase()}-${cleanMobile.slice(-4) || "USER"}`),
    serviceId: sid,
    serviceName,
    category: cat,
    status: "Draft",
    progress: Math.min(95, Math.max(5, Math.round(((stepNum + 1) / 5) * 100))),
    assignedExecutive: "",
    paymentAmount: 0,
    paymentStatus: "Pending",
    createdAt: updatedAt,
    formData: {
      ...((draft.formData as Record<string, unknown>) || {}),
      isDraft: true,
      savedStep: rawStep,
      resumeRoute: getDraftResumeRoute(sid, rawStep),
    },
    documents,
    timeline: [],
    chatHistory: [],
  };
}

/**
 * Returns service-specific default timeline milestones.
 */
export function getServiceTimeline(serviceId: string): ApplicationTimelineStep[] {
  const sid = (serviceId || "").toLowerCase();

  if (sid.includes("amendment")) {
    return [
      { title: "Amendment Submitted", description: "Amendment request submitted with supporting documents", status: "completed", date: "Today" },
      { title: "Document Collection", description: "Verification of amended proofs and business details", status: "current" },
      { title: "Verification", description: "Finsolz CA and Assessing Officer review", status: "pending" },
      { title: "Completed", description: "Updated registration certificate issued", status: "pending" },
    ];
  }

  if (sid.includes("filing") && sid.includes("gst")) {
    return [
      { title: "Filing Data Submitted", description: "Sales, purchase & turnover details received", status: "completed", date: "Today" },
      { title: "Document Collection", description: "Input Tax Credit & invoice records checked", status: "current" },
      { title: "Verification", description: "CA reconciliation and return computation", status: "pending" },
      { title: "Completed", description: "Portal e-filing confirmed and ARN generated", status: "pending" },
    ];
  }

  if (sid.includes("itr") || sid.includes("tds")) {
    return [
      { title: "Application Submitted", description: "Income, deductions & personal details received", status: "completed", date: "Today" },
      { title: "Document Collection", description: "Form 16, 26AS/AIS and financial proofs collected", status: "current" },
      { title: "Verification", description: "CA computation & dual-regime tax review", status: "pending" },
      { title: "Completed", description: "ITR filed & CPC acknowledgment generated", status: "pending" },
    ];
  }

  if (sid.includes("loan")) {
    return [
      { title: "Loan Application Submitted", description: "Borrower details and financial profiles received", status: "completed", date: "Today" },
      { title: "Document Collection", description: "KYC, income proofs and credit profile checked", status: "current" },
      { title: "Verification", description: "Credit assessment, bureau check and underwriting", status: "pending" },
      { title: "Completed", description: "Loan sanction and disbursement confirmation", status: "pending" },
    ];
  }

  if (sid.includes("company") || sid.includes("incorporation") || sid.includes("business")) {
    return [
      { title: "Application Submitted", description: "Name choices, director details & constitution received", status: "completed", date: "Today" },
      { title: "Document Collection", description: "DSC, DIN and SPICe+ documents collected", status: "current" },
      { title: "Verification", description: "ROC filing, name approval & MCA scrutiny", status: "pending" },
      { title: "Completed", description: "COI, PAN and TAN issuance", status: "pending" },
    ];
  }

  return [
    { title: "Application Submitted", description: "Application submitted successfully", status: "completed", date: "Today" },
    { title: "Document Collection", description: "Documents are being collected or checked", status: "current" },
    { title: "Verification", description: "Application details are being verified", status: "pending" },
    { title: "Completed", description: "Final filing, approval, or completion confirmation", status: "pending" },
  ];
}
