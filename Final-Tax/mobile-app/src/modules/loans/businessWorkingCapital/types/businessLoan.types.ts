export type BusinessLoanType = "business-loan" | "working-capital";

export const BUSINESS_CONSTITUTION_OPTIONS = [
  "Proprietorship",
  "Partnership",
  "LLP",
  "Private Limited Company",
  "Other",
] as const;

export const BUSINESS_ACTIVITY_OPTIONS = [
  "Trading",
  "Manufacturing",
  "Retail",
  "Services",
  "Other",
] as const;

export const BUSINESS_LOAN_PURPOSE_OPTIONS = [
  "Business Expansion",
  "Equipment Purchase",
  "Renovation",
  "Inventory Purchase",
  "Business Setup",
  "Other",
] as const;

export const WORKING_CAPITAL_PURPOSE_OPTIONS = [
  "Inventory Purchase",
  "Supplier Payments",
  "Operating Expenses",
  "Payroll",
  "Cash-Flow Gap",
  "Seasonal Business Needs",
  "Other",
] as const;

export type BusinessConstitution =
  (typeof BUSINESS_CONSTITUTION_OPTIONS)[number];
export type BusinessActivity = (typeof BUSINESS_ACTIVITY_OPTIONS)[number];
export type BusinessLoanPurpose = (typeof BUSINESS_LOAN_PURPOSE_OPTIONS)[number];
export type WorkingCapitalPurpose =
  (typeof WORKING_CAPITAL_PURPOSE_OPTIONS)[number];

export interface CommonBusinessProfile {
  businessName: string;
  constitution: BusinessConstitution | "";
  constitutionOther: string;
  businessActivity: BusinessActivity | "";
  activityOther: string;
  establishmentDate: string;
  businessAddress: string;
  pincode: string;
  isGstRegistered: boolean;
  gstin: string;
  udyamRegistration: string;
}

export interface BusinessLoanDetails {
  loanAmount: string;
  purpose: BusinessLoanPurpose | "";
  purposeOther: string;
  purposeDescription: string;
  projectCost: string;
}

export interface WorkingCapitalDetails {
  loanAmount: string;
  purpose: WorkingCapitalPurpose | "";
  purposeOther: string;
  purposeDescription: string;
  monthlySales: string;
  monthlyExpenses: string;
}

export interface BusinessLoanFormData {
  loanType: BusinessLoanType;
  businessProfile: CommonBusinessProfile;
  businessLoan: BusinessLoanDetails;
  workingCapital: WorkingCapitalDetails;
}

export type BusinessLoanErrors = Record<string, string | undefined>;
