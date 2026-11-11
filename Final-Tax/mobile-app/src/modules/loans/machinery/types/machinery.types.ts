export const MACHINERY_TYPE_OPTIONS = [
  "Manufacturing Machinery",
  "Construction Machinery",
  "Agricultural Machinery",
  "Medical Equipment",
  "Printing Machinery",
  "Packaging Machinery",
  "Textile Machinery",
  "Food Processing Machinery",
  "CNC / Industrial Machinery",
  "Other",
] as const;

export const MACHINERY_CONDITION_OPTIONS = [
  "New",
  "Used / Pre-owned",
] as const;

export const MACHINERY_PURCHASE_TYPE_OPTIONS = [
  "Direct from Manufacturer",
  "Authorized Dealer",
  "Other Supplier",
] as const;

export type MachineryType = (typeof MACHINERY_TYPE_OPTIONS)[number];
export type MachineryCondition = (typeof MACHINERY_CONDITION_OPTIONS)[number];
export type MachineryPurchaseType =
  (typeof MACHINERY_PURCHASE_TYPE_OPTIONS)[number];

export interface MachineryLoanFormData {
  requestedLoanAmount: string;
  machineryType: MachineryType | "";
  machineryTypeOther: string;
  machineryName: string;
  machineryCondition: MachineryCondition | "";
  purchaseType: MachineryPurchaseType | "";
  purchaseTypeOther: string;
  approximateMachineryCost: string;
  dealerName: string;
}

export type MachineryMoneyField =
  | "requestedLoanAmount"
  | "approximateMachineryCost";

export type MachineryLoanErrors = Partial<
  Record<keyof MachineryLoanFormData, string>
>;

export const createInitialMachineryLoanFormData = (): MachineryLoanFormData => ({
  requestedLoanAmount: "",
  machineryType: "",
  machineryTypeOther: "",
  machineryName: "",
  machineryCondition: "",
  purchaseType: "",
  purchaseTypeOther: "",
  approximateMachineryCost: "",
  dealerName: "",
});
