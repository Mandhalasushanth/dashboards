export interface PersonalDetails {
  fullName: string;
  pan: string;
  aadhaar: string;
  dob: string;
  mobileNumber: string;
  email: string;
  residentialAddress: string;
  city: string;
  state: string;
  pinCode: string;
}

export type BankAccountType = "savings" | "current";

export interface BankRefundDetails {
  accountHolderName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
  accountType: BankAccountType;
  isIfscVerified: boolean;
}

export type TaxRegimeType = "NEW" | "OLD";

export interface IncomeTaxDetails {
  assessmentYear: string;
  financialYear: string;
  taxRegime: TaxRegimeType;

  // Primary Incomes
  salaryIncome: string;
  otherIncome: string;
  interestIncome: string;

  // Conditional Sections
  hasRentalIncome: boolean;
  rentalIncome: string;
  municipalTaxesPaid: string;

  hasCapitalGains: boolean;
  shortTermCapitalGains: string;
  longTermCapitalGains: string;

  hasBusinessIncome: boolean;
  grossTurnover: string;
  netBusinessProfit: string;

  hasHomeLoan: boolean;
  homeLoanInterestSec24b: string;

  hasDeductions: boolean;
  deductions80C: string;
  deductions80D: string;
  donations80G: string;
  otherDeductions: string;

  hasPreviousLoss: boolean;
  carryForwardLossAmount: string;

  // Tax Credits
  totalTdsDeducted: string;
  tcsAmount: string;
  advanceTaxPaid: string;
  selfAssessmentTaxPaid: string;
}

export interface BusinessDetails {
  legalName: string;
  pan: string;
  aadhaar: string;
  mobileNumber: string;
}

export interface TdsCustomerIncomeFormData {
  personal: PersonalDetails;
  business: BusinessDetails;
  bank: BankRefundDetails;
  income: IncomeTaxDetails;
}
