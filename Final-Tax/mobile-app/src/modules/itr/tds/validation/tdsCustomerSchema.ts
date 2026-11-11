import {
  TdsCustomerIncomeFormData,
  PersonalDetails,
} from "../types/customerIncome.types";
import {
  isValidAadhaar,
  isValidMobile,
  isValidPinCode,
  isValidIfsc,
  isValidAccountNumber,
  isValidDob,
} from "../utils/tdsValidation";
import { validatePan, validateEmail } from "@/shared/validators/indianTaxValidators";
import { isValidName } from "@/shared/validators/nameValidator";

export type CustomerFormErrors = Record<string, string>;

export function validatePersonalDetails(personal: PersonalDetails): {
  isValid: boolean;
  errors: CustomerFormErrors;
} {
  const errors: CustomerFormErrors = {};

  if (!personal.fullName || !personal.fullName.trim()) {
    errors["fullName"] = "Full Name is required";
  } else if (personal.fullName.trim().length < 3) {
    errors["fullName"] = "Enter a valid full name";
  } else if (!isValidName(personal.fullName.trim(), 2, 100)) {
    errors["fullName"] = "Full Name must contain English letters and single spaces only";
  }

  if (!personal.pan || !personal.pan.trim()) {
    errors["pan"] = "PAN is required";
  } else if (!validatePan(personal.pan)) {
    errors["pan"] = "Enter valid 10-character PAN (e.g. ABCDE1234F)";
  }

  if (personal.aadhaar && personal.aadhaar.trim()) {
    if (!isValidAadhaar(personal.aadhaar)) {
      errors["aadhaar"] = "Aadhaar must be a 12-digit number";
    }
  }

  const dobValidation = isValidDob(personal.dob);
  if (!dobValidation.isValid) {
    errors["dob"] = dobValidation.error || "Enter a valid Date of Birth";
  }

  if (!personal.mobileNumber || !personal.mobileNumber.trim()) {
    errors["mobileNumber"] = "Mobile number is required";
  } else if (!isValidMobile(personal.mobileNumber)) {
    errors["mobileNumber"] = "Enter valid 10-digit Indian mobile number";
  }

  if (!personal.email || !personal.email.trim()) {
    errors["email"] = "Email address is required";
  } else if (!validateEmail(personal.email)) {
    errors["email"] = "Enter a valid email address";
  }

  if (!personal.residentialAddress || !personal.residentialAddress.trim()) {
    errors["residentialAddress"] = "Residential Address is required";
  }

  if (!personal.city || !personal.city.trim()) {
    errors["city"] = "City is required";
  }

  if (!personal.state || !personal.state.trim()) {
    errors["state"] = "State is required";
  }

  if (!personal.pinCode || !personal.pinCode.trim()) {
    errors["pinCode"] = "PIN Code is required";
  } else if (!isValidPinCode(personal.pinCode)) {
    errors["pinCode"] = "Enter valid 6-digit PIN Code";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateBusinessDetails(business: any): {
  isValid: boolean;
  errors: CustomerFormErrors;
} {
  const errors: CustomerFormErrors = {};

  if (!business.legalName || !business.legalName.trim()) {
    errors["legalName"] = "Legal Name is required";
  } else {
    const trimmed = business.legalName.trim();
    const alphaCount = (trimmed.match(/[a-zA-Z]/g) || []).length;
    if (alphaCount < 3) {
      errors["legalName"] = "Legal Name must contain at least 3 letters";
    } else if (!isValidName(trimmed, 2, 100)) {
      errors["legalName"] = "Legal Name contains invalid characters or emojis";
    }
  }

  if (!business.pan || !business.pan.trim()) {
    errors["pan"] = "Business PAN is required";
  } else if (!validatePan(business.pan)) {
    errors["pan"] = "Enter valid 10-character PAN";
  }

  if (business.aadhaar && business.aadhaar.trim()) {
    if (!isValidAadhaar(business.aadhaar)) {
      errors["aadhaar"] = "Aadhaar must be a 12-digit number";
    }
  } else {
    errors["aadhaar"] = "Aadhaar Card Number is required";
  }

  if (!business.mobileNumber || !business.mobileNumber.trim()) {
    errors["mobileNumber"] = "Mobile number is required";
  } else if (!isValidMobile(business.mobileNumber)) {
    errors["mobileNumber"] = "Enter valid 10-digit Indian mobile number";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateCustomerIncomeForm(data: TdsCustomerIncomeFormData): {
  isValid: boolean;
  errors: CustomerFormErrors;
} {
  const errors: CustomerFormErrors = {};
  const { personal, business, bank } = data;

  // --- 1. PERSONAL DETAILS ---
  const personalValidation = validatePersonalDetails(personal);
  if (!personalValidation.isValid) {
    Object.entries(personalValidation.errors).forEach(([field, msg]) => {
      errors[`personal.${field}`] = msg;
    });
  }

  // --- 1.5. BUSINESS DETAILS ---
  if (business) {
    const businessValidation = validateBusinessDetails(business);
    if (!businessValidation.isValid) {
      Object.entries(businessValidation.errors).forEach(([field, msg]) => {
        errors[`business.${field}`] = msg;
      });
    }
  }

  // --- 2. BANK DETAILS ---
  if (!bank.accountHolderName || !bank.accountHolderName.trim()) {
    errors["bank.accountHolderName"] = "Account Holder Name is required";
  } else if (!isValidName(bank.accountHolderName.trim(), 2, 50)) {
    errors["bank.accountHolderName"] = "Account Holder Name must contain English letters and single spaces only";
  }

  if (!bank.accountNumber || !bank.accountNumber.trim()) {
    errors["bank.accountNumber"] = "Bank Account Number is required";
  } else if (!isValidAccountNumber(bank.accountNumber)) {
    errors["bank.accountNumber"] = "Enter valid 9 to 18-digit account number";
  }

  if (!bank.confirmAccountNumber || !bank.confirmAccountNumber.trim()) {
    errors["bank.confirmAccountNumber"] = "Please confirm Bank Account Number";
  } else if (bank.accountNumber.trim() !== bank.confirmAccountNumber.trim()) {
    errors["bank.confirmAccountNumber"] = "Bank Account Numbers do not match";
  }

  if (!bank.ifscCode || !bank.ifscCode.trim()) {
    errors["bank.ifscCode"] = "IFSC Code is required";
  } else if (!isValidIfsc(bank.ifscCode)) {
    errors["bank.ifscCode"] = "Enter valid 11-character IFSC (e.g. HDFC0001234)";
  }

  if (!bank.bankName || !bank.bankName.trim()) {
    errors["bank.bankName"] = "Bank Name is required";
  } else if (!isValidName(bank.bankName.trim(), 2, 60)) {
    errors["bank.bankName"] = "Bank Name must contain English letters and single spaces only";
  }

  if (bank.branchName && bank.branchName.trim() && !isValidName(bank.branchName.trim(), 2, 60)) {
    errors["bank.branchName"] = "Branch Name must contain English letters and single spaces only";
  }



  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
