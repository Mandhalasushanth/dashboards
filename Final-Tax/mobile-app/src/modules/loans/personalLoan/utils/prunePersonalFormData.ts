import type { PersonalLoanFormData } from "../types/personalLoan.types";

/**
 * The personal loan data to submit: only the chosen employment type's fields and the loan
 * requirement. The form keeps the other type's values so switching back loses nothing.
 */
export function prunePersonalFormData(
  form: PersonalLoanFormData
): PersonalLoanFormData {
  const base = {
    employmentType: form.employmentType,
    loanAmount: form.loanAmount,
    requestedAmount: form.requestedAmount,
    purpose: form.purpose,
    purposeOther: form.purposeOther,
  };
  const none = {
    employerName: "",
    companyName: "",
    jobType: "",
    monthlyNetSalary: "",
    monthlySalary: "",
    workExperience: "",
    salaryCreditMethod: "" as const,
    businessOrProfessionName: "",
    professionName: "",
    natureOfBusiness: "",
    averageMonthlyIncome: "",
    monthlyIncome: "",
    yearsInBusiness: "",
  };
  return form.employmentType === "salaried"
    ? {
        ...none,
        ...base,
        employerName: form.employerName,
        companyName: form.companyName,
        jobType: form.jobType,
        monthlyNetSalary: form.monthlyNetSalary,
        monthlySalary: form.monthlySalary,
        workExperience: form.workExperience,
        salaryCreditMethod: form.salaryCreditMethod,
      }
    : {
        ...none,
        ...base,
        businessOrProfessionName: form.businessOrProfessionName,
        professionName: form.professionName,
        natureOfBusiness: form.natureOfBusiness,
        averageMonthlyIncome: form.averageMonthlyIncome,
        monthlyIncome: form.monthlyIncome,
        yearsInBusiness: form.yearsInBusiness,
      };
}
