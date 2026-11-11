import {
  IncomeSourcesState,
  ItrPriorFilingAndNotice,
  ItrStructuredDeductions,
  TaxesPaidDetails,
  TaxRegimeType,
  ItrDocumentItem,
  DocumentRequirementTier,
  ItrPersonalInfo,
} from "../types/itrFiling.types";

export function generateDynamicDocumentChecklist(
  sources: IncomeSourcesState,
  priorNotice: ItrPriorFilingAndNotice,
  deductions: ItrStructuredDeductions,
  taxesPaid: TaxesPaidDetails,
  regime: TaxRegimeType,
  personalInfo?: ItrPersonalInfo,
  existingDocs: ItrDocumentItem[] = []
): ItrDocumentItem[] {
  const existingMap = new Map(existingDocs.map((d) => [d.id, d]));

  const makeDoc = (
    id: string,
    name: string,
    subtitle: string,
    tier: DocumentRequirementTier,
    docGroup: "common" | "income" | "conditional",
    iconName: string = "document-text-outline",
    isProfileVerified: boolean = false,
    profileVerifiedLabel?: string
  ): ItrDocumentItem => {
    const existing = existingMap.get(id);
    return {
      id,
      name,
      subtitle,
      tier,
      required: tier === "REQUIRED",
      docGroup,
      iconName,
      fileUri: existing?.fileUri,
      fileName: existing?.fileName,
      fileSize: existing?.fileSize,
      mimeType: existing?.mimeType,
      uploadedAt: existing?.uploadedAt,
      isProfileVerified,
      profileVerifiedLabel,
    };
  };

  const hasSalary = sources.salary.enabled;
  const hasBusiness = sources.business.enabled;
  const hasCapitalGains = sources.capitalGains.enabled;
  const isOldRegime = regime === "old";
  const has80D = isOldRegime && (Number(deductions.sec80d.selfSpouseChildren || 0) > 0 || Number(deductions.sec80d.parents || 0) > 0);
  const hasHomeLoan = Number(deductions.sec24b || 0) > 0 || (sources.houseProperty.enabled && Number(sources.houseProperty.homeLoanInterest || 0) > 0);
  const hasTaxPaid = Number(taxesPaid.advanceTax || 0) > 0 || Number(taxesPaid.selfAssessmentTax || 0) > 0;

  const allCandidates: ItrDocumentItem[] = [
    // --- 1. Income-Specific Mandatory Documents ---
    makeDoc(
      "doc-form-16",
      "Form 16 (Part A & B)",
      hasSalary
        ? "Issued by your employer showing salary breakup & TDS"
        : "Not required (no salary income declared)",
      hasSalary ? "REQUIRED" : "NOT_REQUIRED",
      "income",
      "briefcase-outline"
    ),
    makeDoc(
      "doc-capital-gains",
      "Capital Gains Statement / P&L",
      hasCapitalGains
        ? "Consolidated trading statement or broker P&L report"
        : "Not required (no capital gains declared)",
      hasCapitalGains ? "REQUIRED" : "NOT_REQUIRED",
      "income",
      "trending-up-outline"
    ),
    makeDoc(
      "doc-business-turnover",
      "Business Turnover & GST Filings",
      hasBusiness
        ? "GSTR filings, sales register, or turnover statement"
        : "Not required (no business income declared)",
      hasBusiness ? "REQUIRED" : "NOT_REQUIRED",
      "income",
      "storefront-outline"
    ),

    // --- 2. Recommended Verification Documents ---
    makeDoc(
      "doc-26as",
      "Form 26AS Tax Credit Statement",
      "Helps your CA reconcile TDS credits and advance tax payments",
      "RECOMMENDED",
      "common",
      "receipt-outline"
    ),
    makeDoc(
      "doc-ais-tis",
      "AIS / TIS Statement",
      "Annual Information Statement for interest, dividends, and transactions",
      "RECOMMENDED",
      "common",
      "document-attach-outline"
    ),
    makeDoc(
      "doc-bank",
      "Bank Account Statement",
      "Recent statement for savings or current account",
      "RECOMMENDED",
      "common",
      "wallet-outline"
    ),
    makeDoc(
      "doc-salary-slips",
      "Salary Payslips",
      hasSalary
        ? "Recent salary slips to verify allowances and deductions"
        : "Not required (no salary declared)",
      hasSalary ? "RECOMMENDED" : "NOT_REQUIRED",
      "income",
      "newspaper-outline"
    ),

    // --- 3. Only If Applicable / Conditional Documents ---
    makeDoc(
      "doc-80d",
      "Health Insurance Premium Receipt (80D)",
      has80D
        ? "Receipt to support Section 80D medical insurance deduction"
        : "Not required (no 80D deduction claimed)",
      has80D ? "ONLY_IF_APPLICABLE" : "NOT_REQUIRED",
      "conditional",
      "medical-outline"
    ),
    makeDoc(
      "doc-home-loan",
      "Home Loan Interest Certificate (Sec 24b)",
      hasHomeLoan
        ? "Annual interest certificate from your lending bank"
        : "Not required (no home loan deduction claimed)",
      hasHomeLoan ? "ONLY_IF_APPLICABLE" : "NOT_REQUIRED",
      "conditional",
      "home-outline"
    ),
    makeDoc(
      "doc-prev-itr",
      "Previous Year ITR-V Acknowledgment",
      priorNotice.hasPreviousItr
        ? "To verify carried-forward losses or past filing history"
        : "Not required (no previous return declared)",
      priorNotice.hasPreviousItr ? "ONLY_IF_APPLICABLE" : "NOT_REQUIRED",
      "conditional",
      "time-outline"
    ),
    makeDoc(
      "doc-tax-notice",
      "Income Tax Notice Copy",
      priorNotice.hasTaxNotice
        ? "Copy of departmental notice u/s 143(1), 139(9), or 148"
        : "Not required (no notice received)",
      priorNotice.hasTaxNotice ? "ONLY_IF_APPLICABLE" : "NOT_REQUIRED",
      "conditional",
      "alert-circle-outline"
    ),
    makeDoc(
      "doc-challan",
      "Advance / Self-Assessment Tax Challan",
      hasTaxPaid
        ? "Challan receipt (ITNS 280) for taxes paid"
        : "Not required (no manual tax payment declared)",
      hasTaxPaid ? "ONLY_IF_APPLICABLE" : "NOT_REQUIRED",
      "conditional",
      "card-outline"
    ),
  ];

  // Preserve docs with uploaded files even when their income source is deselected.
  // If we strip them out here, the existingMap built on the next call will not
  // find them, and the uploaded file info is permanently lost.
  return allCandidates.filter((doc) => doc.tier !== "NOT_REQUIRED" || Boolean(doc.fileUri));
}
