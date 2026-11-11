import { RequiredDocumentItem } from "../types/incomeDetails.types";

export const ASSESSMENT_YEARS = [
  { label: "2025-2026 (Current Assessment Year)", value: "2025-2026" },
  { label: "2024-2025 (Previous Assessment Year)", value: "2024-2025" },
  { label: "2023-2024", value: "2023-2024" },
  { label: "2022-2023", value: "2022-2023" },
];

export const BUSINESS_INCOME_DOCUMENTS: RequiredDocumentItem[] = [
  {
    id: "pnl",
    title: "Profit & Loss Statement",
    subtitle: "PDF, JPG or PNG • up to 10 MB",
    iconType: "pnl",
  },
  {
    id: "balance_sheet",
    title: "Balance Sheet",
    subtitle: "PDF, JPG or PNG • up to 10 MB",
    iconType: "balance_sheet",
  },
  {
    id: "bank_statements",
    title: "Bank Statements",
    subtitle: "PDF, JPG or PNG • up to 10 MB",
    iconType: "bank",
  },
  {
    id: "ais",
    title: "AIS Statement",
    subtitle: "PDF, JPG or PNG • up to 10 MB",
    iconType: "ais",
  },
  {
    id: "tis",
    title: "TIS Statement",
    subtitle: "PDF, JPG or PNG • up to 10 MB",
    iconType: "tis",
  },
];

export const SALARIED_DOCUMENTS: RequiredDocumentItem[] = [
  {
    id: "form16",
    title: "Form 16 (Part A & B)",
    subtitle: "PDF, JPG or PNG • up to 10 MB",
    iconType: "form16",
  },
  {
    id: "salary_slips",
    title: "Salary Slips",
    subtitle: "PDF, JPG or PNG • up to 10 MB",
    iconType: "salary_slip",
  },
  {
    id: "bank_statements",
    title: "Bank Statements",
    subtitle: "PDF, JPG or PNG • up to 10 MB",
    iconType: "bank",
  },
  {
    id: "ais",
    title: "AIS Statement",
    subtitle: "PDF, JPG or PNG • up to 10 MB",
    iconType: "ais",
  },
  {
    id: "tis",
    title: "TIS Statement",
    subtitle: "PDF, JPG or PNG • up to 10 MB",
    iconType: "tis",
  },
];

export function getDocumentsForCategory(categoryId?: string): RequiredDocumentItem[] {
  if (categoryId === "salaried") {
    return SALARIED_DOCUMENTS;
  }
  return BUSINESS_INCOME_DOCUMENTS;
}
