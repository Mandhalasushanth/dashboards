export type PreviousYearDocIconType =
  | "pan"
  | "aadhaar"
  | "form16"
  | "ais"
  | "bank"
  | "investment";

export interface PreviousYearDocItem {
  id: string;
  title: string;
  subtitle: string;
  iconType: PreviousYearDocIconType;
  isMandatory: boolean;
  fileUri?: string;
  fileName?: string;
  fileSize?: string;
  status: "not_uploaded" | "uploaded";
}
