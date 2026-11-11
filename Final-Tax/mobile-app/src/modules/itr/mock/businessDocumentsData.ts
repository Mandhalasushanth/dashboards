import { BusinessDocumentItem } from "../types/documentUpload.types";

export const BUSINESS_REQUIRED_DOCUMENTS: BusinessDocumentItem[] = [
  {
    id: "pan",
    title: "PAN",
    subtitle: "PDF, JPG or PNG · up to 10 MB",
    iconType: "pan",
    status: "not_uploaded",
  },
  {
    id: "aadhaar",
    title: "Aadhaar",
    subtitle: "PDF, JPG or PNG · up to 10 MB",
    iconType: "aadhaar",
    status: "not_uploaded",
  },
  {
    id: "business_income",
    title: "Business Income",
    subtitle: "PDF, JPG or PNG · up to 10 MB",
    iconType: "business_income",
    status: "not_uploaded",
  },
  {
    id: "pnl_balance_sheet",
    title: "Profit & Loss and Balance Sheet",
    subtitle: "PDF, JPG or PNG · up to 10 MB",
    iconType: "pnl_balance_sheet",
    status: "not_uploaded",
  },
  {
    id: "bank_statements",
    title: "Bank Statements",
    subtitle: "PDF, JPG or PNG · up to 10 MB",
    iconType: "bank_statements",
    status: "not_uploaded",
  },
  {
    id: "ais",
    title: "AIS",
    subtitle: "PDF, JPG or PNG · up to 10 MB",
    iconType: "ais",
    status: "not_uploaded",
  },
  {
    id: "tis",
    title: "TIS",
    subtitle: "PDF, JPG or PNG · up to 10 MB",
    iconType: "tis",
    status: "not_uploaded",
  },
];
