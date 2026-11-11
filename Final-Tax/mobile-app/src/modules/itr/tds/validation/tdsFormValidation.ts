import { TdsFormData, TdsFormErrors, TdsFormFieldKey } from "../types/tdsForm.types";
import { describePanError } from "@/shared/validators/indianTaxValidators";
import { isValidName } from "@/shared/validators/nameValidator";
const TAN_REGEX = /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/;
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const ACCOUNT_REGEX = /^\d{9,18}$/;

const sanitizeNumber = (val: string): number => {
  const cleaned = val.replace(/[^0-9.]/g, "");
  return Number(cleaned) || 0;
};

const validateSingleField = (
  key: TdsFormFieldKey,
  data: TdsFormData
): string | undefined => {
  const value = (data[key] || "").trim();

  switch (key) {
    case "panNumber": {
      if (!value) return "PAN Number is required";
      const panErr = describePanError(value);
      if (panErr) return panErr;
      return undefined;
    }

    case "assessmentYear":
      if (!value) return "Please select an Assessment Year";
      return undefined;

    case "totalIncome":
      if (!value) return "Total income is required";
      const numIncome = sanitizeNumber(value);
      if (isNaN(numIncome) || numIncome < 0) return "Income must be a valid positive amount";
      return undefined;

    case "totalDeductions":
      if (value) {
        const numDeductions = sanitizeNumber(value);
        if (isNaN(numDeductions) || numDeductions < 0) {
          return "Deductions must be a valid positive amount";
        }
        if (numDeductions > sanitizeNumber(data.totalIncome)) {
          return "Deductions cannot exceed total income";
        }
      }
      return undefined;

    case "deductorName":
      if (!value) return "Employer / Deductor Name is required";
      if (!isValidName(value, 2, 100)) {
        return "Employer / Deductor Name must contain English letters and single spaces only";
      }
      return undefined;

    case "deductorTan":
      if (!value) return "Deductor TAN is required";
      if (value.length !== 10) return "TAN must be exactly 10 characters";
      if (!TAN_REGEX.test(value)) return "Invalid TAN format (e.g. BLRA12345C)";
      return undefined;

    case "tdsAmount":
      if (!value) return "TDS Amount is required";
      const numTds = sanitizeNumber(value);
      if (isNaN(numTds) || numTds <= 0) return "Enter TDS amount greater than ₹0";
      return undefined;

    case "deductedSection":
      if (!value) return "Please select the deducted section";
      return undefined;

    case "bankName":
      if (!value) return "Bank name is required";
      if (!isValidName(value, 2, 100)) {
        return "Bank name must contain English letters and single spaces only";
      }
      return undefined;

    case "accountNumber":
      if (!value) return "Account number is required";
      if (!ACCOUNT_REGEX.test(value)) return "Account number must be 9 to 18 digits";
      return undefined;

    case "ifscCode":
      if (!value) return "IFSC Code is required";
      if (value.length !== 11) return "IFSC code must be exactly 11 characters";
      if (!IFSC_REGEX.test(value)) return "Invalid IFSC format (e.g. HDFC0001234)";
      return undefined;

    case "previousItrFiled":
      if (!value) return "Please select if previous ITR was filed";
      return undefined;

    default:
      return undefined;
  }
};

export const validateField = (
  key: TdsFormFieldKey,
  data: TdsFormData
): string | undefined => validateSingleField(key, data);

export const validateTdsForm = (
  data: TdsFormData
): { isValid: boolean; errors: TdsFormErrors } => {
  const fields: TdsFormFieldKey[] = [
    "panNumber",
    "assessmentYear",
    "totalIncome",
    "totalDeductions",
    "deductorName",
    "deductorTan",
    "tdsAmount",
    "deductedSection",
    "bankName",
    "accountNumber",
    "ifscCode",
    "previousItrFiled",
  ];

  const errors = fields.reduce<TdsFormErrors>((acc, fieldKey) => {
    const error = validateSingleField(fieldKey, data);
    return error ? { ...acc, [fieldKey]: error } : acc;
  }, {});

  const isValid = Object.keys(errors).length === 0;

  return { isValid, errors };
};
