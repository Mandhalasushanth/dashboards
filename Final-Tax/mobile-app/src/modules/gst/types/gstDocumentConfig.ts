/**
 * Service-Specific GST Document Configuration
 * Maps directly to Spring Boot backend enums and multipart contracts:
 * - DocumentsController: DocumentType
 * - GstFilingDocumentsController: GstFilingDocumentType
 * - GstComplianceController: reconciliationFile1, reconciliationFile2, noticeFile
 * - GstCancellationController: supportingProofDocument
 * - Amendment Controllers: proof file
 */

export interface GstServiceDocumentRequirement {
  id: string;
  backendType: string;
  name: string;
  subtitle: string;
  required: boolean;
  iconName: string;
  category: "identity" | "address" | "business" | "financial" | "compliance" | "cancellation";
}

export interface GstApplicationDocumentItem extends GstServiceDocumentRequirement {
  fileUri?: string;
  fileName?: string;
  fileSize?: string;
  mimeType?: string;
  status: "Pending" | "Uploaded";
  uploadedAt?: string;
  documentId?: string; // Backend persisted document ID
}

/** 1. GST Registration Document Requirements */
export const GST_REGISTRATION_DOCUMENTS: GstServiceDocumentRequirement[] = [
  {
    id: "pan_card",
    backendType: "PAN_CARD",
    name: "PAN Card of Business / Proprietor",
    subtitle: "Clear photo or PDF copy of PAN card",
    required: true,
    iconName: "card-outline",
    category: "identity",
  },
  {
    id: "aadhaar_card",
    backendType: "AADHAAR_CARD",
    name: "Aadhaar Card of Authorized Signatory",
    subtitle: "Front and back copy of Aadhaar card",
    required: true,
    iconName: "person-outline",
    category: "identity",
  },
  {
    id: "business_registration_proof",
    backendType: "BUSINESS_REGISTRATION_PROOF",
    name: "Business Registration Document",
    subtitle: "Certificate of Incorporation / Partnership Deed / Shop Act",
    required: true,
    iconName: "business-outline",
    category: "business",
  },
  {
    id: "principal_place_address_proof",
    backendType: "PRINCIPAL_PLACE_ADDRESS_PROOF",
    name: "Principal Place Address Proof",
    subtitle: "Electricity bill, Rent agreement, or Property tax receipt (< 2 months)",
    required: true,
    iconName: "home-outline",
    category: "address",
  },
  {
    id: "bank_proof",
    backendType: "BANK_PASSBOOK_OR_CANCELLED_CHEQUE",
    name: "Bank Account Proof",
    subtitle: "Cancelled cheque or first page of bank passbook / statement",
    required: true,
    iconName: "wallet-outline",
    category: "financial",
  },
  {
    id: "passport_photo",
    backendType: "PASSPORT_SIZE_PHOTOGRAPH",
    name: "Passport Size Photograph",
    subtitle: "Recent passport photo of applicant or primary partner / director",
    required: true,
    iconName: "image-outline",
    category: "identity",
  },
];

/** 2. GST Return Filing Document Requirements */
export const GST_FILING_DOCUMENTS: GstServiceDocumentRequirement[] = [
  {
    id: "sales_register",
    backendType: "SALES_INVOICE",
    name: "Sales Register / Outward Invoices",
    subtitle: "Excel sheet or CSV of all sales bills issued during period",
    required: true,
    iconName: "arrow-up-circle-outline",
    category: "financial",
  },
  {
    id: "purchase_register",
    backendType: "PURCHASE_INVOICES",
    name: "Purchase Register / Inward Invoices",
    subtitle: "Inward supply invoices for claiming Input Tax Credit (ITC)",
    required: true,
    iconName: "arrow-down-circle-outline",
    category: "financial",
  },
  {
    id: "gstr2b_summary",
    backendType: "GSTR_2B_ITC_STATEMENT",
    name: "GSTR-2B Statement (Optional)",
    subtitle: "Portal generated auto-drafted ITC statement if downloaded",
    required: false,
    iconName: "document-text-outline",
    category: "compliance",
  },
  {
    id: "bank_statement",
    backendType: "BANK_STATEMENT",
    name: "Bank Statement for Return Period",
    subtitle: "PDF bank statement to verify payment challans and turnover",
    required: false,
    iconName: "receipt-outline",
    category: "financial",
  },
];

/** 3. GST Compliance Document Requirements */
export const GST_COMPLIANCE_DOCUMENTS: GstServiceDocumentRequirement[] = [
  {
    id: "reconciliationFile1",
    backendType: "RECONCILIATION_FILE_1",
    name: "Purchase Register for Reconciliation",
    subtitle: "Detailed books purchase register for GSTR-2B matching",
    required: true,
    iconName: "git-compare-outline",
    category: "compliance",
  },
  {
    id: "reconciliationFile2",
    backendType: "RECONCILIATION_FILE_2",
    name: "Sales Register / 2B Extract",
    subtitle: "Sales register or portal JSON / Excel 2B download",
    required: false,
    iconName: "sync-outline",
    category: "compliance",
  },
  {
    id: "noticeFile",
    backendType: "NOTICE_FILE",
    name: "Department Notice Copy",
    subtitle: "Official GST department notice (ASMT-10, DRC-01, SCN)",
    required: false,
    iconName: "alert-circle-outline",
    category: "compliance",
  },
];

/** 4. GST Amendment Document Requirements */
export const GST_AMENDMENT_DOCUMENTS: GstServiceDocumentRequirement[] = [
  {
    id: "amendment_proof",
    backendType: "AMENDMENT_PROOF",
    name: "Documentary Proof of Amendment",
    subtitle: "Certificate / Rent agreement / Authorization corresponding to change",
    required: true,
    iconName: "document-attach-outline",
    category: "business",
  },
  {
    id: "board_resolution",
    backendType: "BOARD_RESOLUTION",
    name: "Board Resolution / Letter of Authority",
    subtitle: "Signed letter of authority for amendment submission",
    required: false,
    iconName: "shield-checkmark-outline",
    category: "compliance",
  },
];

/** 5. GST Cancellation Document Requirements */
export const GST_CANCELLATION_DOCUMENTS: GstServiceDocumentRequirement[] = [
  {
    id: "supportingProofDocument",
    backendType: "CANCELLATION_PROOF",
    name: "Cancellation Supporting Proof",
    subtitle: "Closure deed, turnover certificate, or reason proof",
    required: true,
    iconName: "close-circle-outline",
    category: "cancellation",
  },
  {
    id: "closing_stock_sheet",
    backendType: "CLOSING_STOCK_SHEET",
    name: "Closing Stock & ITC Reversal Sheet",
    subtitle: "Working sheet for ITC reversal under section 29(5)",
    required: false,
    iconName: "calculator-outline",
    category: "financial",
  },
];

/** 6. GST Certificate Document Requirements */
export const GST_CERTIFICATE_DOCUMENTS: GstServiceDocumentRequirement[] = [
  {
    id: "pan_proof",
    backendType: "PAN_CARD",
    name: "Applicant / Business PAN Proof",
    subtitle: "Copy of PAN card for verification",
    required: true,
    iconName: "card-outline",
    category: "identity",
  },
  {
    id: "existing_reg06",
    backendType: "EXISTING_REG_06",
    name: "Existing Certificate Copy (If available)",
    subtitle: "Previous REG-06 or acknowledgement number",
    required: false,
    iconName: "ribbon-outline",
    category: "business",
  },
];

/** Helper to get initial document state for a specific GST service */
export function getInitialGstDocuments(serviceId: string): GstApplicationDocumentItem[] {
  let reqs: GstServiceDocumentRequirement[] = [];
  switch (serviceId) {
    case "gst-registration":
      reqs = GST_REGISTRATION_DOCUMENTS;
      break;
    case "gst-filing":
      reqs = GST_FILING_DOCUMENTS;
      break;
    case "gst-compliance":
      reqs = GST_COMPLIANCE_DOCUMENTS;
      break;
    case "gst-amendment":
      reqs = GST_AMENDMENT_DOCUMENTS;
      break;
    case "gst-cancellation":
      reqs = GST_CANCELLATION_DOCUMENTS;
      break;
    case "gst-certificate":
      reqs = GST_CERTIFICATE_DOCUMENTS;
      break;
    default:
      reqs = GST_REGISTRATION_DOCUMENTS;
  }

  return reqs.map((r) => ({
    ...r,
    status: "Pending",
  }));
}
