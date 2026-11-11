import { createInitialBusinessFormData } from "@/modules/loans/store/loansStore.types";
import type { BusinessLoanFormData } from "../types/businessLoan.types";
import { isProjectCostRequired } from "../validation/businessLoanValidation";

/**
 * The application data to submit: values of the other loan type, and a project cost the
 * chosen purpose does not need, are dropped. The form itself keeps them so the customer
 * loses nothing when switching loan type.
 */
export function pruneBusinessFormData(
  form: BusinessLoanFormData
): BusinessLoanFormData {
  const empty = createInitialBusinessFormData();
  if (form.loanType === "business-loan") {
    return {
      ...form,
      businessLoan: {
        ...form.businessLoan,
        projectCost: isProjectCostRequired(form.businessLoan.purpose)
          ? form.businessLoan.projectCost
          : "",
      },
      workingCapital: empty.workingCapital,
    };
  }
  return { ...form, businessLoan: empty.businessLoan };
}
