import { ServiceCardData } from "../../../shared/components/ServiceCard";

export interface ItrServiceItem extends ServiceCardData {}

export interface ItrFilingDraft {
  assessmentYear?: string;
  profession?: string;
  incomeDetails?: Record<string, any>;
  deductions?: Record<string, any>;
  documents?: string[];
  status?: string;
  [key: string]: any;
}
