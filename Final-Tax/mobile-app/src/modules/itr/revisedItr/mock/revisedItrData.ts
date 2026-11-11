import {
  OriginalReturnDetails,
  RevisionReasonOption,
  RevisedFormFields,
  RevisedDocumentItem,
  ComputationComparisonRow,
} from "../types/revisedItr.types";

export const MOCK_ORIGINAL_RETURN: OriginalReturnDetails = {
  acknowledgementNumber: "284419250714208",
  assessmentYear: "AY 2025–26",
  filingDate: "18 Jul 2025",
  itrForm: "ITR-1 (Sahaj)",
  filingStatus: "Successfully Filed",
  grossTotalIncome: "₹8,12,400",
};

export const REVISION_REASONS: RevisionReasonOption[] = [
  {
    id: "missed_income",
    title: "Missed Income",
    subtitle: "Income not included in the original return",
    iconName: "cash-outline",
  },
  {
    id: "wrong_deduction",
    title: "Wrong Deduction",
    subtitle: "Incorrect or missed deduction",
    iconName: "document-text-outline",
  },
  {
    id: "incorrect_bank",
    title: "Incorrect Bank Details",
    subtitle: "Refund account needs correction",
    iconName: "business-outline",
  },
  {
    id: "other",
    title: "Other",
    subtitle: "Something else",
    iconName: "pencil-outline",
  },
];

export const DEFAULT_REVISED_FORM_FIELDS: RevisedFormFields = {
  salaryBusinessIncome: "",
  otherIncome: "",
  sec80c: "",
  sec80d: "",
  homeLoanInterest: "",
  bankAccount: "",
  ifsc: "",
  taxableIncome: "",
};

export const REVISED_SUPPORTING_DOCUMENTS: RevisedDocumentItem[] = [
  {
    id: "doc-1",
    title: "PAN Card",
    subtitle: "Identity verification proof",
    isMandatory: true,
    status: "not_uploaded",
  },
  {
    id: "doc-2",
    title: "Aadhaar Card",
    subtitle: "Address and identity proof",
    isMandatory: true,
    status: "not_uploaded",
  },
  {
    id: "doc-3",
    title: "Form 16 / Form 16A\n(for AY 2025–26)",
    subtitle: "Salary and tax deducted certificate",
    isMandatory: true,
    status: "not_uploaded",
  },
  {
    id: "doc-4",
    title: "AIS and TIS Statement",
    subtitle: "Annual information statement",
    isMandatory: true,
    status: "not_uploaded",
  },
  {
    id: "doc-5",
    title: "Bank Statements",
    subtitle: "Bank account / passbook proof",
    isMandatory: true,
    status: "not_uploaded",
  },
  {
    id: "doc-6",
    title: "Investment Proofs",
    subtitle: "Proofs for claimed 80C & 80D deductions",
    isMandatory: true,
    status: "not_uploaded",
  },
];

export const COMPARISON_TABLE_ROWS: ComputationComparisonRow[] = [
  {
    particular: "Gross total income",
    original: "₹8,12,400",
    revised: "₹8,68,900",
    change: "+₹56,500",
    isHighlight: true,
  },
  {
    particular: "Total deductions",
    original: "₹3,20,000",
    revised: "₹3,20,000",
    change: "—",
    isHighlight: false,
  },
  {
    particular: "Taxable income",
    original: "₹4,92,400",
    revised: "₹5,48,900",
    change: "+₹56,500",
    isHighlight: true,
  },
  {
    particular: "Tax + cess",
    original: "₹12,854",
    revised: "₹18,742",
    change: "+₹5,888",
    isHighlight: true,
  },
  {
    particular: "Taxes paid",
    original: "₹31,200",
    revised: "₹31,200",
    change: "—",
    isHighlight: false,
  },
];
