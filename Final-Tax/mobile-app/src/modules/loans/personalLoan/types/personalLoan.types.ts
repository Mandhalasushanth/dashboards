export type PersonalEmploymentType = "salaried" | "self-employed";

export type SalaryCreditMethod = "Bank Account" | "Cash" | "Cheque";

export interface PersonalLoanFormData {
  employmentType: PersonalEmploymentType;
  // Salaried fields
  employerName: string;
  companyName: string;
  jobType: string;
  monthlyNetSalary: string;
  monthlySalary: string;
  workExperience: string;
  salaryCreditMethod: SalaryCreditMethod | "";
  // Self-employed fields
  businessOrProfessionName: string;
  professionName: string;
  natureOfBusiness: string;
  averageMonthlyIncome: string;
  monthlyIncome: string;
  yearsInBusiness: string;
  // Loan requirements
  loanAmount: string;
  requestedAmount?: string;
  // Optional / legacy fields
  purpose?: string;
  purposeOther?: string;
}

export type PersonalLoanErrors = Partial<
  Record<keyof PersonalLoanFormData, string>
>;

export const SALARY_CREDIT_METHOD_OPTIONS: readonly SalaryCreditMethod[] = [
  "Bank Account",
  "Cash",
  "Cheque",
] as const;

export const JOB_TYPE_OPTIONS: readonly string[] = [
  "Private",
  "Government",
  "Public Sector",
  "Self-Employed Professional",
  "Other",
] as const;

export const WORK_EXPERIENCE_OPTIONS: readonly string[] = [
  "Less than 1 year",
  "1 - 3 years",
  "3 - 5 years",
  "5+ years",
] as const;

export const NATURE_OF_BUSINESS_OPTIONS: readonly string[] = [
  "Trading",
  "Services",
  "Manufacturing",
  "Retail",
  "Professional",
  "Other",
] as const;

export const YEARS_IN_BUSINESS_OPTIONS: readonly string[] = [
  "Less than 1 year",
  "1 - 2 years",
  "3 - 5 years",
  "5+ years",
] as const;

export const PERSONAL_LOAN_PURPOSE_OPTIONS: readonly string[] = [
  "Medical Expenses",
  "Education",
  "Wedding",
  "Home Renovation",
  "Travel",
  "Debt Consolidation",
  "Emergency Expenses",
  "Consumer Purchase",
  "Other",
] as const;
