import { INDIAN_STATES_AND_UTS } from "@/components/screens/create-profile/types";
import { toSingleLine } from "../../utils/textInput";
import {
  VEHICLE_CATEGORY_OPTIONS,
  VEHICLE_CONDITION_OPTIONS,
  VEHICLE_DEALER_OPTIONS,
  VEHICLE_PURCHASE_TIMELINE_OPTIONS,
  type VehicleLoanErrors,
  type VehicleLoanFormData,
  type VehicleMoneyField,
} from "../types/vehicleLoan.types";

export const VEHICLE_MAKE_MAX_LENGTH = 80;
export const VEHICLE_MODEL_MAX_LENGTH = 80;
export const VEHICLE_OTHER_MAX_LENGTH = 60;
export const VEHICLE_DEALER_MAX_LENGTH = 100;

function amountError(
  value: string,
  field: VehicleMoneyField,
  malformedFields: Partial<Record<VehicleMoneyField, boolean>> = {}
): string | undefined {
  if (malformedFields[field]) {
    return "Enter a whole-rupee amount using numbers only";
  }
  const raw = (value ?? "").trim();
  if (!raw) return "Enter an amount";

  // Decimals are strictly rejected
  if (raw.includes(".")) {
    return "Enter a whole-rupee amount using numbers only";
  }

  // Negative values are rejected
  if (raw.includes("-")) {
    return "Enter a valid whole-rupee amount";
  }

  // Scientific notation (e.g. 1e9) is rejected
  if (/[eE]/.test(raw)) {
    return "Enter a valid whole-rupee amount";
  }

  // Reject embedded spaces or newlines (e.g. "50 000")
  if (/\s/.test(raw)) {
    return "Enter a valid whole-rupee amount";
  }

  // Allow optional leading ₹ and commas only if correctly positioned
  const withoutSymbol = raw.replace(/^₹/, "").trim();
  if (/[^0-9,]/.test(withoutSymbol)) {
    return "Enter a whole-rupee amount using numbers only";
  }

  // If it contains commas, verify it is valid Indian comma grouping
  if (withoutSymbol.includes(",")) {
    const isIndianGrouped = /^\d{1,2}(?:,\d{2})*,\d{3}$/.test(withoutSymbol);
    if (!isIndianGrouped) {
      return "Enter a valid whole-rupee amount";
    }
  }

  const cleanedDigits = withoutSymbol.replace(/,/g, "");
  if (!/^\d+$/.test(cleanedDigits)) {
    return "Enter a valid whole-rupee amount";
  }

  const amount = Number(cleanedDigits);
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    return "Enter a valid whole-rupee amount";
  }

  return undefined;
}

function textError(
  value: string,
  label: string,
  maxLength: number
): string | undefined {
  const text = toSingleLine(value).trim();
  if (!text) return `Enter ${label}`;
  if (Array.from(text).length > maxLength) {
    return `${label} can be up to ${maxLength} characters`;
  }
  if (!/[\p{L}\p{N}]/u.test(text)) return `Enter a valid ${label}`;
  return undefined;
}

export function validateVehicleLoanForm(
  data: VehicleLoanFormData,
  malformedMoneyFields: Partial<Record<VehicleMoneyField, boolean>> = {}
): { isValid: boolean; errors: VehicleLoanErrors } {
  const errors: VehicleLoanErrors = {};
  const requestedAmountError = amountError(
    data.requestedLoanAmount,
    "requestedLoanAmount",
    malformedMoneyFields
  );
  if (requestedAmountError) {
    errors.requestedLoanAmount = requestedAmountError;
  }

  if (
    !(VEHICLE_CONDITION_OPTIONS as readonly string[]).includes(
      data.vehicleCondition
    )
  ) {
    errors.vehicleCondition = "Please select the vehicle condition";
  }

  if (
    !(VEHICLE_CATEGORY_OPTIONS as readonly string[]).includes(
      data.vehicleCategory
    )
  ) {
    errors.vehicleCategory = "Please select the vehicle category";
  } else if (data.vehicleCategory === "Other") {
    const otherError = textError(
      data.vehicleCategoryOther,
      "the vehicle category",
      VEHICLE_OTHER_MAX_LENGTH
    );
    if (otherError) errors.vehicleCategoryOther = otherError;
  }

  const makeError = textError(data.make, "the vehicle make / brand", VEHICLE_MAKE_MAX_LENGTH);
  if (makeError) errors.make = makeError;

  const modelError = textError(data.model, "the vehicle model", VEHICLE_MODEL_MAX_LENGTH);
  if (modelError) errors.model = modelError;

  const priceError = amountError(
    data.approximateVehiclePrice,
    "approximateVehiclePrice",
    malformedMoneyFields
  );
  if (priceError) errors.approximateVehiclePrice = priceError;

  if (
    !(VEHICLE_DEALER_OPTIONS as readonly string[]).includes(data.dealerSelected)
  ) {
    errors.dealerSelected = "Please select whether a dealer is selected";
  } else if (data.dealerSelected === "Yes") {
    const dealerError = textError(
      data.dealerName,
      "the dealer name",
      VEHICLE_DEALER_MAX_LENGTH
    );
    if (dealerError) errors.dealerName = dealerError;
  }

  if (
    !(VEHICLE_PURCHASE_TIMELINE_OPTIONS as readonly string[]).includes(
      data.purchaseTimeline
    )
  ) {
    errors.purchaseTimeline = "Please select a purchase timeline";
  }

  if (!(INDIAN_STATES_AND_UTS as readonly string[]).includes(data.registrationState)) {
    errors.registrationState = "Please select the registration state";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}
