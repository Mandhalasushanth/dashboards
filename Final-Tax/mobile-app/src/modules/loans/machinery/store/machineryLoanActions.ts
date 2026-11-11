import type { StoreApi } from "zustand";
import { toSingleLine } from "../../utils/textInput";
import type { LoansStoreState } from "../../store/loansStore.types";
import {
  createInitialMachineryLoanFormData,
  type MachineryLoanFormData,
  type MachineryMoneyField,
} from "../types/machinery.types";
import { validateMachineryLoanForm } from "../validation/machineryLoanValidation";

type MachineryActionKeys =
  | "setMachineryLoanField"
  | "setMachineryMoneyInputValidity"
  | "validateMachineryLoanForm"
  | "clearMachineryLoanErrors"
  | "resetMachineryLoanFormData";

const INVALID_MONEY_MESSAGE =
  "Enter a whole-rupee amount using numbers only";

export function createMachineryLoanActions(
  set: StoreApi<LoansStoreState>["setState"],
  get: StoreApi<LoansStoreState>["getState"]
): Pick<LoansStoreState, MachineryActionKeys> {
  return {
    setMachineryLoanField: (field, value) =>
      set((state) => {
        const normalized = (
          typeof value === "string" ? toSingleLine(value) : value
        ) as MachineryLoanFormData[typeof field];
        const machineryFormData = {
          ...state.machineryFormData,
          [field]: normalized,
        };
        const machineryErrors = { ...state.machineryErrors };
        delete machineryErrors[field];
        const invalidMachineryMoneyFields = {
          ...state.invalidMachineryMoneyFields,
        };

        if (
          field === "requestedLoanAmount" ||
          field === "approximateMachineryCost"
        ) {
          delete invalidMachineryMoneyFields[field as MachineryMoneyField];
        }
        if (field === "machineryType" && value !== "Other") {
          machineryFormData.machineryTypeOther = "";
          delete machineryErrors.machineryTypeOther;
        }
        if (field === "purchaseType" && value !== "Other Supplier") {
          machineryFormData.purchaseTypeOther = "";
          delete machineryErrors.purchaseTypeOther;
        }

        return {
          machineryFormData,
          machineryErrors,
          invalidMachineryMoneyFields,
        };
      }),

    setMachineryMoneyInputValidity: (field, isValid) =>
      set((state) => {
        const invalidMachineryMoneyFields = {
          ...state.invalidMachineryMoneyFields,
        };
        const machineryErrors = { ...state.machineryErrors };
        if (isValid) {
          delete invalidMachineryMoneyFields[field];
          delete machineryErrors[field];
        } else {
          invalidMachineryMoneyFields[field] = true;
          machineryErrors[field] = INVALID_MONEY_MESSAGE;
        }
        return { invalidMachineryMoneyFields, machineryErrors };
      }),

    validateMachineryLoanForm: () => {
      const { isValid, errors } = validateMachineryLoanForm(
        get().machineryFormData,
        get().invalidMachineryMoneyFields
      );
      set({ machineryErrors: errors });
      return isValid;
    },

    clearMachineryLoanErrors: () => set({ machineryErrors: {} }),

    resetMachineryLoanFormData: () =>
      set({
        machineryFormData: createInitialMachineryLoanFormData(),
        machineryErrors: {},
        invalidMachineryMoneyFields: {},
      }),
  };
}
