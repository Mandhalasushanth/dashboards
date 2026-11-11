export const MSME_CONSTITUTION_OPTIONS = [
  "Proprietorship",
  "Partnership",
  "LLP",
  "Private Limited Company",
  "Public Limited Company",
  "Other",
] as const;

export const MSME_BUSINESS_ACTIVITY_OPTIONS = [
  "Manufacturing",
  "Service Provider",
  "Wholesale Trading",
  "Retail Trading",
  "IT / Software Services",
  "Food & Agro Processing",
  "Textiles & Apparel",
  "Automotive & Engineering",
  "Other",
] as const;

export const MSME_REGISTRATION_STATUS_OPTIONS = [
  "Registered",
  "Not Registered",
  "Applied / Pending",
] as const;

export const MSME_GST_STATUS_OPTIONS = [
  "Registered",
  "Not Registered",
  "Exempt",
] as const;

export const MSME_DURATION_OPTIONS = [
  "Less than 1 year",
  "1–3 years",
  "3–5 years",
  "5–10 years",
  "More than 10 years",
] as const;

export const MSME_OWNERSHIP_OPTIONS = [
  "Sole Owner",
  "Joint Ownership",
  "Other",
] as const;

export type MsmeConstitution = (typeof MSME_CONSTITUTION_OPTIONS)[number];
export type MsmeBusinessActivity = (typeof MSME_BUSINESS_ACTIVITY_OPTIONS)[number];
export type MsmeRegistrationStatus =
  | (typeof MSME_REGISTRATION_STATUS_OPTIONS)[number]
  | "Yes"
  | "No";
export type MsmeGstStatus =
  | (typeof MSME_GST_STATUS_OPTIONS)[number]
  | "Yes"
  | "No";
export type MsmeOperatingDuration = (typeof MSME_DURATION_OPTIONS)[number];
export type MsmeOwnership = (typeof MSME_OWNERSHIP_OPTIONS)[number];

export interface MsmeLoanAddress {
  houseNumber: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
}

export interface MsmeLoanFormData {
  // Section 1: Business Details
  businessName: string;
  constitution: MsmeConstitution | "";
  constitutionOther: string;

  // Section 2: Business Activity
  businessActivity: MsmeBusinessActivity | "";
  businessActivityOther: string;
  establishmentDate: string;

  // Section 3: Business Address
  operatingAddress: MsmeLoanAddress;

  // Section 4: MSME Registration
  udyamStatus: MsmeRegistrationStatus | "";
  udyamRegistrationNumber: string;
  gstStatus: MsmeGstStatus | "";
  gstin: string;

  // Section 5: Business Information
  operatingDuration: MsmeOperatingDuration | "";
  numberOfEmployees: string;
  annualTurnover: string;
  ownershipType: MsmeOwnership | "";
  ownershipTypeOther: string;
}

export type MsmeMoneyField = "annualTurnover";

export type MsmeLoanErrors = Partial<
  Record<
    | keyof MsmeLoanFormData
    | `operatingAddress.${keyof MsmeLoanAddress}`
    | "general",
    string
  >
>;

export const createInitialMsmeLoanAddress = (): MsmeLoanAddress => ({
  houseNumber: "",
  street: "",
  city: "",
  state: "",
  pincode: "",
});

export const createInitialMsmeLoanFormData = (): MsmeLoanFormData => ({
  businessName: "",
  constitution: "",
  constitutionOther: "",
  businessActivity: "",
  businessActivityOther: "",
  establishmentDate: "",
  operatingAddress: createInitialMsmeLoanAddress(),
  udyamStatus: "",
  udyamRegistrationNumber: "",
  gstStatus: "",
  gstin: "",
  operatingDuration: "",
  numberOfEmployees: "",
  annualTurnover: "",
  ownershipType: "",
  ownershipTypeOther: "",
});
