export interface TdsRefundDto {
  id?: string;
  custId?: string;
  legalBusinessName: string;
  businessPan: string;
  businessPanDocument?: string | null;
  aadhaarNumber: string;
  aadhaarDocument?: string | null;
  mobileNumber: string;
  accountHolderName: string;
  accountNumber: string;
  confirmAccountNumber?: string;
  ifscCode: string;
  bankName?: string;
  branchName?: string;
  accountType: "SAVINGS" | "CURRENT";
  createdAt?: string;
}

export type RefundBankAccountDto = TdsRefundDto;

export interface IncomeTaxInfoDto {
  id?: number;
  tdsRefundId: string;
  salaryIncome?: number;
  otherIncome?: number;
  interestIncome?: number;
  rentalIncome?: number;
  municipalTaxesPaid?: number;
  shortTermCapitalGains?: number;
  longTermCapitalGains?: number;
  grossTurnover?: number;
  netBusinessProfit?: number;
  homeLoanInterestSec24b?: number;
  deductions80C?: number;
  deductions80D?: number;
}

export interface TdsTaxesPaidDto {
  id?: number;
  custId?: string;
  tdsRefundId: string;
  totalTdsDeducted?: number;
  tcsAmount?: number;
  advanceTax?: number;
  selfAssessmentTax?: number;
}

export interface TdsDocumentsDto {
  id?: number;
  tdsRefundId: string;
  panFile?: string | null;
  form16File?: string | null;
  form16aFile?: string | null;
  aisFile?: string | null;
  tisFile?: string | null;
  bankStatementsFile?: string | null;
  prevItrFile?: string | null;
  tdsCertsFile?: string | null;
  incomeProofsFile?: string | null;
}

export interface BackendApplicationResponse {
  applicationId: string;
  fullName?: string;
  pan?: string;
  mobileNumber?: string;
  email?: string;
  bankName?: string;
  maskedAccountNumber?: string;
  assessmentYear?: string;
  grossTotalIncome?: number;
  taxableIncome?: number;
  estimatedTaxLiability?: number;
  totalTaxCredits?: number;
  estimatedRefund?: number;
  isAdditionalTaxPayable?: boolean;
  status?: string;
  isPaid?: boolean;
  paymentId?: string;
  totalPaid?: number;
  createdAt?: string;
  paidAt?: string;
}
