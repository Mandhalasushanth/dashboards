/**
 * Utility: GST Draft Lifecycle & Form Hygiene
 * Handles dirty checking against initial state, draft document sanitization,
 * customer ID resolution fallback, and payment completion status checks.
 *
 * Line count invariant: Strictly < 500 lines.
 * Functional invariant: No explicit loops; strictly functional array methods.
 */

import { GstBusinessFormData } from "@/modules/gst/gst-registration/components/GstBusinessStep/GstBusinessStep";
import { DocumentItem } from "@/modules/gst/gst-registration/components/GstUnifiedDocumentStep/GstUnifiedDocumentStep.types";

export const INITIAL_BUSINESS_DATA: GstBusinessFormData = {
  legalName: "",
  businessName: "",
  businessType: "",
  natureOfBusiness: "",
  placeOfBusiness: "",
  businessStartDate: "",
  reasonForRegistration: "",
  compositionScheme: "",
  businessAddress: "",
  city: "",
  district: "",
  state: "",
  pinCode: "",
  hsnCode: "",
  accountHolderName: "",
  bankAccountNumber: "",
  confirmBankAccountNumber: "",
  ifscCode: "",
  bankName: "",
  branchName: "",
  accountType: "",
  signatoryName: "",
  signatoryPan: "",
  signatoryDob: "",
  signatoryDesignation: "",
  signatoryMobile: "",
  signatoryEmail: "",
  addressProofType: "Rental Agreement",
  aadhaarConsent: false,
  businessPan: "",
};

export const isBackendGstId = (id?: unknown): id is string => {
  if (!id || typeof id !== "string") return false;
  const clean = id.trim();
  if (/^GST-2026-\d+/i.test(clean)) return false;
  return /^GST\d+$/i.test(clean) || (clean.startsWith("GST") && !clean.includes("-"));
};

export const extractGstId = (res: unknown): string => {
  if (!res) return "";
  if (typeof res === "string") {
    const match = res.match(/GST\d{6,14}/i) || res.match(/GST[A-Za-z0-9]+/i);
    return match ? match[0] : "";
  }
  const obj = res as Record<string, any>;
  const candidate = obj.gstId || obj.businessId || obj.id || obj.data?.gstId || obj.data?.id || "";
  return isBackendGstId(candidate) ? candidate : "";
};

export const resolveTargetGstId = (candidates: (string | undefined | null)[]): string => {
  const match = candidates.find((c): c is string => isBackendGstId(c));
  return match ? match.trim() : "";
};

/**
 * Checks if a URI is persistent (remote backend URL or permanent storage)
 * vs a transient device-local file URI (cache / tmp / ph / file).
 */
export const isPersistentDocumentUri = (uri?: string): boolean => {
  if (!uri || typeof uri !== "string") return false;
  const clean = uri.trim().toLowerCase();
  return (
    clean.startsWith("http://") ||
    clean.startsWith("https://") ||
    clean.startsWith("blob:") ||
    clean.startsWith("data:")
  );
};

/**
 * Bug 18: Sanitizes documents restored from persisted drafts.
 * Preserves uploaded documents while ensuring non-persistent or corrupted URIs
 * are gracefully handled without crashing the document uploader.
 */
export const sanitizeRestoredDocuments = (
  rawDocs: DocumentItem[],
  baseDocs: DocumentItem[]
): DocumentItem[] => {
  if (!Array.isArray(rawDocs) || rawDocs.length === 0) return baseDocs;

  return baseDocs.map((baseDoc) => {
    const matchingRaw = rawDocs.find((d) => d.id === baseDoc.id);
    if (!matchingRaw) return baseDoc;

    const hasUri = Boolean(matchingRaw.fileUri && matchingRaw.fileUri.trim());
    return {
      ...baseDoc,
      ...matchingRaw,
      fileUri: hasUri ? matchingRaw.fileUri : undefined,
      fileName: hasUri ? matchingRaw.fileName : undefined,
      fileSize: hasUri ? matchingRaw.fileSize : undefined,
      mimeType: hasUri ? matchingRaw.mimeType : undefined,
    };
  });
};

/**
 * Bug 20: Clean snapshot-based dirty check.
 * Compares current business form data with initial baseline state.
 * Eliminates hardcoded magic string checks (e.g. `v !== "Rental Agreement"`).
 */
export const isBusinessFormDirty = (
  data: GstBusinessFormData,
  initial: GstBusinessFormData = INITIAL_BUSINESS_DATA
): boolean => {
  if (!data) return false;

  const dataKeys = Object.keys(initial) as (keyof GstBusinessFormData)[];

  return dataKeys.some((key) => {
    const currentVal = data[key];
    const initialVal = initial[key];

    if (typeof initialVal === "boolean") {
      return Boolean(currentVal) !== initialVal;
    }

    if (typeof initialVal === "string") {
      const curTrimmed = typeof currentVal === "string" ? currentVal.trim() : "";
      const initTrimmed = initialVal.trim();
      return curTrimmed !== initTrimmed;
    }

    return false;
  });
};

/**
 * Determines whether the user has entered any substantial draft data across
 * business fields or uploaded document attachments.
 */
export const hasAnyGstDataEntered = (
  data: GstBusinessFormData,
  docs: DocumentItem[],
  initial: GstBusinessFormData = INITIAL_BUSINESS_DATA
): boolean => {
  const isBusinessDirty = isBusinessFormDirty(data, initial);
  const hasUploadedDocs = docs.some((d) => Boolean(d.fileUri && d.fileUri.trim()));
  return isBusinessDirty || hasUploadedDocs;
};

/**
 * Bug 19: Terminal payment status verification.
 * Only clears drafts when the payment status has explicitly confirmed success.
 */
const CONFIRMED_PAYMENT_STATUSES = ["PAID", "SUCCESS", "COMPLETED"] as const;

export const isPaymentConfirmed = (status?: string): boolean => {
  if (!status || typeof status !== "string") return false;
  const upper = status.trim().toUpperCase();
  return CONFIRMED_PAYMENT_STATUSES.some((valid) => valid === upper);
};

/**
 * Bug 17: Validates that customer ID is present and non-empty.
 */
export const isValidCustomerId = (custId?: unknown): custId is string => {
  return typeof custId === "string" && custId.trim().length > 0;
};

/**
 * Bug 27: Determines appropriate scroll target offset based on first validation error.
 * Supports measured section layout positions (with fallback).
 */
export const BANK_FIELD_NAMES = [
  "accountHolderName", "bankAccountNumber", "confirmBankAccountNumber",
  "ifscCode", "bankName", "branchName", "accountType",
];
export const SIGNATORY_FIELD_NAMES = [
  "signatoryName", "signatoryPan", "signatoryDob",
  "signatoryDesignation", "signatoryMobile", "signatoryEmail",
];
export const GST_ALL_FIELD_ORDER = [
  "legalName", "businessName", "businessType", "natureOfBusiness", "placeOfBusiness",
  "businessStartDate", "businessPan", "reasonForRegistration", "compositionScheme", "businessAddress",
  "city", "district", "state", "pinCode", "hsnCode", "accountHolderName",
  "bankAccountNumber", "confirmBankAccountNumber", "ifscCode", "bankName",
  "branchName", "accountType", "signatoryName", "signatoryPan", "signatoryDob",
  "signatoryDesignation", "signatoryMobile", "signatoryEmail", "aadhaarConsent",
] as const;
export type GstFieldName = (typeof GST_ALL_FIELD_ORDER)[number];

export const getFirstErrorField = (errors: Record<string, string>): string | null => {
  return GST_ALL_FIELD_ORDER.find((f) => Boolean(errors[f])) || Object.keys(errors)[0] || null;
};

export const isTextFormField = (field?: string | null): boolean => {
  if (!field) return false;
  return ![
    "signatoryDob", "businessStartDate", "aadhaarConsent",
    "businessType", "natureOfBusiness", "placeOfBusiness",
    "reasonForRegistration", "compositionScheme", "bankName", "accountType", "state",
  ].includes(field);
};

export const getFirstErrorSection = (errors: Record<string, string>): "business" | "bank" | "signatory" | "consent" => {
  const firstField = getFirstErrorField(errors);
  if (!firstField) return "business";
  if (firstField === "aadhaarConsent") return "consent";
  if (SIGNATORY_FIELD_NAMES.includes(firstField)) return "signatory";
  if (BANK_FIELD_NAMES.includes(firstField)) return "bank";
  return "business";
};

export const getFirstErrorScrollOffset = (
  errors: Record<string, string>,
  positions?: Record<string, number>,
): number => {
  const firstField = getFirstErrorField(errors);
  if (!firstField) return 0;
  if (typeof positions?.[firstField] === "number" && positions[firstField] > 0) {
    return positions[firstField];
  }
  if (firstField === "aadhaarConsent") {
    if (typeof positions?.consent === "number" && positions.consent > 0) return positions.consent;
    const sigY = typeof positions?.signatory === "number" && positions.signatory > 0 ? positions.signatory : 1100;
    return sigY + 340;
  }
  if (SIGNATORY_FIELD_NAMES.includes(firstField)) {
    const sigY = typeof positions?.signatory === "number" && positions.signatory > 0 ? positions.signatory : 1100;
    switch (firstField) {
      case "signatoryName": return sigY + 50;
      case "signatoryPan":
      case "signatoryDob": return sigY + 120;
      case "signatoryDesignation": return sigY + 200;
      case "signatoryMobile":
      case "signatoryEmail": return sigY + 280;
      default: return sigY;
    }
  }
  if (BANK_FIELD_NAMES.includes(firstField)) {
    const bankY = typeof positions?.bank === "number" && positions.bank > 0 ? positions.bank : 550;
    switch (firstField) {
      case "accountHolderName": return bankY + 50;
      case "bankAccountNumber": return bankY + 120;
      case "confirmBankAccountNumber": return bankY + 190;
      case "ifscCode": return bankY + 260;
      case "bankName":
      case "branchName": return bankY + 330;
      case "accountType": return bankY + 400;
      default: return bankY;
    }
  }
  return typeof positions?.[firstField] === "number" ? positions[firstField] : 0;
};

/**
 * BUG_IOS_054: Keyboard avoidance configuration calculation helper.
 */
export const getKeyboardAvoidingConfig = (
  platform: string,
  insetsTop: number = 0,
  headerOffset: number = 60,
): { behavior: "padding" | undefined; keyboardVerticalOffset: number } => {
  if (platform === "ios") {
    return {
      behavior: "padding",
      keyboardVerticalOffset: insetsTop + headerOffset,
    };
  }
  return {
    behavior: undefined,
    keyboardVerticalOffset: 0,
  };
};
