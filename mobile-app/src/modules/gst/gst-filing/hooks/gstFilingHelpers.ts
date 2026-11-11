/**
 * Pure utility functions and data mappers for GST Filing.
 * Implements defensive parsing, strict TypeScript types, and safe fallbacks.
 */

import { tokenManager, JwtUtils } from "@/core/authentication/tokenManager";
import { useAuthStore } from "@/modules/authentication/store/authStore";
import { authStorage } from "@/modules/authentication/services/authStorage";
import { logger } from "@/core/logging/logger";
import { FilingDocItem } from "@/modules/gst/gst-filing/config/gstFilingDocumentsConfig";
import { GstFilingPeriodData } from "@/modules/gst/gst-filing/components/GstFilingPeriodStep/GstFilingPeriodStep";
import type { GstFilingPayload } from "@/modules/gst/gst-filing/types/gstFilingPayload.types";
import type { ApplicationDocument } from "@/types/domain";

export type { GstFilingPayload };

export interface GstFilingBackendDto {
  gstfilingId?: string;
  id?: string;
  gstin?: string;
  customerId?: string;
  financialYear?: string;
  filingPeriod?: string;
  filingFrequency?: "MONTHLY" | "QUARTERLY" | "ANNUAL_FINANCIAL_YEAR" | string;
  returnType?: "GSTR_1" | "GSTR_3B" | string;
  filingType?: "REGULAR" | "NIL_RETURN" | string;
  taxCalculationMethod?: "ESTIMATION_FIGURES" | "FINSOLZ_CA_CALCULATION" | string;
  estimatedTaxableSales?: number | null;
  estimatedTaxablePurchases?: number | null;
  estimatedEligibleItc?: number | null;
  salesInvoice?: string;
  creditNotes?: string;
  debitNotes?: string;
  eInvoiceData?: string;
  eWayBillData?: string;
  purchaseInvoices?: string;
  gstr2bItcStatement?: string;
  expenseInvoicesAndVouchers?: string;
  bankStatement?: string;
  previousGstReturns?: string;
  previousFilingAcknowledgement?: string;
  otherSupportingDocuments?: string;
  createdAt?: string;
  [key: string]: unknown;
}


/**
 * Safely resolves customer ID from JWT token or cached auth sessions.
 */
export async function getResolvedCustomerId(): Promise<string> {
  // 1. Try store first (fast and accurately hydrated with customerId / custId)
  try {
    const authState = useAuthStore.getState();
    const custId =
      authState.customer?.customerId ||
      authState.authenticatedUser?.customerId ||
      authState.authenticatedUser?.custId ||
      (authState.customer && "custId" in authState.customer ? authState.customer.custId : undefined) ||
      "";
    if (custId && String(custId).trim() && String(custId).trim() !== "undefined") {
      return String(custId).trim();
    }
  } catch (err) {
    logger.debug("[Auth] Failed to resolve customerId from store:", { error: err });
  }

  // 2. Try auth storage
  try {
    const u = authStorage.getUser();
    const s = authStorage.getSession();
    const custId =
      u?.customerId ||
      u?.custId ||
      s?.activeCustId ||
      "";
    if (custId && String(custId).trim() && String(custId).trim() !== "undefined") {
      return String(custId).trim();
    }
  } catch (err) {
    logger.debug("[Auth] Failed to resolve customerId from storage:", { error: err });
  }

  // 3. Try JWT token
  try {
    const token = await tokenManager.getAccessToken();
    if (token) {
      const payload = JwtUtils.decodePayload(token);
      if (payload?.sub && typeof payload.sub === "string" && payload.sub.trim() && payload.sub.trim() !== "undefined") {
        return payload.sub.trim();
      }
    }
  } catch (err) {
    logger.debug("[Auth] Failed to resolve sub from token:", { error: err });
  }

  return "";
}

/**
 * Parses numeric inputs with comma/currency stripping, overflow capping, and zero-fallback.
 */
export function parseFilingNumber(val: unknown): number {
  if (typeof val === "number") {
    if (!Number.isFinite(val) || isNaN(val) || val < 0) return 0;
    return Math.min(9999999999, Math.round(val));
  }
  if (typeof val === "string") {
    const cleaned = val.replace(/[^\d.]/g, "");
    if (!cleaned) return 0;
    const parsed = parseFloat(cleaned);
    if (!Number.isFinite(parsed) || isNaN(parsed) || parsed < 0) return 0;
    return Math.min(9999999999, Math.round(parsed));
  }
  return 0;
}

/**
 * Constructs the typed REST payload for GST filing creation and updates.
 */
export function buildFilingPayload(
  periodData: Partial<GstFilingPeriodData>,
  customerId?: string,
  isManualEstimatesOnly = false,
): GstFilingPayload {
  const rawFreq = (periodData.periodType || "Quarterly").toUpperCase().replace(/\s+/g, "_");
  let filingFrequency: "MONTHLY" | "QUARTERLY" | "ANNUAL_FINANCIAL_YEAR" = "QUARTERLY";
  if (rawFreq.includes("ANNUAL")) filingFrequency = "ANNUAL_FINANCIAL_YEAR";
  else if (rawFreq.includes("MONTH")) filingFrequency = "MONTHLY";
  else filingFrequency = "QUARTERLY";

  const rawReturn = String(periodData.filingType || "GSTR-1").toUpperCase();
  const returnType: "GSTR_1" | "GSTR_3B" =
    rawReturn.includes("3B") || rawReturn.includes("3_B") ? "GSTR_3B" : "GSTR_1";

  const isNil = periodData.filingNature === "Nil Return";
  const hasEstimateFigures = Boolean(
    (periodData.taxableSales && String(periodData.taxableSales).trim() !== "" && String(periodData.taxableSales).trim() !== "0") ||
    (periodData.turnover && String(periodData.turnover).trim() !== "" && String(periodData.turnover).trim() !== "0") ||
    (periodData.taxablePurchases && String(periodData.taxablePurchases).trim() !== "" && String(periodData.taxablePurchases).trim() !== "0") ||
    (periodData.eligibleItc && String(periodData.eligibleItc).trim() !== "" && String(periodData.eligibleItc).trim() !== "0")
  );
  const isEstimates =
    !isNil &&
    (isManualEstimatesOnly ||
      periodData.calculationMethod === "manual_estimates" ||
      hasEstimateFigures);

  const financialYear = (periodData.financialYear || "2025-26").replace(/^FY\s*/i, "").trim();
  const filingPeriod = periodData.filingPeriod || periodData.filingMonth || "Q3 (Oct-Dec 2025)";

  let resolvedCustId = "";
  if (customerId && typeof customerId === "string" && customerId.trim() && customerId.trim() !== "undefined") {
    resolvedCustId = customerId.trim();
  } else if (
    (periodData as Record<string, unknown>)?.customerId &&
    String((periodData as Record<string, unknown>).customerId).trim() &&
    String((periodData as Record<string, unknown>).customerId).trim() !== "undefined"
  ) {
    resolvedCustId = String((periodData as Record<string, unknown>).customerId).trim();
  }

  return {
    gstin: periodData.gstin ? periodData.gstin.trim() : "",
    customerId: resolvedCustId,
    financialYear,
    filingPeriod,
    filingFrequency,
    returnType,
    filingType: isNil ? "NIL_RETURN" : "REGULAR",
    taxCalculationMethod: isEstimates
      ? "ESTIMATION_FIGURES"
      : "FINSOLZ_CA_CALCULATION",
    estimatedTaxableSales: isEstimates
      ? parseFilingNumber(periodData.taxableSales || periodData.turnover)
      : null,
    estimatedTaxablePurchases: isEstimates
      ? parseFilingNumber(periodData.taxablePurchases)
      : null,
    estimatedEligibleItc: isEstimates
      ? parseFilingNumber(periodData.eligibleItc)
      : null,
  };
}

/**
 * Maps backend filing DTO to frontend Period step state.
 */
export function mapDtoToPeriodData(
  dto?: Partial<GstFilingBackendDto> | null,
  existingData?: Partial<GstFilingPeriodData>,
): Partial<GstFilingPeriodData> {
  if (!dto) return existingData || {};

  const freq =
    dto.filingFrequency === "MONTHLY"
      ? "Monthly"
      : dto.filingFrequency === "ANNUAL_FINANCIAL_YEAR"
        ? "Annual"
        : "Quarterly";

  const retType =
    dto.returnType === "GSTR_3B"
      ? "GSTR-3B (Monthly Summary Return)"
      : "GSTR-1 (Outward Supplies Return)";

  const filNature =
    dto.filingType === "NIL_RETURN" ? "Nil Return" : "Regular Return";

  const hasEstimatesInDto =
    dto.taxCalculationMethod === "ESTIMATION_FIGURES" ||
    dto.estimatedTaxableSales != null ||
    dto.estimatedTaxablePurchases != null ||
    dto.estimatedEligibleItc != null;

  const hasExistingEstimates =
    existingData?.calculationMethod === "manual_estimates" ||
    Boolean(
      (existingData?.taxableSales && existingData.taxableSales !== "0") ||
      (existingData?.taxablePurchases && existingData.taxablePurchases !== "0") ||
      (existingData?.eligibleItc && existingData.eligibleItc !== "0")
    );

  const calcMethod = (hasEstimatesInDto || hasExistingEstimates) ? "manual_estimates" : "ca_assisted";

  const fy = dto.financialYear
    ? String(dto.financialYear).startsWith("FY")
      ? String(dto.financialYear)
      : `FY ${dto.financialYear}`
    : undefined;

  const result: Partial<GstFilingPeriodData> = {
    ...existingData,
    gstin: dto.gstin || existingData?.gstin || undefined,
    financialYear: fy || existingData?.financialYear,
    filingPeriod: dto.filingPeriod || existingData?.filingPeriod,
    filingMonth: dto.filingPeriod || existingData?.filingMonth,
    periodType: freq || existingData?.periodType,
    filingType: retType || existingData?.filingType,
    filingNature: (existingData?.filingNature || filNature) as "Regular Return" | "Nil Return",
    calculationMethod: calcMethod as "ca_assisted" | "manual_estimates",
    taxableSales: existingData?.taxableSales,
    turnover: existingData?.turnover || existingData?.taxableSales,
    taxablePurchases: existingData?.taxablePurchases,
    eligibleItc: existingData?.eligibleItc,
  };

  if (dto.estimatedTaxableSales !== null && dto.estimatedTaxableSales !== undefined) {
    result.taxableSales = String(dto.estimatedTaxableSales);
    result.turnover = String(dto.estimatedTaxableSales);
  }

  if (dto.estimatedTaxablePurchases !== null && dto.estimatedTaxablePurchases !== undefined) {
    result.taxablePurchases = String(dto.estimatedTaxablePurchases);
  }

  if (dto.estimatedEligibleItc !== null && dto.estimatedEligibleItc !== undefined) {
    result.eligibleItc = String(dto.estimatedEligibleItc);
  }

  return result;
}

/**
 * Maps backend document URLs back to the local document list state.
 */
export function mapDtoToFilingDocuments(
  dto: Record<string, string | undefined> | null | undefined,
  existingDocs: FilingDocItem[],
): FilingDocItem[] {
  if (!dto) return existingDocs;

  const fieldMap: Record<string, string | undefined> = {
    "sales-invoices": dto.salesInvoice,
    salesInvoice: dto.salesInvoice,
    "credit-notes": dto.creditNotes,
    creditNotes: dto.creditNotes,
    "debit-notes": dto.debitNotes,
    debitNotes: dto.debitNotes,
    "e-invoice": dto.eInvoiceData,
    eInvoiceData: dto.eInvoiceData,
    "e-way-bill": dto.eWayBillData,
    eWayBillData: dto.eWayBillData,
    "purchase-invoices": dto.purchaseInvoices,
    purchaseInvoices: dto.purchaseInvoices,
    "gstr-2b": dto.gstr2bItcStatement,
    gstr2bItcStatement: dto.gstr2bItcStatement,
    "expense-bills": dto.expenseInvoicesAndVouchers,
    "expense-vouchers": dto.expenseInvoicesAndVouchers,
    expenseInvoicesAndVouchers: dto.expenseInvoicesAndVouchers,
    "bank-statement": dto.bankStatement,
    bankStatement: dto.bankStatement,
    "prev-gst-returns": dto.previousGstReturns,
    "previous-returns": dto.previousGstReturns,
    previousGstReturns: dto.previousGstReturns,
    "prev-gst-ack": dto.previousFilingAcknowledgement,
    "filing-ack": dto.previousFilingAcknowledgement,
    previousFilingAcknowledgement: dto.previousFilingAcknowledgement,
    "other-docs": dto.otherSupportingDocuments,
    otherSupportingDocuments: dto.otherSupportingDocuments,
  };

  return existingDocs.map((doc) => {
    if (doc.fileUri && "uploadedToBackend" in doc && doc.uploadedToBackend) {
      return doc;
    }
    const val = fieldMap[doc.id] || fieldMap[doc.name];
    if (val && typeof val === "string" && val.trim() !== "") {
      const fileName = val.includes("/") ? val.split("/").pop() || val : val;
      return {
        ...doc,
        fileUri: doc.fileUri || val,
        fileName: doc.fileName || fileName,
        uploadedAt: doc.uploadedAt || "Uploaded to Server",
      };
    }
    return doc;
  });
}

/**
 * Deduplicates and resolves target filing ID across routes, drafts, and store records.
 */
export function resolveTargetFilingId(
  candidates:
    | (string | null | undefined)[]
    | Record<string, string | null | undefined>
    | undefined
    | null,
): string {
  if (!candidates) return "";
  const list = Array.isArray(candidates)
    ? candidates
    : Object.values(candidates);

  for (const c of list) {
    if (c && typeof c === "string" && c.trim() && c.trim() !== "undefined" && c.trim() !== "null") {
      return c.trim();
    }
  }

  return "";
}

/**
 * Synchronizes documents from previous application storage into current doc items.
 */
export function syncPreviousAppDocuments(
  docs: readonly FilingDocItem[],
  appDocs: readonly { name?: string; id?: string; status?: string; fileUri?: string }[],
): FilingDocItem[] {
  return docs.map((initDoc) => {
    const matched = appDocs.find(
      (d) =>
        d.name?.toLowerCase() === initDoc.name?.toLowerCase() ||
        d.id === initDoc.id,
    );
    if (
      matched &&
      matched.status === "Uploaded" &&
      matched.fileUri &&
      typeof matched.fileUri === "string" &&
      matched.fileUri.trim() !== "" &&
      !matched.fileUri.startsWith("https://finsolz.in/docs/")
    ) {
      return {
        ...initDoc,
        fileUri: matched.fileUri,
        fileName: matched.name || initDoc.name,
      };
    }
    return initDoc;
  });
}

/**
 * Extracts uploaded file names for application store submission.
 */
export function extractUploadedDocumentNames(docs: readonly FilingDocItem[]): string[] {
  return docs.filter((d) => Boolean(d.fileUri)).map((d) => d.name);
}

/**
 * Extracts full uploaded document domain objects with URI and metadata.
 */
export function extractUploadedDocuments(docs: readonly FilingDocItem[]): ApplicationDocument[] {
  return docs.filter((d) => Boolean(d.fileUri)).map((d) => ({
    name: d.name,
    status: "Uploaded" as const,
    fileUri: d.fileUri,
    fileName: d.fileName || d.name,
    fileSize: (d as any).fileSize || (d as any).sizeFormatted || "245 KB",
    category: d.category || "Filing Document",
  }));
}
