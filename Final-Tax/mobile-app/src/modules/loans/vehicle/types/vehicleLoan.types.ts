export const VEHICLE_CONDITION_OPTIONS = ["New Vehicle", "Used Vehicle"] as const;
export const VEHICLE_CATEGORY_OPTIONS = [
  "Car",
  "Two-Wheeler",
  "Commercial Vehicle",
  "Other",
] as const;
export const VEHICLE_DEALER_OPTIONS = ["Yes", "No"] as const;
export const VEHICLE_PURCHASE_TIMELINE_OPTIONS = [
  "Within 7 days",
  "Within 30 days",
  "1–3 months",
  "Just exploring",
] as const;

export type VehicleCondition = (typeof VEHICLE_CONDITION_OPTIONS)[number];
export type VehicleCategory = (typeof VEHICLE_CATEGORY_OPTIONS)[number];
export type VehicleDealerSelection = (typeof VEHICLE_DEALER_OPTIONS)[number];
export type VehiclePurchaseTimeline =
  (typeof VEHICLE_PURCHASE_TIMELINE_OPTIONS)[number];

export interface VehicleLoanFormData {
  requestedLoanAmount: string;
  vehicleCondition: VehicleCondition | "";
  vehicleCategory: VehicleCategory | "";
  vehicleCategoryOther: string;
  make: string;
  model: string;
  approximateVehiclePrice: string;
  dealerSelected: VehicleDealerSelection | "";
  dealerName: string;
  purchaseTimeline: VehiclePurchaseTimeline | "";
  registrationState: string;
}

export type VehicleMoneyField =
  | "requestedLoanAmount"
  | "approximateVehiclePrice";

export type VehicleLoanErrors = Partial<
  Record<keyof VehicleLoanFormData, string>
>;

export const createInitialVehicleLoanFormData = (): VehicleLoanFormData => ({
  requestedLoanAmount: "",
  vehicleCondition: "",
  vehicleCategory: "",
  vehicleCategoryOther: "",
  make: "",
  model: "",
  approximateVehiclePrice: "",
  dealerSelected: "",
  dealerName: "",
  purchaseTimeline: "",
  registrationState: "",
});
