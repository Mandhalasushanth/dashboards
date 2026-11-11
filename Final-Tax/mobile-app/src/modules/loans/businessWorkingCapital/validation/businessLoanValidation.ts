import {
  validatePincode,
  validateDateOfBirth,
} from "@/shared/validators/indianTaxValidators";
import { validateGstinFull } from "@/modules/gst/utils/gstValidation";
import { parseDDMMYYYY } from "@/shared/formatters/dateFormatter";
import type {
  BusinessLoanFormData,
  BusinessLoanErrors,
} from "../types/businessLoan.types";
import {
  BUSINESS_ACTIVITY_OPTIONS,
  BUSINESS_CONSTITUTION_OPTIONS,
  BUSINESS_LOAN_PURPOSE_OPTIONS,
  WORKING_CAPITAL_PURPOSE_OPTIONS,
} from "../types/businessLoan.types";
import { parseWholeRupeeAmount } from "../../utils/moneyInput";

/** Maximum lengths of free-text business fields; used by the inputs and the validator. */
export const BUSINESS_TEXT_LIMITS = {
  name: 100,
  other: 60,
  address: 200,
  description: 300,
} as const;

export const UDYAM_REGEX = /^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/i;

export function isProjectCostRequired(purpose: string): boolean {
  return (
    purpose === "Equipment Purchase" ||
    purpose === "Renovation" ||
    purpose === "Business Setup"
  );
}

export function parseRawAmount(val: string): number {
  return parseWholeRupeeAmount(val) ?? Number.NaN;
}

export function validateBusinessEstablishmentDate(dateStr: string): boolean {
  if (!dateStr || !validateDateOfBirth(dateStr)) return false;
  const date = parseDDMMYYYY(dateStr);
  if (!date) return false;
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return date <= today;
}

export function validateBusinessLoanForm(data: BusinessLoanFormData): {
  isValid: boolean;
  errors: BusinessLoanErrors;
} {
  const errors: BusinessLoanErrors = {};
  const { businessProfile, loanType, businessLoan, workingCapital } = data;

  // 1. Common Business Profile Validation
  if (!businessProfile.businessName?.trim()) {
    errors.businessName = "Business / Trade Name is required";
  } else if (businessProfile.businessName.trim().length < 3) {
    errors.businessName = "Business name must be at least 3 characters";
  } else if (businessProfile.businessName.trim().length > BUSINESS_TEXT_LIMITS.name) {
    errors.businessName = `Business name can be up to ${BUSINESS_TEXT_LIMITS.name} characters`;
  }

  if (!(BUSINESS_CONSTITUTION_OPTIONS as readonly string[]).includes(businessProfile.constitution)) {
    errors.constitution = "Please select a business constitution";
  } else if (businessProfile.constitution === "Other") {
    if (!businessProfile.constitutionOther?.trim()) {
      errors.constitutionOther = "Please specify constitution";
    } else if (Array.from(businessProfile.constitutionOther.trim()).length > BUSINESS_TEXT_LIMITS.other) {
      errors.constitutionOther = `Please specify constitution using up to ${BUSINESS_TEXT_LIMITS.other} characters`;
    }
  }

  if (!(BUSINESS_ACTIVITY_OPTIONS as readonly string[]).includes(businessProfile.businessActivity)) {
    errors.businessActivity = "Please select primary business activity";
  } else if (businessProfile.businessActivity === "Other") {
    if (!businessProfile.activityOther?.trim()) {
      errors.activityOther = "Please specify business activity";
    } else if (Array.from(businessProfile.activityOther.trim()).length > BUSINESS_TEXT_LIMITS.other) {
      errors.activityOther = `Please specify business activity using up to ${BUSINESS_TEXT_LIMITS.other} characters`;
    }
  }

  if (!businessProfile.establishmentDate?.trim()) {
    errors.establishmentDate = "Establishment date is required";
  } else if (!validateBusinessEstablishmentDate(businessProfile.establishmentDate)) {
    errors.establishmentDate = "Enter a valid date in DD-MM-YYYY format (cannot be in future)";
  }

  if (!businessProfile.businessAddress?.trim()) {
    errors.businessAddress = "Business address is required";
  } else if (businessProfile.businessAddress.trim().length < 5) {
    errors.businessAddress = "Address must be at least 5 characters";
  } else if (businessProfile.businessAddress.trim().length > BUSINESS_TEXT_LIMITS.address) {
    errors.businessAddress = `Address can be up to ${BUSINESS_TEXT_LIMITS.address} characters`;
  }

  if (!businessProfile.pincode?.trim()) {
    errors.pincode = "PIN code is required";
  } else if (!validatePincode(businessProfile.pincode)) {
    errors.pincode = "Enter a valid 6-digit PIN code";
  }

  if (businessProfile.isGstRegistered) {
    if (!businessProfile.gstin?.trim()) {
      errors.gstin = "Enter GSTIN";
    } else {
      const gstinErr = validateGstinFull(businessProfile.gstin.trim());
      if (gstinErr) errors.gstin = gstinErr;
    }
  }

  if (
    businessProfile.udyamRegistration?.trim() &&
    !UDYAM_REGEX.test(businessProfile.udyamRegistration.trim())
  ) {
    errors.udyamRegistration = "Format must be UDYAM-XX-00-0000000";
  }

  // 2. Dynamic Loan Type Validation
  if (loanType === "business-loan") {
    const amount = parseRawAmount(businessLoan.loanAmount);
    if (!businessLoan.loanAmount?.trim()) {
      errors.businessLoanAmount = "Loan amount is required";
    } else if (!Number.isFinite(amount) || amount <= 0) {
      errors.businessLoanAmount = "Enter a valid loan amount";
    } else if (amount < 25000) {
      errors.businessLoanAmount = "Minimum loan amount is ₹25,000";
    }

    if (!(BUSINESS_LOAN_PURPOSE_OPTIONS as readonly string[]).includes(businessLoan.purpose)) {
      errors.businessLoanPurpose = "Please select purpose of loan";
    } else if (businessLoan.purpose === "Other") {
      if (!businessLoan.purposeOther?.trim()) {
        errors.businessLoanPurposeOther = "Please specify loan purpose";
      } else if (Array.from(businessLoan.purposeOther.trim()).length > BUSINESS_TEXT_LIMITS.other) {
        errors.businessLoanPurposeOther = `Please specify loan purpose using up to ${BUSINESS_TEXT_LIMITS.other} characters`;
      }
    }

    if (!businessLoan.purposeDescription?.trim()) {
      errors.businessLoanDescription = "Brief purpose description is required";
    } else if (businessLoan.purposeDescription.trim().length < 5) {
      errors.businessLoanDescription = "Description must be at least 5 characters";
    } else if (businessLoan.purposeDescription.trim().length > BUSINESS_TEXT_LIMITS.description) {
      errors.businessLoanDescription = `Description can be up to ${BUSINESS_TEXT_LIMITS.description} characters`;
    }

    if (isProjectCostRequired(businessLoan.purpose)) {
      const projectCost = parseRawAmount(businessLoan.projectCost);
      if (!businessLoan.projectCost?.trim()) {
        errors.businessLoanProjectCost = "Estimated project / equipment cost is required";
      } else if (!Number.isFinite(projectCost) || projectCost <= 0) {
        errors.businessLoanProjectCost = "Enter a valid project cost";
      }
    }
  } else if (loanType === "working-capital") {
    const amount = parseRawAmount(workingCapital.loanAmount);
    if (!workingCapital.loanAmount?.trim()) {
      errors.workingCapitalAmount = "Loan amount is required";
    } else if (!Number.isFinite(amount) || amount <= 0) {
      errors.workingCapitalAmount = "Enter a valid loan amount";
    } else if (amount < 25000) {
      errors.workingCapitalAmount = "Minimum working capital amount is ₹25,000";
    }

    if (!(WORKING_CAPITAL_PURPOSE_OPTIONS as readonly string[]).includes(workingCapital.purpose)) {
      errors.workingCapitalPurpose = "Please select purpose of funds";
    } else if (workingCapital.purpose === "Other") {
      if (!workingCapital.purposeOther?.trim()) {
        errors.workingCapitalPurposeOther = "Please specify purpose of funds";
      } else if (Array.from(workingCapital.purposeOther.trim()).length > BUSINESS_TEXT_LIMITS.other) {
        errors.workingCapitalPurposeOther = `Please specify purpose of funds using up to ${BUSINESS_TEXT_LIMITS.other} characters`;
      }
    }

    if (!workingCapital.purposeDescription?.trim()) {
      errors.workingCapitalDescription = "Brief purpose description is required";
    } else if (workingCapital.purposeDescription.trim().length < 5) {
      errors.workingCapitalDescription = "Description must be at least 5 characters";
    } else if (workingCapital.purposeDescription.trim().length > BUSINESS_TEXT_LIMITS.description) {
      errors.workingCapitalDescription = `Description can be up to ${BUSINESS_TEXT_LIMITS.description} characters`;
    }

    const sales = parseRawAmount(workingCapital.monthlySales);
    if (!workingCapital.monthlySales?.trim()) {
      errors.monthlySales = "Average monthly sales is required";
    } else if (!Number.isFinite(sales) || sales <= 0) {
      errors.monthlySales = "Enter a valid monthly sales figure";
    }

    const expenses = parseRawAmount(workingCapital.monthlyExpenses);
    if (!workingCapital.monthlyExpenses?.trim()) {
      errors.monthlyExpenses = "Average monthly expenses is required";
    } else if (!Number.isFinite(expenses) || expenses <= 0) {
      errors.monthlyExpenses = "Enter a valid monthly expenses figure";
    }
  }

  const isValid = Object.keys(errors).length === 0;
  return { isValid, errors };
}
