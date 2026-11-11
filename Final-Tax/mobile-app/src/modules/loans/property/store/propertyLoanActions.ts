import type { StoreApi } from "zustand";
import type { LoansStoreState } from "../../store/loansStore.types";
import { toSingleLine } from "../../utils/textInput";
import { normalizeMoneyInput } from "../../utils/moneyInput";
import {
  createInitialPropertyFormData,
  type PropertyLoanFormData,
} from "../types/property.types";
import { validatePropertyLoanForm } from "../validation/propertyLoanValidation";
import { getOwnershipOptions } from "../utils/propertyFlow";

type PropertyActionKeys =
  | "setPropertyField"
  | "validatePropertyForm"
  | "clearPropertyErrors"
  | "resetPropertyFormData";

const PIN_LENGTH = 6;

/** Normalises a typed or pasted value for its field before it reaches the form. */
function cleanFieldValue(field: keyof PropertyLoanFormData, value: string): string {
  if (field === "requestedAmount") return normalizeMoneyInput(value);
  if (field === "pinCode") return value.replace(/\D/g, "").slice(0, PIN_LENGTH);
  return toSingleLine(value);
}

/** Property / Home Loan form actions of the loans store (Screen 2). */
export function createPropertyActions(
  set: StoreApi<LoansStoreState>["setState"],
  get: StoreApi<LoansStoreState>["getState"]
): Pick<LoansStoreState, PropertyActionKeys> {
  return {
    setPropertyField: (field, value) =>
      set((state) => {
        const next: PropertyLoanFormData = {
          ...state.propertyFormData,
          [field]: cleanFieldValue(field, String(value)),
        };
        const errors = { ...state.propertyErrors };
        delete errors[field];

        if (field === "purpose") {
          // A purpose change can make the previous ownership choice or stage question
          // inapplicable; their old errors must not linger.
          const allowed = getOwnershipOptions(next.purpose) as readonly string[];
          if (next.ownership && !allowed.includes(next.ownership)) {
            next.ownership = "";
          }
          delete errors.ownership;
          delete errors.purposeOther;
          delete errors.propertyStatus;
          delete errors.constructionStage;
          delete errors.renovationStatus;
        }
        return { propertyFormData: next, propertyErrors: errors };
      }),

    validatePropertyForm: () => {
      const { isValid, errors } = validatePropertyLoanForm(get().propertyFormData);
      set({ propertyErrors: errors });
      return isValid;
    },

    clearPropertyErrors: () => set({ propertyErrors: {} }),

    resetPropertyFormData: () =>
      set({
        propertyFormData: createInitialPropertyFormData(),
        propertyErrors: {},
      }),
  };
}
