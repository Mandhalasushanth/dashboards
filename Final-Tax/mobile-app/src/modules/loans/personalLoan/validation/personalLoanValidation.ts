import { normalizeSpaces } from "@/shared/validators/profileValidators";
import { parseWholeRupeeAmount } from "../../utils/moneyInput";
import {
  JOB_TYPE_OPTIONS,
  NATURE_OF_BUSINESS_OPTIONS,
  SALARY_CREDIT_METHOD_OPTIONS,
  WORK_EXPERIENCE_OPTIONS,
  YEARS_IN_BUSINESS_OPTIONS,
} from "../types/personalLoan.types";
import type {
  PersonalLoanFormData,
  PersonalLoanErrors,
} from "../types/personalLoan.types";

export const MIN_MONTHLY_INCOME = 10000;
/** Lowest and highest personal loan the application accepts (whole rupees). */
export const MIN_PERSONAL_LOAN_AMOUNT = 10000;
export const MAX_PERSONAL_LOAN_AMOUNT = 10000000;
/** Same as the input's character limit. */
export const PERSONAL_NAME_MAX_LENGTH = 80;

/** Customer-facing problem with a company / business name, or null when it is usable. */
function describeNameProblem(raw: string, subject: string): string | null {
  const name = normalizeSpaces(raw);
  if (!name) return `Enter your ${subject}`;
  const length = Array.from(name).length;
  const hasLetterOrNum = /[\p{L}\p{N}]/u.test(name);
  const hasEmoji = /[\p{Extended_Pictographic}]/u.test(name);
  if (length < 2 || (!hasLetterOrNum && (!hasEmoji || length < 4))) {
    return `${subject.charAt(0).toUpperCase()}${subject.slice(1)} must have at least 2 characters, including a letter or number`;
  }
  if (length > PERSONAL_NAME_MAX_LENGTH) {
    return `${subject.charAt(0).toUpperCase()}${subject.slice(1)} can be up to ${PERSONAL_NAME_MAX_LENGTH} characters`;
  }
  return null;
}

/** Customer-facing problem with the requested amount, or null when it is acceptable. */
function describeAmountProblem(raw: string): string | null {
  const amount = parseWholeRupeeAmount(raw);
  if (!raw.trim()) return "Enter the loan amount you need.";
  if (raw.includes(".")) return "Enter whole rupees without paise.";
  if (amount === null) return "Enter the loan amount in numbers only.";
  if (amount < MIN_PERSONAL_LOAN_AMOUNT) {
    return `Minimum personal loan amount is ₹${MIN_PERSONAL_LOAN_AMOUNT.toLocaleString("en-IN")}.`;
  }
  if (amount > MAX_PERSONAL_LOAN_AMOUNT) {
    return `Maximum personal loan amount is ₹${MAX_PERSONAL_LOAN_AMOUNT.toLocaleString("en-IN")}.`;
  }
  return null;
}

/**
 * Validates the Personal Loan Details form (Screen 2: Employment & Income).
 * Pure functional validation without loops.
 */
export function validatePersonalLoanForm(
  data: PersonalLoanFormData
): {
  isValid: boolean;
  errors: PersonalLoanErrors;
} {
  const errors: PersonalLoanErrors = {};

  // 1. Requested Loan Amount (Required)
  const amountProblem = describeAmountProblem(
    data.loanAmount || data.requestedAmount || ""
  );
  if (amountProblem) {
    errors.loanAmount = amountProblem;
    errors.requestedAmount = amountProblem;
  }

  if (data.employmentType !== "salaried" && data.employmentType !== "self-employed") {
    errors.employmentType = "Please select employment type";
  }

  if (data.employmentType === "salaried") {
    const employerProblem = describeNameProblem(
      data.employerName || data.companyName || "",
      "employer name"
    );
    if (employerProblem) {
      errors.employerName = employerProblem;
      errors.companyName = employerProblem;
    }

    if (!(JOB_TYPE_OPTIONS as readonly string[]).includes(data.jobType)) {
      errors.jobType = "Please select your job type";
    }

    const salaryRaw = data.monthlyNetSalary || data.monthlySalary || "";
    const salaryNum = parseWholeRupeeAmount(salaryRaw);
    if (!salaryRaw.trim()) {
      errors.monthlyNetSalary = "Enter your monthly net salary";
      errors.monthlySalary = "Enter your monthly net salary";
    } else if (salaryNum === null) {
      errors.monthlyNetSalary = "Enter a valid monthly net salary";
      errors.monthlySalary = "Enter a valid monthly net salary";
    } else if (salaryNum < MIN_MONTHLY_INCOME) {
      errors.monthlyNetSalary = "Monthly net salary must be at least ₹10,000";
      errors.monthlySalary = "Monthly net salary must be at least ₹10,000";
    }

    if (!(WORK_EXPERIENCE_OPTIONS as readonly string[]).includes(data.workExperience)) {
      errors.workExperience = "Please select your work experience";
    }

    if (!(SALARY_CREDIT_METHOD_OPTIONS as readonly string[]).includes(data.salaryCreditMethod)) {
      errors.salaryCreditMethod = "Please select how you receive your salary";
    }
  } else if (data.employmentType === "self-employed") {
    const professionProblem = describeNameProblem(
      data.businessOrProfessionName || data.professionName || "",
      "business or profession name"
    );
    if (professionProblem) {
      errors.businessOrProfessionName = professionProblem;
      errors.professionName = professionProblem;
    }

    if (!(NATURE_OF_BUSINESS_OPTIONS as readonly string[]).includes(data.natureOfBusiness)) {
      errors.natureOfBusiness = "Please select nature of business";
    }

    const incomeRaw = data.averageMonthlyIncome || data.monthlyIncome || "";
    const incomeNum = parseWholeRupeeAmount(incomeRaw);
    if (!incomeRaw.trim()) {
      errors.averageMonthlyIncome = "Enter your average monthly income";
      errors.monthlyIncome = "Enter your average monthly income";
    } else if (incomeNum === null) {
      errors.averageMonthlyIncome = "Enter a valid average monthly income";
      errors.monthlyIncome = "Enter a valid average monthly income";
    } else if (incomeNum < MIN_MONTHLY_INCOME) {
      errors.averageMonthlyIncome =
        "Average monthly income must be at least ₹10,000";
      errors.monthlyIncome =
        "Average monthly income must be at least ₹10,000";
    }

    if (!(YEARS_IN_BUSINESS_OPTIONS as readonly string[]).includes(data.yearsInBusiness)) {
      errors.yearsInBusiness = "Please select years in business";
    }
  }

  const isValid = Object.keys(errors).length === 0;

  return { isValid, errors };
}

/** True once every required field of the selected employment type has a value. */
export function isPersonalFormFilled(data: PersonalLoanFormData): boolean {
  const has = (...values: (string | undefined)[]): boolean =>
    values.some((value) => Boolean(value?.trim()));

  const hasAmount = Boolean(
    (data.loanAmount || data.requestedAmount)?.trim()
  );

  if (data.employmentType === "salaried") {
    return (
      hasAmount &&
      has(data.employerName, data.companyName) &&
      has(data.jobType) &&
      has(data.monthlyNetSalary, data.monthlySalary) &&
      has(data.workExperience) &&
      has(data.salaryCreditMethod)
    );
  }
  if (data.employmentType === "self-employed") {
    return (
      hasAmount &&
      has(data.businessOrProfessionName, data.professionName) &&
      has(data.natureOfBusiness) &&
      has(data.averageMonthlyIncome, data.monthlyIncome) &&
      has(data.yearsInBusiness)
    );
  }
  return false;
}
