export type AssessmentYearStatus = "eligible" | "closed";

export interface AssessmentYearItem {
  id: string;
  year: string;
  subtitle: string;
  status: AssessmentYearStatus;
  isEligible: boolean;
}
