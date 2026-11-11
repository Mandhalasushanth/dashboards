/**
 * Configuration: GST Filing Documents
 * Initial documents and schema definitions for the GST Filing workflow.
 */

import { BrandColors } from "@/shared/theme";

export type DocumentBadgeType =
  | "Required"
  | "Recommended"
  | "Conditional"
  | "Optional";

export interface FilingDocItem {
  id: string;
  name: string;
  subtitle: string;
  required: boolean;
  badgeType?: DocumentBadgeType;
  iconName: string;
  iconBg: string;
  iconColor: string;
  category:
    | "Sales & Outward Supplies"
    | "Purchases & Input Tax"
    | "Banking & Reconciliation"
    | "Statutory & Compliance";
  fileUri?: string;
  fileName?: string;
  fileSize?: string;
  uploadedAt?: string;
}

export const INITIAL_FILING_DOCS: FilingDocItem[] = [
  {
    id: "sales-invoices",
    name: "Sales Invoices / Register",
    subtitle: "Outward supply bill book / tax invoices",
    required: true,
    badgeType: "Required",
    iconName: "document-text",
    iconBg: "#E0F2FE",
    iconColor: "#0284C7",
    category: "Sales & Outward Supplies",
  },
  {
    id: "credit-notes",
    name: "Credit Notes",
    subtitle: "Issued during the period for sales returns",
    required: true,
    badgeType: "Required",
    iconName: "arrow-undo",
    iconBg: "#FEF3C7",
    iconColor: "#D97706",
    category: "Sales & Outward Supplies",
  },
  {
    id: "debit-notes",
    name: "Debit Notes",
    subtitle: "Issued for rate differences or added tax",
    required: true,
    badgeType: "Required",
    iconName: "arrow-redo",
    iconBg: "#FEF3C7",
    iconColor: "#D97706",
    category: "Sales & Outward Supplies",
  },
  {
    id: "e-invoice",
    name: "E-Invoice Data (IRN)",
    subtitle: "JSON / PDF files where applicable for B2B",
    required: true,
    badgeType: "Required",
    iconName: "barcode-outline",
    iconBg: "#E0F2FE",
    iconColor: "#2563EB",
    category: "Sales & Outward Supplies",
  },
  {
    id: "e-way-bill",
    name: "E-Way Bill Data",
    subtitle: "Consolidated transit bills for goods movement",
    required: true,
    badgeType: "Required",
    iconName: "car-outline",
    iconBg: "#E0F2FE",
    iconColor: "#2563EB",
    category: "Sales & Outward Supplies",
  },
  {
    id: "purchase-invoices",
    name: "Purchase Invoices / Register",
    subtitle: "Inward supply tax invoices with GSTIN",
    required: true,
    badgeType: "Required",
    iconName: "file-tray-full",
    iconBg: "#DCFCE7",
    iconColor: "#16A34A",
    category: "Purchases & Input Tax",
  },
  {
    id: "gstr-2b",
    name: "GSTR-2B ITC Statement",
    subtitle: "Auto-drafted ITC statement from GST portal",
    required: true,
    badgeType: "Required",
    iconName: "shield-checkmark-outline",
    iconBg: "#DCFCE7",
    iconColor: "#16A34A",
    category: "Purchases & Input Tax",
  },
  {
    id: "expense-bills",
    name: "Expense Invoices & Vouchers",
    subtitle: "Electricity, telephone, logistics, rent",
    required: true,
    badgeType: "Required",
    iconName: "receipt",
    iconBg: "#F3E8FF",
    iconColor: "#7E22CE",
    category: "Purchases & Input Tax",
  },
  {
    id: "bank-statement",
    name: "Bank Statement / Passbook",
    subtitle: "Monthly statement showing sales & expense flows",
    required: true,
    badgeType: "Required",
    iconName: "business",
    iconBg: "#FEF0E6",
    iconColor: BrandColors.PRIMARY_ORANGE,
    category: "Banking & Reconciliation",
  },
  {
    id: "prev-gst-returns",
    name: "Previous GST Returns",
    subtitle: "Copies of previous GSTR-1 & GSTR-3B filings",
    required: true,
    badgeType: "Required",
    iconName: "folder-open",
    iconBg: "#E0F2FE",
    iconColor: "#2563EB",
    category: "Banking & Reconciliation",
  },
  {
    id: "prev-gst-ack",
    name: "Previous Filing Acknowledgement",
    subtitle: "ARN receipt copy for ITC balance carry-forward",
    required: true,
    badgeType: "Required",
    iconName: "receipt-outline",
    iconBg: "#E0F2FE",
    iconColor: "#2563EB",
    category: "Banking & Reconciliation",
  },
  {
    id: "other-docs",
    name: "Other Supporting Documents",
    subtitle: "Challans, ledgers, or CA reconciliation notes",
    required: true,
    badgeType: "Required",
    iconName: "attach-outline",
    iconBg: "#F1F5F9",
    iconColor: "#64748B",
    category: "Statutory & Compliance",
  },
];
