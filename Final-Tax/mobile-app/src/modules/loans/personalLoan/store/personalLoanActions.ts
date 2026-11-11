import type { StoreApi } from "zustand";
import { toSingleLine } from "../../utils/textInput";
import {
  createInitialPersonalFormData,
  type LoansStoreState,
} from "../../store/loansStore.types";
import { validatePersonalLoanForm } from "../validation/personalLoanValidation";

type PersonalActionKeys =
  | "setPersonalEmploymentType"
  | "setPersonalLoanField"
  | "validatePersonalForm"
  | "clearPersonalErrors"
  | "resetPersonalFormData";

/** Personal Loan form actions of the loans store (Screen 2: Employment & Income). */
export function createPersonalActions(
  set: StoreApi<LoansStoreState>["setState"],
  get: StoreApi<LoansStoreState>["getState"]
): Pick<LoansStoreState, PersonalActionKeys> {
  return {
    setPersonalEmploymentType: (type) =>
      set((state) => ({
        personalFormData: { ...state.personalFormData, employmentType: type },
        personalErrors: {},
      })),

    setPersonalLoanField: (field, value) =>
      set((state) => {
        const nextErrors = { ...state.personalErrors };
        delete nextErrors[field];
        const cleanValue =
          typeof value === "string" ? (toSingleLine(value) as typeof value) : value;
        const updated = {
          ...state.personalFormData,
          [field]: cleanValue,
        };
        if (field === "loanAmount") {
          updated.requestedAmount = cleanValue as string;
          delete nextErrors.requestedAmount;
        }
        if (field === "requestedAmount") {
          updated.loanAmount = cleanValue as string;
          delete nextErrors.loanAmount;
        }
        if (field === "employerName") {
          updated.companyName = cleanValue as string;
          delete nextErrors.companyName;
        }
        if (field === "companyName") {
          updated.employerName = cleanValue as string;
          delete nextErrors.employerName;
        }
        if (field === "monthlyNetSalary") {
          updated.monthlySalary = cleanValue as string;
          delete nextErrors.monthlySalary;
        }
        if (field === "monthlySalary") {
          updated.monthlyNetSalary = cleanValue as string;
          delete nextErrors.monthlyNetSalary;
        }
        if (field === "businessOrProfessionName") {
          updated.professionName = cleanValue as string;
          delete nextErrors.professionName;
        }
        if (field === "professionName") {
          updated.businessOrProfessionName = cleanValue as string;
          delete nextErrors.businessOrProfessionName;
        }
        if (field === "averageMonthlyIncome") {
          updated.monthlyIncome = cleanValue as string;
          delete nextErrors.monthlyIncome;
        }
        if (field === "monthlyIncome") {
          updated.averageMonthlyIncome = cleanValue as string;
          delete nextErrors.averageMonthlyIncome;
        }

        return {
          personalFormData: updated,
          personalErrors: nextErrors,
        };
      }),

    validatePersonalForm: () => {
      const { isValid, errors } = validatePersonalLoanForm(get().personalFormData);
      set({ personalErrors: errors });
      return isValid;
    },

    clearPersonalErrors: () => set({ personalErrors: {} }),
    resetPersonalFormData: () =>
      set({
        personalFormData: createInitialPersonalFormData(),
        personalErrors: {},
      }),
  };
}
