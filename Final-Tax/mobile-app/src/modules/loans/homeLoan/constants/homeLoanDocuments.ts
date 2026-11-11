import type {
  LoanDocumentRequirement,
  LoanDocumentSource,
} from "../../types/loanReview.types";

export const DEFAULT_ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg",
];

export const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const ALL_UPLOAD_SOURCES: LoanDocumentSource[] = ["files", "camera"];

/**
 * Returns dynamic document checklist for Property / Home Loans based on selected loan purpose.
 * Minimum documents only to qualify lead and allow lender follow-up:
 * - Home Purchase: Property/Sale agreement (Req) + Bank statement (Req), Builder quotation (Opt), Additional (Opt)
 * - Home Construction: Property ownership (Req), Construction doc (Opt), Building plan (Opt), Estimate (Opt), Additional (Opt)
 * - Home Renovation: Property ownership (Req), Renovation estimate (Opt), Contractor quote (Opt), Additional (Opt)
 * - Plot Purchase: Plot/Property doc (Req), Sale agreement (Opt), Quotation (Opt), Additional (Opt)
 * - Plot + Construction: Plot ownership (Req), Construction estimate (Opt), Building plan (Opt), Sale agreement (Opt)
 * - Balance Transfer: Existing loan statement (Req), Property doc (Opt), Foreclosure statement (Opt)
 */
export function getPropertyLoanDocuments(
  formData?: { purpose?: string }
): LoanDocumentRequirement[] {
  const rawPurpose = (formData?.purpose || "").toLowerCase().trim();

  // A. Home Purchase
  if (
    rawPurpose === "purchase a new home" ||
    rawPurpose === "purchase a resale home" ||
    rawPurpose === "home purchase" ||
    (rawPurpose.includes("purchase") && !rawPurpose.includes("plot")) ||
    rawPurpose.includes("resale") ||
    rawPurpose.includes("new home")
  ) {
    return [
      {
        id: "property_document",
        icon: "home-outline",
        name: "Property / Sale Agreement Document",
        description: "Upload the property document available with you.",
        isMandatory: true,
        allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
        maxSizeBytes: MAX_DOCUMENT_SIZE_BYTES,
        uploadSources: ALL_UPLOAD_SOURCES,
      },
      {
        id: "bank_statement",
        icon: "receipt-outline",
        name: "Bank Statement / Income Document",
        description: "Latest 6 months bank statement showing regular credits or operational funds",
        isMandatory: true,
        allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
        maxSizeBytes: MAX_DOCUMENT_SIZE_BYTES,
        uploadSources: ALL_UPLOAD_SOURCES,
      },
      {
        id: "property_quotation",
        icon: "document-text-outline",
        name: "Property Quotation / Builder Document",
        description: "Builder quotation, cost sheet or demand letter if available",
        isMandatory: false,
        allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
        maxSizeBytes: MAX_DOCUMENT_SIZE_BYTES,
        uploadSources: ALL_UPLOAD_SOURCES,
      },
      {
        id: "additional_property_doc",
        icon: "folder-outline",
        name: "Additional Property Document",
        description: "Any other property records, tax receipts or possession letters",
        isMandatory: false,
        allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
        maxSizeBytes: MAX_DOCUMENT_SIZE_BYTES,
        uploadSources: ALL_UPLOAD_SOURCES,
      },
    ];
  }

  // B. Home Construction
  if (
    rawPurpose === "construct a house" ||
    rawPurpose === "home construction" ||
    (rawPurpose.includes("construct") && !rawPurpose.includes("plot"))
  ) {
    return [
      {
        id: "property_ownership",
        icon: "shield-checkmark-outline",
        name: "Property Ownership Document",
        description: "Title deed, allotment letter or land ownership proof",
        isMandatory: true,
        allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
        maxSizeBytes: MAX_DOCUMENT_SIZE_BYTES,
        uploadSources: ALL_UPLOAD_SOURCES,
      },
      {
        id: "construction_document",
        icon: "construct-outline",
        name: "Construction Document (If Available)",
        description: "Contractor agreement, quotation or estimate if available",
        isMandatory: false,
        allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
        maxSizeBytes: MAX_DOCUMENT_SIZE_BYTES,
        uploadSources: ALL_UPLOAD_SOURCES,
      },
      {
        id: "building_plan",
        icon: "map-outline",
        name: "Sanctioned Building Plan",
        description: "Approved architectural plan or municipal sanctioned layout",
        isMandatory: false,
        allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
        maxSizeBytes: MAX_DOCUMENT_SIZE_BYTES,
        uploadSources: ALL_UPLOAD_SOURCES,
      },
      {
        id: "construction_estimate",
        icon: "calculator-outline",
        name: "Construction Cost Estimate",
        description: "Civil work estimate or architect valuation",
        isMandatory: false,
        allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
        maxSizeBytes: MAX_DOCUMENT_SIZE_BYTES,
        uploadSources: ALL_UPLOAD_SOURCES,
      },
      {
        id: "additional_property_doc",
        icon: "folder-outline",
        name: "Additional Property Document",
        description: "Any additional land records or construction permits",
        isMandatory: false,
        allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
        maxSizeBytes: MAX_DOCUMENT_SIZE_BYTES,
        uploadSources: ALL_UPLOAD_SOURCES,
      },
    ];
  }

  // C. Home Renovation
  if (rawPurpose === "home renovation" || rawPurpose.includes("renovation")) {
    return [
      {
        id: "property_ownership",
        icon: "home-outline",
        name: "Property Ownership Document",
        description: "Title deed, sale deed or ownership proof",
        isMandatory: true,
        allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
        maxSizeBytes: MAX_DOCUMENT_SIZE_BYTES,
        uploadSources: ALL_UPLOAD_SOURCES,
      },
      {
        id: "renovation_estimate",
        icon: "calculator-outline",
        name: "Renovation Cost Estimate",
        description: "Estimated cost breakdown for repair or renovation work",
        isMandatory: false,
        allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
        maxSizeBytes: MAX_DOCUMENT_SIZE_BYTES,
        uploadSources: ALL_UPLOAD_SOURCES,
      },
      {
        id: "contractor_quotation",
        icon: "document-text-outline",
        name: "Contractor Quotation",
        description: "Quotation from contractor, interior designer or architect",
        isMandatory: false,
        allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
        maxSizeBytes: MAX_DOCUMENT_SIZE_BYTES,
        uploadSources: ALL_UPLOAD_SOURCES,
      },
      {
        id: "additional_property_doc",
        icon: "folder-outline",
        name: "Additional Property Document",
        description: "Any additional property records or layout drawings",
        isMandatory: false,
        allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
        maxSizeBytes: MAX_DOCUMENT_SIZE_BYTES,
        uploadSources: ALL_UPLOAD_SOURCES,
      },
    ];
  }

  // D. Plot Purchase
  if (rawPurpose === "plot purchase" || (rawPurpose.includes("plot") && !rawPurpose.includes("construct"))) {
    return [
      {
        id: "plot_document",
        icon: "map-outline",
        name: "Plot / Property Document",
        description: "Allotment letter, title deed or plot agreement",
        isMandatory: true,
        allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
        maxSizeBytes: MAX_DOCUMENT_SIZE_BYTES,
        uploadSources: ALL_UPLOAD_SOURCES,
      },
      {
        id: "sale_agreement",
        icon: "document-text-outline",
        name: "Sale Agreement",
        description: "Executed or draft agreement to sell if available",
        isMandatory: false,
        allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
        maxSizeBytes: MAX_DOCUMENT_SIZE_BYTES,
        uploadSources: ALL_UPLOAD_SOURCES,
      },
      {
        id: "plot_quotation",
        icon: "receipt-outline",
        name: "Plot Quotation / Cost Sheet",
        description: "Developer price list, plot quotation or allotment receipt",
        isMandatory: false,
        allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
        maxSizeBytes: MAX_DOCUMENT_SIZE_BYTES,
        uploadSources: ALL_UPLOAD_SOURCES,
      },
      {
        id: "additional_property_doc",
        icon: "folder-outline",
        name: "Additional Property Document",
        description: "Any layout approvals, 7/12 extract or patta copy",
        isMandatory: false,
        allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
        maxSizeBytes: MAX_DOCUMENT_SIZE_BYTES,
        uploadSources: ALL_UPLOAD_SOURCES,
      },
    ];
  }

  // E. Plot + Construction
  if (
    rawPurpose === "plot + construction" ||
    rawPurpose === "plot and construction" ||
    (rawPurpose.includes("plot") && rawPurpose.includes("construct"))
  ) {
    return [
      {
        id: "plot_ownership",
        icon: "shield-checkmark-outline",
        name: "Plot / Property Ownership Document",
        description: "Registered title deed, allotment letter or sale deed of plot",
        isMandatory: true,
        allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
        maxSizeBytes: MAX_DOCUMENT_SIZE_BYTES,
        uploadSources: ALL_UPLOAD_SOURCES,
      },
      {
        id: "construction_estimate",
        icon: "calculator-outline",
        name: "Construction Cost Estimate",
        description: "Civil construction cost estimate or architect BOQ",
        isMandatory: false,
        allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
        maxSizeBytes: MAX_DOCUMENT_SIZE_BYTES,
        uploadSources: ALL_UPLOAD_SOURCES,
      },
      {
        id: "building_plan",
        icon: "map-outline",
        name: "Sanctioned Building Plan",
        description: "Approved floor plan or blueprint from local authority",
        isMandatory: false,
        allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
        maxSizeBytes: MAX_DOCUMENT_SIZE_BYTES,
        uploadSources: ALL_UPLOAD_SOURCES,
      },
      {
        id: "sale_agreement",
        icon: "document-text-outline",
        name: "Sale Agreement / Allotment Letter",
        description: "Purchase agreement for the plot if recently acquired",
        isMandatory: false,
        allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
        maxSizeBytes: MAX_DOCUMENT_SIZE_BYTES,
        uploadSources: ALL_UPLOAD_SOURCES,
      },
    ];
  }

  // F. Balance Transfer
  if (rawPurpose === "balance transfer" || rawPurpose.includes("transfer")) {
    return [
      {
        id: "existing_loan_statement",
        icon: "receipt-outline",
        name: "Existing Loan Statement / Account Document",
        description: "Latest 12 months loan repayment account statement (SOA)",
        isMandatory: true,
        allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
        maxSizeBytes: MAX_DOCUMENT_SIZE_BYTES,
        uploadSources: ALL_UPLOAD_SOURCES,
      },
      {
        id: "property_document",
        icon: "home-outline",
        name: "Property Document Copy",
        description: "Copy of sale deed, title deed or possession letter",
        isMandatory: false,
        allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
        maxSizeBytes: MAX_DOCUMENT_SIZE_BYTES,
        uploadSources: ALL_UPLOAD_SOURCES,
      },
      {
        id: "foreclosure_statement",
        icon: "stats-chart-outline",
        name: "Foreclosure / Outstanding Statement",
        description: "Foreclosure statement or list of documents (LOD)",
        isMandatory: false,
        allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
        maxSizeBytes: MAX_DOCUMENT_SIZE_BYTES,
        uploadSources: ALL_UPLOAD_SOURCES,
      },
    ];
  }

  // Default fallback (e.g. empty or general property loan)
  return [
    {
      id: "property_document",
      icon: "home-outline",
      name: "Property / Sale Agreement Document",
      description: "Upload the property document available with you.",
      isMandatory: true,
      allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
      maxSizeBytes: MAX_DOCUMENT_SIZE_BYTES,
      uploadSources: ALL_UPLOAD_SOURCES,
    },
    {
      id: "bank_statement",
      icon: "receipt-outline",
      name: "Bank Statement / Income Document",
      description: "Latest 6 months bank statement showing income or operational funds",
      isMandatory: true,
      allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
      maxSizeBytes: MAX_DOCUMENT_SIZE_BYTES,
      uploadSources: ALL_UPLOAD_SOURCES,
    },
    {
      id: "property_quotation",
      icon: "document-text-outline",
      name: "Property Quotation / Builder Document",
      description: "Builder quotation, cost sheet or demand letter if available",
      isMandatory: false,
      allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
      maxSizeBytes: MAX_DOCUMENT_SIZE_BYTES,
      uploadSources: ALL_UPLOAD_SOURCES,
    },
    {
      id: "additional_property_doc",
      icon: "folder-outline",
      name: "Additional Property Document",
      description: "Any other property records, tax receipts or possession letters",
      isMandatory: false,
      allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
      maxSizeBytes: MAX_DOCUMENT_SIZE_BYTES,
      uploadSources: ALL_UPLOAD_SOURCES,
    },
  ];
}
