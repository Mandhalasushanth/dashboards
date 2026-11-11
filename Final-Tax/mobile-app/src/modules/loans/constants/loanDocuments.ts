import type { BusinessLoanType, BusinessLoanFormData } from "../businessWorkingCapital/types/businessLoan.types";
import type { PersonalLoanFormData } from "../personalLoan/types/personalLoan.types";
import { isProjectCostRequired } from "../businessWorkingCapital/validation/businessLoanValidation";
import type {
  LoanDocumentRequirement,
  LoanDocumentSource,
} from "../types/loanReview.types";

export const DEFAULT_ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg",
];

export const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const PDF_ONLY_MIME_TYPES = ["application/pdf"];
export const PDF_ONLY_UPLOAD_SOURCES: LoanDocumentSource[] = ["files"];

export const ALL_UPLOAD_SOURCES: LoanDocumentSource[] = ["files", "camera"];

/** What a rule contributes for a given application: name, copy and whether it blocks Continue. */
type ResolvedRule = Pick<
  LoanDocumentRequirement,
  "name" | "description" | "isMandatory"
>;

interface LoanDocumentRule {
  id: string;
  icon: LoanDocumentRequirement["icon"];
  resolve: (form: BusinessLoanFormData) => ResolvedRule;
}

const PAN_RULE: LoanDocumentRule = {
  id: "pan_card",
  icon: "card-outline",
  resolve: () => ({
    name: "Business / Promoter PAN Card",
    description: "Entity or proprietor PAN for verification & KYC appraisal",
    isMandatory: true,
  }),
};

/**
 * Configuration of the documents each facility needs, in display order.
 * A rule may depend on the data entered on the business details screen; nothing else
 * (no UI conditionals) decides which documents are shown.
 */
const DOCUMENT_RULES: Record<BusinessLoanType, LoanDocumentRule[]> = {
  "business-loan": [
    PAN_RULE,
    {
      id: "business_proof",
      icon: "business-outline",
      resolve: () => ({
        name: "Business Registration Proof",
        description:
          "Udyam Registration, Certificate of Incorporation, or Trade License",
        isMandatory: true,
      }),
    },
    {
      id: "bank_statement",
      icon: "receipt-outline",
      resolve: () => ({
        name: "Business Bank Statement (Last 6 Months)",
        description:
          "Primary current account statements for operational validation",
        isMandatory: false,
      }),
    },
    {
      id: "project_quotation",
      icon: "document-text-outline",
      resolve: (form) => {
        const isMandatory = isProjectCostRequired(form.businessLoan.purpose);
        return {
          name: "Equipment Quotation / Project Estimate",
          description: isMandatory
            ? "Proforma invoice or vendor quotation required for sanctioning"
            : "Vendor invoice or quotation if available",
          isMandatory,
        };
      },
    },
  ],
  "working-capital": [
    PAN_RULE,
    {
      id: "bank_statement",
      icon: "receipt-outline",
      resolve: () => ({
        name: "Business Bank Statement (Last 12 Months)",
        description:
          "Primary operating bank statement required for CC/OD limit appraisal",
        isMandatory: true,
      }),
    },
    {
      id: "gst_certificate",
      icon: "shield-checkmark-outline",
      resolve: (form) => {
        const isGstRegistered = form.businessProfile.isGstRegistered;
        return {
          name: isGstRegistered
            ? "GST Registration Certificate"
            : "Business License / Trade Proof",
          description: isGstRegistered
            ? "GST certificate or latest GSTR filing acknowledgment"
            : "Local authority trade license or shop establishment certificate",
          isMandatory: true,
        };
      },
    },
    {
      id: "financial_statements",
      icon: "stats-chart-outline",
      resolve: () => ({
        name: "Audited Financials / P&L (Last 2 Years)",
        description:
          "Audited balance sheet & ITR filings for credit underwriting",
        isMandatory: false,
      }),
    },
  ],
};

/** The documents required (and optional) for this loan type and business details. */
export function getRequiredDocuments(
  loanType: BusinessLoanType,
  businessFormData: BusinessLoanFormData
): LoanDocumentRequirement[] {
  return DOCUMENT_RULES[loanType].map((rule) => ({
    id: rule.id,
    icon: rule.icon,
    ...rule.resolve(businessFormData),
    allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
    maxSizeBytes: MAX_DOCUMENT_SIZE_BYTES,
    uploadSources: ALL_UPLOAD_SOURCES,
  }));
}

/**
 * Resolves document checklist for Personal Loans.
 * - Salaried with bank salary credit -> Bank statement required.
 * - Salaried with cash/cheque -> Bank statement is optional (never blocked).
 * - Self employed -> Bank statement and ITR are optional.
 */
export function getPersonalLoanDocuments(
  formData: PersonalLoanFormData
): LoanDocumentRequirement[] {
  const isSalaried = formData.employmentType === "salaried";
  const isBankCredited =
    isSalaried && formData.salaryCreditMethod === "Bank Account";

  const docs: LoanDocumentRequirement[] = [
    {
      id: "pan_card",
      icon: "card-outline",
      name: "Applicant PAN Card",
      description: "PAN card for identity and credit bureau evaluation",
      isMandatory: true,
      allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
      maxSizeBytes: MAX_DOCUMENT_SIZE_BYTES,
      uploadSources: ALL_UPLOAD_SOURCES,
    },
  ];

  if (isSalaried) {
    docs.push({
      id: "bank_statement",
      icon: "receipt-outline",
      name: "Salary Bank Statement (Last 3 Months)",
      description: isBankCredited
        ? "Latest 3 months salary account statement showing regular credits"
        : "Latest bank statement (optional for cash/cheque salary receipt)",
      isMandatory: isBankCredited,
      allowedMimeTypes: PDF_ONLY_MIME_TYPES,
      maxSizeBytes: MAX_DOCUMENT_SIZE_BYTES,
      uploadSources: PDF_ONLY_UPLOAD_SOURCES,
    });
  } else {
    docs.push({
      id: "bank_statement",
      icon: "receipt-outline",
      name: "Bank Statement (Last 6 Months)",
      description:
        "Operational bank statement showing profession or business inflows",
      isMandatory: false,
      allowedMimeTypes: PDF_ONLY_MIME_TYPES,
      maxSizeBytes: MAX_DOCUMENT_SIZE_BYTES,
      uploadSources: PDF_ONLY_UPLOAD_SOURCES,
    });

    docs.push({
      id: "itr_acknowledgment",
      icon: "stats-chart-outline",
      name: "ITR Acknowledgment / Computation (Optional)",
      description:
        "Latest ITR filing acknowledgment (optional, does not block loan sanction)",
      isMandatory: false,
      allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
      maxSizeBytes: MAX_DOCUMENT_SIZE_BYTES,
      uploadSources: ALL_UPLOAD_SOURCES,
    });
  }

  return docs;
}

export { getPropertyLoanDocuments } from "../homeLoan/constants/homeLoanDocuments";
