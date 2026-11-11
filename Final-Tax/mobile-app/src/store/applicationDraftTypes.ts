/**
 * Draft types for Application Store.
 * Strongly-typed draft state models for GST, ITR, TDS, and other services.
 */

export interface DraftDocumentItem {
  id: string;
  name: string;
  subtitle?: string;
  required?: boolean;
  iconName?: string;
  iconBg?: string;
  iconColor?: string;
  category?: string;
  fileUri?: string;
  fileName?: string;
  fileSize?: string;
  uploadedAt?: string;
}

export interface GstRegistrationDraft {
  id: string;
  stepIndex: number;
  createdGstId?: string;
  /** Backend document-set id, once documents have been uploaded. */
  documentId?: string;
  gstId?: string;
  personalData: Record<string, string>;
  businessData: Record<string, string>;
  documents: DraftDocumentItem[];
  updatedAt: string;
}

export interface GstFilingDraft {
  id: string;
  stepIndex: number;
  currentStep?: number;
  createdFilingId?: string;
  periodData: {
    periodType: string;
    financialYear?: string;
    filingMonth: string;
    filingPeriod?: string;
    gstin: string;
    filingType: string;
  };
  documents: DraftDocumentItem[];
  updatedAt: string;
}

export interface ItrRegistrationDraft {
  id: string;
  stepIndex: number;
  category: string;
  categoryTitle: string;
  formType: string;
  assessmentYear: string;
  incomeAmount: string;
  regime: string;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    confirmAccountNumber?: string;
    ifscCode: string;
    accountType: string;
  };
  deductions: {
    sec80c: string;
    sec80d: string;
    homeLoan24b: string;
    educationLoan80e: string;
    otherDeductions: string;
  };
  previousFilingOption: string;
  previousAckNumber: string;
  documents: {
    id: string;
    name: string;
    subtitle: string;
    required: boolean;
    fileUri?: string;
    fileName?: string;
    fileSize?: string;
    uploadedAt?: string;
  }[];
  filingData?: Record<string, unknown>;
  updatedAt: string;
}

export interface TdsDraftDocument {
  id: string;
  status: "not_uploaded" | "uploaded";
  fileUri?: string;
  fileName?: string;
  fileSize?: string;
  mimeType?: string;
  fileTypeLabel?: string;
}

export interface TdsDraft {
  id?: string;
  formData?: Record<string, any>;
  documents?: TdsDraftDocument[];
  step?: "FORM" | "DOCUMENTS" | string;
  updatedAt?: string;
}

export interface TaxNoticeDraftDocument {
  id: string;
  title: string;
  status: "not_uploaded" | "uploaded";
  fileUri?: string;
  fileName?: string;
  fileSize?: string;
  mimeType?: string;
}

export interface TaxNoticeDraft {
  id?: string;
  formData?: Record<string, unknown>;
  documents?: TaxNoticeDraftDocument[];
  step?: "DETAILS" | "UPLOAD" | "DOCUMENTS" | string;
  remarks?: string;
  updatedAt?: string;
}

export interface GenericServiceDraft {
  id?: string;
  step?: number | string;
  formData?: Record<string, unknown>;
  documents?: DraftDocumentItem[];
  updatedAt?: string;
  [key: string]: unknown;
}
