import { TdsDocumentItem } from "../types/tdsDocuments.types";

export const INITIAL_TDS_DOCUMENTS: TdsDocumentItem[] = [
  {
    id: "pan",
    title: "Business PAN",
    subtitle: "Permanent Account Number Card • up to 2 MB",
    isMandatory: true,
    acceptedFormats: "PDF, JPG, PNG • max 2 MB",
    allowedExtensions: ["pdf", "jpg", "jpeg", "png"],
    iconType: "pan",
    status: "not_uploaded",
  },
  {
    id: "aadhaar",
    title: "Aadhaar Card",
    subtitle: "Aadhaar Card • up to 2 MB",
    isMandatory: true,
    acceptedFormats: "PDF, JPG, PNG • max 2 MB",
    allowedExtensions: ["pdf", "jpg", "jpeg", "png"],
    iconType: "pan", // Reusing iconType if 'aadhaar' doesn't exist yet
    status: "not_uploaded",
  },
  
];
