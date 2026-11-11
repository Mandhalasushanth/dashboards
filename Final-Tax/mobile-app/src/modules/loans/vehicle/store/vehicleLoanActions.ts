import type { StoreApi } from "zustand";
import { toSingleLine } from "../../utils/textInput";
import type { LoansStoreState } from "../../store/loansStore.types";
import {
  createInitialVehicleLoanFormData,
  type VehicleLoanFormData,
  type VehicleMoneyField,
} from "../types/vehicleLoan.types";
import { validateVehicleLoanForm } from "../validation/vehicleLoanValidation";
import {
  getVehicleLoanDocuments,
  VEHICLE_DOCUMENT_IDS,
} from "../constants/vehicleLoanDocuments";

type VehicleActionKeys =
  | "setVehicleLoanField"
  | "setVehicleMoneyInputValidity"
  | "validateVehicleLoanForm"
  | "clearVehicleLoanErrors"
  | "resetVehicleLoanFormData";

const INVALID_MONEY_MESSAGE =
  "Enter a whole-rupee amount using numbers only";

export function createVehicleLoanActions(
  set: StoreApi<LoansStoreState>["setState"],
  get: StoreApi<LoansStoreState>["getState"]
): Pick<LoansStoreState, VehicleActionKeys> {
  const vehicleDocumentIds = new Set<string>(Object.values(VEHICLE_DOCUMENT_IDS));

  return {
    setVehicleLoanField: (field, value) =>
      set((state) => {
        const normalized = (
          typeof value === "string" ? toSingleLine(value) : value
        ) as VehicleLoanFormData[typeof field];
        const vehicleFormData = {
          ...state.vehicleFormData,
          [field]: normalized,
        };
        const vehicleErrors = { ...state.vehicleErrors };
        delete vehicleErrors[field];
        const invalidVehicleMoneyFields = {
          ...state.invalidVehicleMoneyFields,
        };

        if (field === "requestedLoanAmount" || field === "approximateVehiclePrice") {
          delete invalidVehicleMoneyFields[field as VehicleMoneyField];
        }
        if (field === "vehicleCategory" && value !== "Other") {
          vehicleFormData.vehicleCategoryOther = "";
          delete vehicleErrors.vehicleCategoryOther;
        }
        if (field === "dealerSelected" && value === "No") {
          vehicleFormData.dealerName = "";
          delete vehicleErrors.dealerName;
        }

        if (
          field === "vehicleCondition" &&
          normalized !== state.vehicleFormData.vehicleCondition
        ) {
          const compatibleDocumentIds = new Set(
            getVehicleLoanDocuments(vehicleFormData).map((item) => item.id)
          );
          const uploadedDocuments = Object.fromEntries(
            Object.entries(state.uploadedDocuments).filter(
              ([id]) =>
                !vehicleDocumentIds.has(id) || compatibleDocumentIds.has(id)
            )
          );
          const documentErrors = Object.fromEntries(
            Object.entries(state.reviewErrors.documents ?? {}).filter(
              ([id]) =>
                !vehicleDocumentIds.has(id) || compatibleDocumentIds.has(id)
            )
          );
          return {
            vehicleFormData,
            vehicleErrors,
            invalidVehicleMoneyFields,
            uploadedDocuments,
            reviewErrors: {
              ...state.reviewErrors,
              documents: documentErrors,
            },
          };
        }

        return {
          vehicleFormData,
          vehicleErrors,
          invalidVehicleMoneyFields,
        };
      }),

    setVehicleMoneyInputValidity: (field, isValid) =>
      set((state) => {
        const invalidVehicleMoneyFields = {
          ...state.invalidVehicleMoneyFields,
        };
        const vehicleErrors = { ...state.vehicleErrors };
        if (isValid) {
          delete invalidVehicleMoneyFields[field];
          delete vehicleErrors[field];
        } else {
          invalidVehicleMoneyFields[field] = true;
          vehicleErrors[field] = INVALID_MONEY_MESSAGE;
        }
        return { invalidVehicleMoneyFields, vehicleErrors };
      }),

    validateVehicleLoanForm: () => {
      const { isValid, errors } = validateVehicleLoanForm(
        get().vehicleFormData,
        get().invalidVehicleMoneyFields
      );
      set({ vehicleErrors: errors });
      return isValid;
    },

    clearVehicleLoanErrors: () => set({ vehicleErrors: {} }),

    resetVehicleLoanFormData: () =>
      set({
        vehicleFormData: createInitialVehicleLoanFormData(),
        vehicleErrors: {},
        invalidVehicleMoneyFields: {},
      }),
  };
}
