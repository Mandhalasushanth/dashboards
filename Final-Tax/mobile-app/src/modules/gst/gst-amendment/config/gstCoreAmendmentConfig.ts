import { BrandColors } from "@/shared/theme";
import { AmendmentSectionConfig } from "../types/gstAmendmentTypes";

export const CORE_AMENDMENT_SECTIONS: AmendmentSectionConfig[] = [
  {
    id: "legal-name",
    title: "Legal Business Name",
    type: "core",
    typeLabel: "Core amendment - officer approval required",
    icon: "pricetag",
    image: require("@/../assets/images/services/gst/legal_business_name.png"),
    iconBg: "#FFF1E8",
    iconColor: BrandColors.PRIMARY_ORANGE,
  },
  {
    id: "principal-place",
    title: "Principal Place of Business",
    type: "core",
    typeLabel: "Core amendment - officer approval required",
    icon: "business",
    image: require("@/../assets/images/services/gst/principal_place_of_business.png"),
    iconBg: "#EAF1FE",
    iconColor: BrandColors.PRIMARY_BLUE,
  },
  {
    id: "additional-place",
    title: "Additional Place of Business",
    type: "core",
    typeLabel: "Core amendment - officer approval required",
    icon: "storefront",
    image: require("@/../assets/images/services/gst/additional_place_of_business.png"),
    iconBg: "#EAF1FE",
    iconColor: BrandColors.PRIMARY_BLUE_ACCENT,
  },
];

export const ADDRESS_PROOF_TYPES = [
  "Rental Agreement",
  "Ownership Proof",
  "Electricity Bill",
  "Other Address Proof",
];

export const INDIAN_STATES_AND_UTS = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

export const NATURE_OF_PREMISES_OPTIONS = [
  "Leased",
  "Warehouse",
  "Owned",
  "Rented",
  "Consent",
  "Shared",
  "Others",
];

export const CORE_ACCEPTED_PROOFS: Record<string, { initial: string[]; all: string[] }> = {
  "legal-name": {
    initial: [
      "Certificate of Incorporation / Name Change Certificate",
      "Revised Government Registration Certificate",
      "Official document showing the changed legal name",
    ],
    all: [
      "Certificate of Incorporation / Name Change Certificate",
      "Revised Certificate of Incorporation",
      "Government-issued business registration certificate showing the new legal name",
      "Revised LLP / Partnership Registration Document",
      "Government-issued order/document reflecting the changed legal name",
      "Other official name-change supporting document",
    ],
  },
  "principal-place": {
    initial: [
      "Property Tax Receipt",
      "Municipal Khata Certificate / Khata Copy",
      "Electricity Bill",
    ],
    all: [
      "Property Tax Receipt",
      "Municipal Khata Certificate / Khata Copy",
      "Electricity Bill",
      "Rent / Lease Agreement",
      "Consent Letter",
      "Government-issued document/certificate showing the premises",
      "Legal ownership document",
    ],
  },
  "additional-place": {
    initial: [
      "Property Tax Receipt",
      "Municipal Khata Certificate / Khata Copy",
      "Electricity Bill",
    ],
    all: [
      "Property Tax Receipt",
      "Municipal Khata Certificate / Khata Copy",
      "Electricity Bill",
      "Rent / Lease Agreement",
      "Consent Letter",
      "Government-issued document/certificate showing the premises",
      "Legal ownership document",
    ],
  },
};
