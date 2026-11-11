import type { StoreApi } from "zustand";
import { toSingleLine } from "../../utils/textInput";
import type { LoansStoreState } from "../../store/loansStore.types";
import {
  createInitialMsmeLoanFormData,
  type MsmeLoanAddress,
  type MsmeLoanErrors,
  type MsmeLoanFormData,
  type MsmeMoneyField,
} from "../types/msmeLoan.types";
import { validateMsmeLoanForm } from "../validation/msmeLoanValidation";
import {
  MSME_DOCUMENT_IDS,
  getMsmeLoanDocuments,
  isUdyamRegistered,
  isGstRegistered,
} from "../constants/msmeDocuments";

export type MsmeActionKeys =
  | "setMsmeLoanField"
  | "setMsmeAddressField"
  | "setMsmeMoneyInputValidity"
  | "validateMsmeLoanForm"
  | "clearMsmeLoanErrors"
  | "resetMsmeLoanFormData";

const INVALID_MONEY_MESSAGE =
  "Enter a whole-rupee amount using numbers only";

export function createMsmeLoanActions(
  set: StoreApi<LoansStoreState>["setState"],
  get: StoreApi<LoansStoreState>["getState"]
): Pick<LoansStoreState, MsmeActionKeys> {
  return {
    setMsmeLoanField: (field, value) =>
      set((state) => {
        const normalized = (
          typeof value === "string" ? toSingleLine(value) : value
        ) as MsmeLoanFormData[typeof field];

        const msmeFormData = {
          ...state.msmeFormData,
          [field]: normalized,
        };
        const msmeErrors: MsmeLoanErrors = { ...state.msmeErrors };
        delete (msmeErrors as Record<string, string | undefined>)[field as string];

        const invalidMsmeMoneyFields = {
          ...state.invalidMsmeMoneyFields,
        };

        if (field === "annualTurnover") {
          delete invalidMsmeMoneyFields.annualTurnover;
        }

        if (field === "constitution" && value !== "Other") {
          msmeFormData.constitutionOther = "";
          delete msmeErrors.constitutionOther;
        }

        if (field === "businessActivity" && value !== "Other") {
          msmeFormData.businessActivityOther = "";
          delete msmeErrors.businessActivityOther;
        }

        if (field === "udyamStatus" && !isUdyamRegistered(String(value))) {
          msmeFormData.udyamRegistrationNumber = "";
          delete msmeErrors.udyamRegistrationNumber;
        }

        if (field === "gstStatus" && !isGstRegistered(String(value))) {
          msmeFormData.gstin = "";
          delete msmeErrors.gstin;
        }

        if (field === "ownershipType" && value !== "Other") {
          msmeFormData.ownershipTypeOther = "";
          delete msmeErrors.ownershipTypeOther;
        }

        if (field === "udyamStatus" || field === "gstStatus") {
          const compatibleDocumentIds = new Set(
            getMsmeLoanDocuments(msmeFormData).map((item) => item.id)
          );
          const msmeDocIds = new Set<string>(Object.values(MSME_DOCUMENT_IDS));
          const uploadedDocuments = Object.fromEntries(
            Object.entries(state.uploadedDocuments).filter(
              ([id]) =>
                !msmeDocIds.has(id) || compatibleDocumentIds.has(id)
            )
          );
          const documentErrors = Object.fromEntries(
            Object.entries(state.reviewErrors.documents ?? {}).filter(
              ([id]) =>
                !msmeDocIds.has(id) || compatibleDocumentIds.has(id)
            )
          );
          return {
            msmeFormData,
            msmeErrors,
            invalidMsmeMoneyFields,
            uploadedDocuments,
            reviewErrors: {
              ...state.reviewErrors,
              documents: documentErrors,
            },
          };
        }

        return {
          msmeFormData,
          msmeErrors,
          invalidMsmeMoneyFields,
        };
      }),

    setMsmeAddressField: (field: keyof MsmeLoanAddress, value: string) =>
      set((state) => {
        const normalized = toSingleLine(value);
        const operatingAddress = {
          ...state.msmeFormData.operatingAddress,
          [field]: normalized,
        };
        const msmeFormData = {
          ...state.msmeFormData,
          operatingAddress,
        };
        const msmeErrors = { ...state.msmeErrors };
        delete msmeErrors[`operatingAddress.${field}`];

        return {
          msmeFormData,
          msmeErrors,
        };
      }),

    setMsmeMoneyInputValidity: (field: MsmeMoneyField, isValid: boolean) =>
      set((state) => {
        const invalidMsmeMoneyFields = {
          ...state.invalidMsmeMoneyFields,
        };
        const msmeErrors = { ...state.msmeErrors };
        if (isValid) {
          delete invalidMsmeMoneyFields[field];
          delete msmeErrors[field];
        } else {
          invalidMsmeMoneyFields[field] = true;
          msmeErrors[field] = INVALID_MONEY_MESSAGE;
        }
        return { invalidMsmeMoneyFields, msmeErrors };
      }),

    validateMsmeLoanForm: () => {
      const { isValid, errors } = validateMsmeLoanForm(
        get().msmeFormData,
        get().invalidMsmeMoneyFields
      );
      set({ msmeErrors: errors });
      return isValid;
    },

    clearMsmeLoanErrors: () => set({ msmeErrors: {} }),

    resetMsmeLoanFormData: () =>
      set({
        msmeFormData: createInitialMsmeLoanFormData(),
        msmeErrors: {},
        invalidMsmeMoneyFields: {},
      }),
  };
}
