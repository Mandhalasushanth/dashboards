import { SelectOption, TdsFormData } from "../types/tdsForm.types";

export const ASSESSMENT_YEAR_OPTIONS: SelectOption[] = [
  { label: "AY 2025-26 (FY 2024-25)", value: "2025-26", description: "Current filing year" },
  { label: "AY 2024-25 (FY 2023-24)", value: "2024-25", description: "Updated/delayed return" },
  { label: "AY 2023-24 (FY 2022-23)", value: "2023-24", description: "Past year refund claim" },
  { label: "AY 2022-23 (FY 2021-22)", value: "2022-23", description: "Past year refund claim" },
];

export const TDS_SECTION_OPTIONS: SelectOption[] = [
  { label: "Section 192 - Salary", value: "192", description: "Tax deducted by employer on salary" },
  { label: "Section 194A - Interest on Fixed Deposits / Savings", value: "194A", description: "Tax deducted by bank on interest" },
  { label: "Section 194C - Payments to Contractors / Freelancers", value: "194C", description: "Contracts and sub-contract payments" },
  { label: "Section 194H - Commission or Brokerage", value: "194H", description: "Commission on sales, insurance, etc." },
  { label: "Section 194I - Rent on Land, Building or Furniture", value: "194I", description: "Rent paid to resident landlord" },
  { label: "Section 194J - Professional & Technical Fees", value: "194J", description: "Professional services and consultancy" },
  { label: "Section 194Q - Purchase of Goods", value: "194Q", description: "Payment for purchase of goods exceeding ₹50L" },
  { label: "Other Sections", value: "OTHER", description: "Other tax deducted at source sections" },
];
export const TDS_SECTIONS_OPTIONS = TDS_SECTION_OPTIONS;

export const PREVIOUS_ITR_FILED_OPTIONS: SelectOption[] = [
  { label: "Yes, already filed ITR for this year", value: "YES" },
  { label: "No, return has not been filed yet", value: "NO" },
];
export const PREVIOUS_ITR_OPTIONS = PREVIOUS_ITR_FILED_OPTIONS;


export const INITIAL_TDS_FORM_DATA: TdsFormData = {
  panNumber: "",
  assessmentYear: "",
  totalIncome: "",
  totalDeductions: "",
  deductorName: "",
  deductorTan: "",
  tdsAmount: "",
  deductedSection: "",
  bankName: "",
  accountNumber: "",
  ifscCode: "",
  previousItrFiled: "",
};
