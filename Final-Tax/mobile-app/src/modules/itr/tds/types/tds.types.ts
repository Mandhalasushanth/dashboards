export interface TdsBenefitItem {
  id: string;
  title: string;
  description: string;
  iconName: "wallet-outline" | "ribbon-outline" | "time-outline" | "analytics-outline";
}

export interface TdsProcessStep {
  id: number;
  label: string;
  iconName: "create-outline" | "cloud-upload-outline" | "person-outline" | "send-outline" | "business-outline";
}

export interface TdsDocumentItem {
  id: string;
  title: string;
  iconType: "card" | "aadhaar" | "form16" | "chart" | "document" | "bank" | "salary" | "more";
  isMore?: boolean;
}
