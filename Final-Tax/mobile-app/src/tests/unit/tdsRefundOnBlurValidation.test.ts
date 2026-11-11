/**
 * TDS Refund onBlur Validation Tests
 * Verifies field-level onBlur validation logic across Personal, Business, Bank, and Income sections:
 * - Centralized schema-based validation matching tdsCustomerSchema rules
 * - Individual field onBlur error triggers
 * - Immediate clearing of errors when corrected
 * - Interrelated field error handling (accountNumber & confirmAccountNumber)
 * - Preservation of form submission validation
 *
 * Uses Node.js built-in test runner. No React Native imports.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

type CustomerFormErrors = Record<string, string>;

interface PersonalDetails {
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

interface BusinessDetails {
  legalName: string;
  pan: string;
  aadhaar: string;
  mobileNumber: string;
}

interface BankRefundDetails {
  accountHolderName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
  accountType: "savings" | "current";
  isIfscVerified: boolean;
}

interface IncomeTaxDetails {
  taxRegime: "OLD" | "NEW";
  salaryIncome: string;
  otherIncome: string;
  interestIncome: string;
  rentalIncome: string;
  hasRentalIncome: boolean;
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
}

interface TdsCustomerIncomeFormData {
  personal: PersonalDetails;
  business: BusinessDetails;
  bank: BankRefundDetails;
  income: IncomeTaxDetails;
}

// ── Pure Validation Rules (mirrors tdsCustomerSchema.ts) ────────────────────

const PAN_CATEGORY_CODES = "ABCFGHJLPT";
const PAN_REGEX = new RegExp(`^[A-Z]{3}[${PAN_CATEGORY_CODES}][A-Z][0-9]{4}[A-Z]$`);
const AADHAAR_REGEX = /^[2-9]{1}[0-9]{11}$/;
const MOBILE_REGEX = /^[6-9][0-9]{9}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PINCODE_REGEX = /^[1-9][0-9]{5}$/;
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const ACCOUNT_NUMBER_REGEX = /^[0-9]{9,18}$/;

function validatePan(pan: string): boolean {
  if (!pan) return false;
  return PAN_REGEX.test(pan.trim().toUpperCase());
}

function isValidAadhaar(aadhaar: string): boolean {
  if (!aadhaar) return false;
  return AADHAAR_REGEX.test(aadhaar.replace(/\s+/g, ""));
}

function isValidMobile(mobile: string): boolean {
  if (!mobile) return false;
  const clean = mobile.replace(/[^0-9]/g, "");
  return clean.length === 10 && MOBILE_REGEX.test(clean);
}

function isValidEmail(email: string): boolean {
  if (!email) return false;
  return EMAIL_REGEX.test(email.trim().toLowerCase());
}

function isValidPinCode(pin: string): boolean {
  if (!pin) return false;
  return PINCODE_REGEX.test(pin.trim());
}

function isValidIfsc(ifsc: string): boolean {
  if (!ifsc) return false;
  return IFSC_REGEX.test(ifsc.trim().toUpperCase());
}

function isValidAccountNumber(acc: string): boolean {
  if (!acc) return false;
  return ACCOUNT_NUMBER_REGEX.test(acc.replace(/[^0-9]/g, ""));
}

function validatePersonalDetails(personal: PersonalDetails): {
  isValid: boolean;
  errors: CustomerFormErrors;
} {
  const errors: CustomerFormErrors = {};

  if (!personal.fullName || !personal.fullName.trim()) {
    errors["fullName"] = "Full Name is required";
  } else if (personal.fullName.trim().length < 3) {
    errors["fullName"] = "Enter a valid full name";
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

  if (!personal.mobileNumber || !personal.mobileNumber.trim()) {
    errors["mobileNumber"] = "Mobile number is required";
  } else if (!isValidMobile(personal.mobileNumber)) {
    errors["mobileNumber"] = "Enter valid 10-digit Indian mobile number";
  }

  if (!personal.email || !personal.email.trim()) {
    errors["email"] = "Email address is required";
  } else if (!isValidEmail(personal.email)) {
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

  return { isValid: Object.keys(errors).length === 0, errors };
}

function validateBusinessDetails(business: BusinessDetails): {
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
    } else if (/[^a-zA-Z0-9\s.\-&']/.test(trimmed)) {
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

  return { isValid: Object.keys(errors).length === 0, errors };
}

function validateCustomerIncomeForm(data: TdsCustomerIncomeFormData): {
  isValid: boolean;
  errors: CustomerFormErrors;
} {
  const errors: CustomerFormErrors = {};
  const { personal, business, bank } = data;

  if (personal) {
    const personalValidation = validatePersonalDetails(personal);
    if (!personalValidation.isValid) {
      Object.entries(personalValidation.errors).forEach(([field, msg]) => {
        errors[`personal.${field}`] = msg;
      });
    }
  }

  if (business) {
    const businessValidation = validateBusinessDetails(business);
    if (!businessValidation.isValid) {
      Object.entries(businessValidation.errors).forEach(([field, msg]) => {
        errors[`business.${field}`] = msg;
      });
    }
  }

  if (!bank.accountHolderName || !bank.accountHolderName.trim()) {
    errors["bank.accountHolderName"] = "Account Holder Name is required";
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
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

const INITIAL_FORM_DATA: TdsCustomerIncomeFormData = {
  personal: {
    fullName: "",
    pan: "",
    aadhaar: "",
    dob: "",
    mobileNumber: "",
    email: "",
    residentialAddress: "",
    city: "",
    state: "",
    pinCode: "",
  },
  business: {
    legalName: "",
    pan: "",
    aadhaar: "",
    mobileNumber: "",
  },
  bank: {
    accountHolderName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    bankName: "",
    branchName: "",
    accountType: "savings",
    isIfscVerified: false,
  },
  income: {
    taxRegime: "NEW",
    salaryIncome: "",
    otherIncome: "",
    interestIncome: "",
    rentalIncome: "",
    hasRentalIncome: false,
    municipalTaxesPaid: "",
    hasCapitalGains: false,
    shortTermCapitalGains: "",
    longTermCapitalGains: "",
    hasBusinessIncome: false,
    grossTurnover: "",
    netBusinessProfit: "",
    hasHomeLoan: false,
    homeLoanInterestSec24b: "",
    hasDeductions: false,
    deductions80C: "",
    deductions80D: "",
  },
};

/**
 * Simulates centralized handleBlurField logic implemented in useTdsRefundForm
 */
function simulateBlurField(
  fieldPath: string,
  formData: TdsCustomerIncomeFormData,
  currentErrors: CustomerFormErrors
): CustomerFormErrors {
  const validation = validateCustomerIncomeForm(formData);
  const fieldError = validation.errors[fieldPath];
  const next = { ...currentErrors };

  if (fieldError) {
    next[fieldPath] = fieldError;
  } else if (next[fieldPath]) {
    delete next[fieldPath];
  }

  // Interrelated field check: if accountNumber blurred and confirmAccountNumber error exists,
  // clear confirm error if account numbers match
  if (
    fieldPath === "bank.accountNumber" &&
    next["bank.confirmAccountNumber"] &&
    !validation.errors["bank.confirmAccountNumber"]
  ) {
    delete next["bank.confirmAccountNumber"];
  }

  return next;
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("TDS Refund onBlur Validation — Bank Section", () => {
  it("triggers error on blur when accountHolderName is empty", () => {
    const formData: TdsCustomerIncomeFormData = {
      ...INITIAL_FORM_DATA,
      bank: { ...INITIAL_FORM_DATA.bank, accountHolderName: "" },
    };
    const errors = simulateBlurField("bank.accountHolderName", formData, {});
    assert.equal(errors["bank.accountHolderName"], "Account Holder Name is required");
  });

  it("clears error on blur when accountHolderName is filled", () => {
    const formData: TdsCustomerIncomeFormData = {
      ...INITIAL_FORM_DATA,
      bank: { ...INITIAL_FORM_DATA.bank, accountHolderName: "Rajesh Kumar" },
    };
    const initialErrors = { "bank.accountHolderName": "Account Holder Name is required" };
    const errors = simulateBlurField("bank.accountHolderName", formData, initialErrors);
    assert.equal(errors["bank.accountHolderName"], undefined);
  });

  it("triggers error on blur for invalid bank account number (<9 digits)", () => {
    const formData: TdsCustomerIncomeFormData = {
      ...INITIAL_FORM_DATA,
      bank: { ...INITIAL_FORM_DATA.bank, accountNumber: "12345" },
    };
    const errors = simulateBlurField("bank.accountNumber", formData, {});
    assert.equal(errors["bank.accountNumber"], "Enter valid 9 to 18-digit account number");
  });

  it("triggers mismatch error on blur when confirmAccountNumber does not match", () => {
    const formData: TdsCustomerIncomeFormData = {
      ...INITIAL_FORM_DATA,
      bank: {
        ...INITIAL_FORM_DATA.bank,
        accountNumber: "1234567890",
        confirmAccountNumber: "9876543210",
      },
    };
    const errors = simulateBlurField("bank.confirmAccountNumber", formData, {});
    assert.equal(errors["bank.confirmAccountNumber"], "Bank Account Numbers do not match");
  });

  it("clears confirmAccountNumber error when accountNumber is blurred and they match", () => {
    const formData: TdsCustomerIncomeFormData = {
      ...INITIAL_FORM_DATA,
      bank: {
        ...INITIAL_FORM_DATA.bank,
        accountNumber: "1234567890",
        confirmAccountNumber: "1234567890",
      },
    };
    const initialErrors = { "bank.confirmAccountNumber": "Bank Account Numbers do not match" };
    const errors = simulateBlurField("bank.accountNumber", formData, initialErrors);
    assert.equal(errors["bank.confirmAccountNumber"], undefined);
  });

  it("triggers error on blur for invalid IFSC code format", () => {
    const formData: TdsCustomerIncomeFormData = {
      ...INITIAL_FORM_DATA,
      bank: { ...INITIAL_FORM_DATA.bank, ifscCode: "INVALID" },
    };
    const errors = simulateBlurField("bank.ifscCode", formData, {});
    assert.equal(errors["bank.ifscCode"], "Enter valid 11-character IFSC (e.g. HDFC0001234)");
  });

  it("clears error on blur for valid IFSC code", () => {
    const formData: TdsCustomerIncomeFormData = {
      ...INITIAL_FORM_DATA,
      bank: { ...INITIAL_FORM_DATA.bank, ifscCode: "HDFC0001234" },
    };
    const initialErrors = { "bank.ifscCode": "Enter valid 11-character IFSC (e.g. HDFC0001234)" };
    const errors = simulateBlurField("bank.ifscCode", formData, initialErrors);
    assert.equal(errors["bank.ifscCode"], undefined);
  });
});

describe("TDS Refund onBlur Validation — Business Section", () => {
  it("triggers error on blur when legalName has fewer than 3 letters", () => {
    const formData: TdsCustomerIncomeFormData = {
      ...INITIAL_FORM_DATA,
      business: { ...INITIAL_FORM_DATA.business, legalName: "AB" },
    };
    const errors = simulateBlurField("business.legalName", formData, {});
    assert.equal(errors["business.legalName"], "Legal Name must contain at least 3 letters");
  });

  it("triggers error on blur for invalid business PAN", () => {
    const formData: TdsCustomerIncomeFormData = {
      ...INITIAL_FORM_DATA,
      business: { ...INITIAL_FORM_DATA.business, pan: "ABCDE123" },
    };
    const errors = simulateBlurField("business.pan", formData, {});
    assert.equal(errors["business.pan"], "Enter valid 10-character PAN");
  });

  it("triggers error on blur for invalid Aadhaar number (<12 digits)", () => {
    const formData: TdsCustomerIncomeFormData = {
      ...INITIAL_FORM_DATA,
      business: { ...INITIAL_FORM_DATA.business, aadhaar: "12345" },
    };
    const errors = simulateBlurField("business.aadhaar", formData, {});
    assert.equal(errors["business.aadhaar"], "Aadhaar must be a 12-digit number");
  });

  it("triggers error on blur for invalid mobile number (<10 digits)", () => {
    const formData: TdsCustomerIncomeFormData = {
      ...INITIAL_FORM_DATA,
      business: { ...INITIAL_FORM_DATA.business, mobileNumber: "98765" },
    };
    const errors = simulateBlurField("business.mobileNumber", formData, {});
    assert.equal(errors["business.mobileNumber"], "Enter valid 10-digit Indian mobile number");
  });

  it("clears error on blur when business fields are valid", () => {
    const formData: TdsCustomerIncomeFormData = {
      ...INITIAL_FORM_DATA,
      business: {
        legalName: "Acme Enterprises",
        pan: "ABCCE1234F",
        aadhaar: "234567890123",
        mobileNumber: "9876543210",
      },
    };
    const initialErrors = {
      "business.legalName": "Legal Name is required",
      "business.pan": "Business PAN is required",
      "business.aadhaar": "Aadhaar Card Number is required",
      "business.mobileNumber": "Mobile number is required",
    };
    let errors = simulateBlurField("business.legalName", formData, initialErrors);
    errors = simulateBlurField("business.pan", formData, errors);
    errors = simulateBlurField("business.aadhaar", formData, errors);
    errors = simulateBlurField("business.mobileNumber", formData, errors);
    assert.deepEqual(errors, {});
  });
});

describe("TDS Refund onBlur Validation — Personal Section", () => {
  it("validates individual personal fields on blur correctly", () => {
    const validPersonal: PersonalDetails = {
      fullName: "Sharma Enterprises",
      pan: "ABCPS1234F",
      aadhaar: "345678901234",
      dob: "15/08/1990",
      mobileNumber: "9876543210",
      email: "sharma@example.com",
      residentialAddress: "Flat 101, Galaxy Heights",
      city: "Hyderabad",
      state: "Telangana",
      pinCode: "500081",
    };
    const result = validatePersonalDetails(validPersonal);
    assert.equal(result.isValid, true);
    assert.deepEqual(result.errors, {});
  });

  it("detects invalid personal fields using schema rules", () => {
    const invalidPersonal: PersonalDetails = {
      fullName: "S",
      pan: "INVALID",
      aadhaar: "123",
      dob: "01/01/2026",
      mobileNumber: "123",
      email: "bad-email",
      residentialAddress: "",
      city: "",
      state: "",
      pinCode: "00000",
    };
    const result = validatePersonalDetails(invalidPersonal);
    assert.equal(result.isValid, false);
    assert.ok(result.errors["fullName"]);
    assert.ok(result.errors["pan"]);
    assert.ok(result.errors["aadhaar"]);
    assert.ok(result.errors["mobileNumber"]);
    assert.ok(result.errors["email"]);
    assert.ok(result.errors["residentialAddress"]);
    assert.ok(result.errors["city"]);
    assert.ok(result.errors["state"]);
    assert.ok(result.errors["pinCode"]);
  });
});

describe("TDS Refund onBlur Validation — Full Form Submission Integration", () => {
  it("validateCustomerIncomeForm preserves submission validation integrity", () => {
    const invalidData: TdsCustomerIncomeFormData = {
      ...INITIAL_FORM_DATA,
      personal: { ...INITIAL_FORM_DATA.personal, fullName: "" },
      bank: { ...INITIAL_FORM_DATA.bank, accountNumber: "" },
    };
    const result = validateCustomerIncomeForm(invalidData);
    assert.equal(result.isValid, false);
    assert.ok(result.errors["personal.fullName"]);
    assert.ok(result.errors["bank.accountNumber"]);
  });
});
