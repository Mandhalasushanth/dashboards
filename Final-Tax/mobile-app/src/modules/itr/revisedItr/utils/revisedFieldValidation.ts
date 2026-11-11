import { RevisedFormFields, RevisionReasonId } from "../types/revisedItr.types";
import { validators } from "@/shared/validation/validators";

export const validateSingleField = (
  field: keyof RevisedFormFields,
  value: string,
  reason: RevisionReasonId | string = "missed_income"
): string | undefined => {
  const val = (value || "").trim();

  if (field === "salaryBusinessIncome" && (reason === "missed_income" || reason === "other")) {
    if (!val) return "Salary / Business income is required.";
    const num = Number(val.replace(/,/g, ""));
    if (isNaN(num) || num < 0) return "Please enter a valid income amount.";
  }

  if (field === "taxableIncome") {
    if (!val) return "Taxable income is required.";
    const num = Number(val.replace(/,/g, ""));
    if (isNaN(num) || num < 0) return "Please enter a valid taxable income amount.";
  }

  if (field === "sec80c" && val) {
    const num = Number(val.replace(/,/g, ""));
    if (num > 150000) return "Section 80C deduction cannot exceed ₹1,50,000.";
  }

  if (field === "sec80d" && val) {
    const num = Number(val.replace(/,/g, ""));
    if (num > 100000) return "Section 80D deduction cannot exceed ₹1,00,000.";
  }

  if (field === "homeLoanInterest" && val) {
    const num = Number(val.replace(/,/g, ""));
    if (num > 200000) return "Home loan interest deduction cannot exceed ₹2,00,000.";
  }

  if (field === "bankAccount" && (reason === "incorrect_bank" || reason === "other")) {
    return validators.bankAccountNumber("Bank account for refund")(val) || undefined;
  }

  if (field === "ifsc" && (reason === "incorrect_bank" || reason === "other")) {
    return validators.ifsc("IFSC")(val) || undefined;
  }

  return undefined;
};

export const validateAllRevisedFields = (
  form: RevisedFormFields,
  reason: RevisionReasonId | string
): Partial<Record<keyof RevisedFormFields, string>> => {
  const errors: Partial<Record<keyof RevisedFormFields, string>> = {};

  if (reason === "missed_income" || reason === "other") {
    const salaryErr = validateSingleField("salaryBusinessIncome", form.salaryBusinessIncome || "", reason);
    if (salaryErr) errors.salaryBusinessIncome = salaryErr;

    const taxErr = validateSingleField("taxableIncome", form.taxableIncome || "", reason);
    if (taxErr) errors.taxableIncome = taxErr;
  }

  if (reason === "wrong_deduction" || reason === "other") {
    if (reason === "wrong_deduction") {
      const taxErr = validateSingleField("taxableIncome", form.taxableIncome || "", reason);
      if (taxErr) errors.taxableIncome = taxErr;

      const hasAnyDeduction =
        (form.sec80c || "").trim() ||
        (form.sec80d || "").trim() ||
        (form.homeLoanInterest || "").trim();
      if (!hasAnyDeduction) {
        errors.sec80c = "Please enter at least one deduction to revise.";
      }
    }

    if (form.sec80c) {
      const err80c = validateSingleField("sec80c", form.sec80c, reason);
      if (err80c) errors.sec80c = err80c;
    }
    if (form.sec80d) {
      const err80d = validateSingleField("sec80d", form.sec80d, reason);
      if (err80d) errors.sec80d = err80d;
    }
    if (form.homeLoanInterest) {
      const errHl = validateSingleField("homeLoanInterest", form.homeLoanInterest, reason);
      if (errHl) errors.homeLoanInterest = errHl;
    }
  }

  if (reason === "incorrect_bank" || reason === "other") {
    const bankErr = validateSingleField("bankAccount", form.bankAccount || "", reason);
    if (bankErr) errors.bankAccount = bankErr;

    const ifscErr = validateSingleField("ifsc", form.ifsc || "", reason);
    if (ifscErr) errors.ifsc = ifscErr;
  }

  return errors;
};
