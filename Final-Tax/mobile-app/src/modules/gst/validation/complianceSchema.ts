import {
  validateGstinFull,
  isFileSizeValid,
  isFileTypeAllowed,
  RECONCILIATION_ALLOWED_EXTENSIONS,
  NOTICE_ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE_BYTES,
} from "../utils/gstValidation";

export interface UploadedDocInfo {
  uri: string;
  name: string;
  size?: number;
  sizeFormatted: string;
  mimeType?: string;
}

export interface ComplianceFormData {
  gstin: string;
  financialYear: string;
  requestType: "Reconciliation Support" | "Notice Response" | "";
  // Reconciliation Support
  purchaseDoc: UploadedDocInfo | null;
  salesDoc: UploadedDocInfo | null;
  gstr2bRef: string;
  reconciliationRemarks: string;
  // Notice Response
  noticeNumber: string;
  noticeIssueDate: string;
  replyDueDate: string;
  noticeDoc: UploadedDocInfo | null;
  noticeRemarks: string;
}

export interface ValidationErrors {
  gstin?: string;
  financialYear?: string;
  requestType?: string;
  purchaseDoc?: string;
  salesDoc?: string;
  gstr2bRef?: string;
  reconciliationRemarks?: string;
  noticeNumber?: string;
  noticeIssueDate?: string;
  replyDueDate?: string;
  noticeDoc?: string;
  noticeRemarks?: string;
  general?: string;
}

export const NOTICE_MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
export const RECON_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const MONTH_INDEX_MAP: Record<string, number> = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
};

/**
 * Parses date strings ("DD MMM YYYY", "DD-MM-YYYY", or "YYYY-MM-DD")
 * into a date-only integer (YYYYMMDD) for timezone-independent, chronological comparison.
 */
export function parseDateToComparableDay(dateStr?: string): number | null {
  if (!dateStr) return null;
  const clean = dateStr.trim();
  // 1. "DD MMM YYYY" (e.g. "15 Oct 2026")
  const parts = clean.split(" ");
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = MONTH_INDEX_MAP[parts[1].toLowerCase()];
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && month && !isNaN(year)) {
      return year * 10000 + month * 100 + day;
    }
  }

  // 2. "DD-MM-YYYY" (e.g. "15-10-2026")
  const dashParts = clean.split("-");
  if (dashParts.length === 3 && dashParts[0].length <= 2) {
    const day = parseInt(dashParts[0], 10);
    const month = parseInt(dashParts[1], 10);
    const year = parseInt(dashParts[2], 10);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      return year * 10000 + month * 100 + day;
    }
  }

  // 3. "YYYY-MM-DD"
  if (dashParts.length === 3 && dashParts[0].length === 4) {
    const year = parseInt(dashParts[0], 10);
    const month = parseInt(dashParts[1], 10);
    const day = parseInt(dashParts[2], 10);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      return year * 10000 + month * 100 + day;
    }
  }

  return null;
}

/**
 * Returns today's local calendar date as an integer (YYYYMMDD) for timezone-independent comparison.
 */
export function getLocalTodayComparableDay(): number {
  const now = new Date();
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

/**
 * Validates notice dates: checks presence, rejects future Notice Issue Dates,
 * and ensures Reply Due Date is on or after Notice Issue Date.
 * Allows the same calendar day.
 */
export function validateNoticeDates(
  issueDateStr?: string,
  dueDateStr?: string,
  referenceToday: number = getLocalTodayComparableDay()
): { issueDateError?: string; dueDateError?: string } {
  const result: { issueDateError?: string; dueDateError?: string } = {};

  const cleanIssue = (issueDateStr || "").trim();
  const cleanDue = (dueDateStr || "").trim();

  let issueDay: number | null = null;

  if (!cleanIssue) {
    result.issueDateError = "Select Notice Issue Date";
  } else {
    issueDay = parseDateToComparableDay(cleanIssue);

    if (issueDay === null) {
      result.issueDateError = "Enter a valid Notice Issue Date";
    } else if (issueDay > referenceToday) {
      result.issueDateError = "Notice Issue Date cannot be in the future";
    }
  }

  if (!cleanDue) {
    result.dueDateError = "Select Reply Due Date";
  } else if (cleanIssue) {
    const dueDay = parseDateToComparableDay(cleanDue);

    if (issueDay !== null && dueDay !== null && dueDay < issueDay) {
      result.dueDateError = "Reply Due Date cannot be before Notice Issue Date";
    }
  }

  return result;
}

export function validateComplianceForm(data: ComplianceFormData): {
  isValid: boolean;
  errors: ValidationErrors;
} {
  const errors: ValidationErrors = {};

  // Section 1: GSTIN
  const gstinErr = validateGstinFull(data.gstin);
  if (gstinErr) errors.gstin = gstinErr;

  // Section 1: Financial Year
  if (!data.financialYear) {
    errors.financialYear = "Select Financial Year";
  }

  // Section 1: Request Type
  if (!data.requestType) {
    errors.requestType = "Select Request Type";
  }

  // Dynamic Validation: Reconciliation Support
  if (data.requestType === "Reconciliation Support") {
    const isDocValid = (doc: UploadedDocInfo | null | undefined): boolean =>
      Boolean(doc && typeof doc.uri === "string" && doc.uri.trim() && typeof doc.name === "string" && doc.name.trim());

    if (!isDocValid(data.purchaseDoc)) {
      errors.purchaseDoc = "Upload Purchase Register";
    } else if (data.purchaseDoc) {
      if (!isFileSizeValid(data.purchaseDoc.size)) {
        errors.purchaseDoc =
          data.purchaseDoc.size && data.purchaseDoc.size > MAX_FILE_SIZE_BYTES
            ? "Purchase Register exceeds maximum 10 MB size limit"
            : "Unable to verify document file size. Please re-select the document.";
      } else if (!isFileTypeAllowed(data.purchaseDoc.name, RECONCILIATION_ALLOWED_EXTENSIONS)) {
        errors.purchaseDoc = "Purchase Register must be PDF, Excel or Image (JPG, PNG)";
      }
    }

    if (!isDocValid(data.salesDoc)) {
      errors.salesDoc = "Upload Sales Register";
    } else if (data.salesDoc) {
      if (!isFileSizeValid(data.salesDoc.size)) {
        errors.salesDoc =
          data.salesDoc.size && data.salesDoc.size > MAX_FILE_SIZE_BYTES
            ? "Sales Register exceeds maximum 10 MB size limit"
            : "Unable to verify document file size. Please re-select the document.";
      } else if (!isFileTypeAllowed(data.salesDoc.name, RECONCILIATION_ALLOWED_EXTENSIONS)) {
        errors.salesDoc = "Sales Register must be PDF, Excel or Image (JPG, PNG)";
      }
    }

    // GSTR-2B Reference validation (Optional, 3-30 chars, letters, digits, hyphens, underscores, slashes, internal spaces)
    const rawGstr2b = data.gstr2bRef || "";
    const trimmedGstr2b = rawGstr2b.trim();
    if (trimmedGstr2b.length > 0) {
      if (trimmedGstr2b.length < 3 || trimmedGstr2b.length > 30) {
        errors.gstr2bRef = "GSTR-2B reference must be between 3 and 30 characters";
      } else if (!/^[A-Za-z0-9\/\-_ ]+$/.test(trimmedGstr2b)) {
        errors.gstr2bRef =
          "GSTR-2B reference can only contain letters, numbers, hyphens, underscores, slashes, and spaces";
      }
    }

    // Reconciliation Remarks validation (Optional, max 500 chars)
    if (data.reconciliationRemarks && data.reconciliationRemarks.length > 500) {
      errors.reconciliationRemarks = "Remarks must not exceed 500 characters";
    }
  }

  // Dynamic Validation: Notice Response
  if (data.requestType === "Notice Response") {
    const cleanedNotice = (data.noticeNumber || "").trim().toUpperCase();
    if (!cleanedNotice) {
      errors.noticeNumber = "Enter Notice Number";
    } else if (cleanedNotice.length < 5) {
      errors.noticeNumber = "Notice Number must be at least 5 characters";
    } else if (!/^[A-Z0-9\/-]{5,30}$/.test(cleanedNotice)) {
      errors.noticeNumber = "Invalid Notice Number (5-30 alphanumeric characters, e.g. ZA290422000001Z)";
    }


    const { issueDateError, dueDateError } = validateNoticeDates(
      data.noticeIssueDate,
      data.replyDueDate
    );
    if (issueDateError) {
      errors.noticeIssueDate = issueDateError;
    }
    if (dueDateError) {
      errors.replyDueDate = dueDateError;
    }

    if (!data.noticeDoc) {
      errors.noticeDoc = "Upload Notice Copy";
    } else {
      if (!isFileSizeValid(data.noticeDoc.size, NOTICE_MAX_FILE_SIZE_BYTES)) {
        errors.noticeDoc = "Notice Copy exceeds maximum 20 MB size limit";
      } else if (!isFileTypeAllowed(data.noticeDoc.name, NOTICE_ALLOWED_EXTENSIONS)) {
        errors.noticeDoc = "Notice Copy must be PDF, JPG or PNG";
      }
    }

    // Notice Remarks validation (Optional, max 500 chars)
    if (data.noticeRemarks && data.noticeRemarks.length > 500) {
      errors.noticeRemarks = "Remarks must not exceed 500 characters";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
