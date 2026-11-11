import { TdsCustomerIncomeFormData } from "../types/customerIncome.types";
import { TdsDocumentItem } from "../types/tdsDocuments.types";
import { TaxCalculationBreakdown } from "../types/estimate.types";
import { parsePositiveNumber } from "../utils/tdsValidation";
import {
  BackendApplicationResponse,
  RefundBankAccountDto,
  IncomeTaxInfoDto,
  TdsTaxesPaidDto,
} from "./tdsApiTypes";

/** Saved refund bank account → form's bank section. */
export const mapBankDtoToForm = (bankDto: RefundBankAccountDto): TdsCustomerIncomeFormData["bank"] => ({
    accountHolderName: bankDto.accountHolderName || "",
    accountNumber: bankDto.accountNumber || "",
    confirmAccountNumber:
      bankDto.confirmAccountNumber || bankDto.accountNumber || "",
    ifscCode: bankDto.ifscCode || "",
    bankName: bankDto.bankName || "",
    branchName: bankDto.branchName || "",
    accountType: (bankDto.accountType?.toLowerCase() === "current"
      ? "current"
      : "savings"),
    isIfscVerified: Boolean(bankDto.bankName),
  });

/** Saved income + taxes-paid records → form's income section (unset amounts become ""). */
export const mapIncomeDtosToForm = (
  incomeDto: IncomeTaxInfoDto | null,
  taxesPaidDto: TdsTaxesPaidDto | null,
): Partial<TdsCustomerIncomeFormData["income"]> => ({
    salaryIncome: incomeDto?.salaryIncome
      ? String(incomeDto.salaryIncome)
      : "",
    otherIncome: incomeDto?.otherIncome
      ? String(incomeDto.otherIncome)
      : "",
    interestIncome: incomeDto?.interestIncome
      ? String(incomeDto.interestIncome)
      : "",
    rentalIncome: incomeDto?.rentalIncome
      ? String(incomeDto.rentalIncome)
      : "",
    hasRentalIncome: Boolean(
      incomeDto?.rentalIncome && incomeDto.rentalIncome > 0,
    ),
    municipalTaxesPaid: incomeDto?.municipalTaxesPaid
      ? String(incomeDto.municipalTaxesPaid)
      : "",
    shortTermCapitalGains: incomeDto?.shortTermCapitalGains
      ? String(incomeDto.shortTermCapitalGains)
      : "",
    longTermCapitalGains: incomeDto?.longTermCapitalGains
      ? String(incomeDto.longTermCapitalGains)
      : "",
    hasCapitalGains: Boolean(
      (incomeDto?.shortTermCapitalGains &&
        incomeDto.shortTermCapitalGains > 0) ||
      (incomeDto?.longTermCapitalGains &&
        incomeDto.longTermCapitalGains > 0),
    ),
    grossTurnover: incomeDto?.grossTurnover
      ? String(incomeDto.grossTurnover)
      : "",
    netBusinessProfit: incomeDto?.netBusinessProfit
      ? String(incomeDto.netBusinessProfit)
      : "",
    hasBusinessIncome: Boolean(
      incomeDto?.netBusinessProfit && incomeDto.netBusinessProfit > 0,
    ),
    homeLoanInterestSec24b: incomeDto?.homeLoanInterestSec24b
      ? String(incomeDto.homeLoanInterestSec24b)
      : "",
    hasHomeLoan: Boolean(
      incomeDto?.homeLoanInterestSec24b &&
      incomeDto.homeLoanInterestSec24b > 0,
    ),
    deductions80C: incomeDto?.deductions80C
      ? String(incomeDto.deductions80C)
      : "",
    deductions80D: incomeDto?.deductions80D
      ? String(incomeDto.deductions80D)
      : "",
    hasDeductions: Boolean(
      (incomeDto?.deductions80C && incomeDto.deductions80C > 0) ||
      (incomeDto?.deductions80D && incomeDto.deductions80D > 0),
    ),
    totalTdsDeducted: taxesPaidDto?.totalTdsDeducted
      ? String(taxesPaidDto.totalTdsDeducted)
      : "",
    tcsAmount: taxesPaidDto?.tcsAmount
      ? String(taxesPaidDto.tcsAmount)
      : "",
    advanceTaxPaid: taxesPaidDto?.advanceTax
      ? String(taxesPaidDto.advanceTax)
      : "",
    selfAssessmentTaxPaid: taxesPaidDto?.selfAssessmentTax
      ? String(taxesPaidDto.selfAssessmentTax)
      : "",
  });

/** Body for `POST /tds-refund/apply`. */
export const buildApplyPayload = (
  formData: TdsCustomerIncomeFormData,
  documents: TdsDocumentItem[],
  calculation: TaxCalculationBreakdown,
  applicationId: string | undefined,
) => ({
    applicationId,
    fullName: formData.personal.fullName,
    pan: formData.personal.pan,
    aadhaar: formData.personal.aadhaar,
    dob: formData.personal.dob,
    mobileNumber: formData.personal.mobileNumber,
    email: formData.personal.email,
    address: formData.personal.residentialAddress,
    city: formData.personal.city,
    state: formData.personal.state,
    pinCode: formData.personal.pinCode,

    accountHolderName: formData.bank.accountHolderName,
    accountNumber: formData.bank.accountNumber,
    ifscCode: formData.bank.ifscCode,
    bankName: formData.bank.bankName,
    branchName: formData.bank.branchName,
    accountType: formData.bank.accountType,

    assessmentYear: formData.income.assessmentYear,
    financialYear: formData.income.financialYear,
    taxRegime: formData.income.taxRegime,

    salaryIncome: parsePositiveNumber(formData.income.salaryIncome),
    otherIncome: parsePositiveNumber(formData.income.otherIncome),
    interestIncome: parsePositiveNumber(formData.income.interestIncome),
    rentalIncome: parsePositiveNumber(formData.income.rentalIncome),
    capitalGainsIncome:
      parsePositiveNumber(formData.income.shortTermCapitalGains) +
      parsePositiveNumber(formData.income.longTermCapitalGains),
    businessIncome: parsePositiveNumber(formData.income.netBusinessProfit),

    totalTdsDeducted: parsePositiveNumber(formData.income.totalTdsDeducted),
    tcsAmount: parsePositiveNumber(formData.income.tcsAmount),
    advanceTaxPaid: parsePositiveNumber(formData.income.advanceTaxPaid),
    selfAssessmentTaxPaid: parsePositiveNumber(
      formData.income.selfAssessmentTaxPaid,
    ),
    carryForwardLoss: parsePositiveNumber(
      formData.income.carryForwardLossAmount,
    ),

    deductions80C: parsePositiveNumber(formData.income.deductions80C),
    deductions80D: parsePositiveNumber(formData.income.deductions80D),
    homeLoanInterest: parsePositiveNumber(
      formData.income.homeLoanInterestSec24b,
    ),
    otherDeductions: parsePositiveNumber(formData.income.otherDeductions),

    grossTotalIncome: calculation.grossTotalIncome,
    totalDeductions: calculation.totalEligibleDeductions,
    taxableIncome: calculation.taxableIncome,
    estimatedTaxLiability: calculation.estimatedTaxLiability,
    totalTaxCredits: calculation.totalTaxCredits,
    estimatedRefund: calculation.estimatedRefund,
    isAdditionalTaxPayable: calculation.isAdditionalTaxPayable,

    documentsJson: JSON.stringify(
      documents
        .filter((d) => d.status === "uploaded" && d.fileUri)
        .map((d) => ({
          id: d.id,
          title: d.title,
          fileName: d.fileName,
          fileSize: d.fileSize,
          mimeType: d.mimeType,
        })),
    ),
  });

/** Local stand-in for the apply response when the server call fails. */
export const buildOfflineApplicationResponse = (
  formData: TdsCustomerIncomeFormData,
  calculation: TaxCalculationBreakdown,
  applicationId: string,
): BackendApplicationResponse => ({
    applicationId,
    fullName: formData.personal.fullName,
    pan: formData.personal.pan,
    mobileNumber: formData.personal.mobileNumber,
    email: formData.personal.email,
    bankName: formData.bank.bankName,
    maskedAccountNumber: formData.bank.accountNumber,
    assessmentYear: formData.income.assessmentYear,
    grossTotalIncome: calculation.grossTotalIncome,
    taxableIncome: calculation.taxableIncome,
    estimatedTaxLiability: calculation.estimatedTaxLiability,
    totalTaxCredits: calculation.totalTaxCredits,
    estimatedRefund: calculation.estimatedRefund,
    isAdditionalTaxPayable: calculation.isAdditionalTaxPayable,
    status: "SUBMITTED",
    isPaid: false,
    createdAt: new Date().toISOString(),
  });
