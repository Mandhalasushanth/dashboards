import type { IconName } from "@/types/domain";

// ─── Domain Types ─────────────────────────────────────────────────────────────

export interface SignupForm {
  name: string;
  email: string;
  mobileNumber: string;
  gender: string;
  dob: string;
  fatherSpouseName: string;
  pan: string;
  aadhaar: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  pincode: string;
  state: string;
  password: string;
  confirmPassword: string;
  customerType: string;
}

export type SignupErrors = Partial<Record<keyof SignupForm | "terms", string>>;

// ─── Constants ────────────────────────────────────────────────────────────────

export interface CustomerTypeOption {
  key: string;
  title: string;
  subtitle: string;
  icon: IconName;
}

export const CUSTOMER_TYPE_OPTIONS: CustomerTypeOption[] = [
  { key: "Individual", title: "Individual", subtitle: "Salaried professionals & individual taxpayers", icon: "person-outline" },
  { key: "Proprietorship", title: "Proprietorship", subtitle: "Single-owner business entities & local shops", icon: "storefront-outline" },
  { key: "Partnership", title: "Partnership", subtitle: "Registered partnership firms with 2+ partners", icon: "people-outline" },
  { key: "LLP", title: "LLP", subtitle: "Limited Liability Partnership firms", icon: "shield-checkmark-outline" },
  { key: "Private Limited", title: "Private Limited", subtitle: "Pvt Ltd companies & scalable startups", icon: "business-outline" },
  { key: "Public Limited", title: "Public Limited", subtitle: "Publicly traded or listed corporations", icon: "podium-outline" },
  { key: "HUF", title: "HUF", subtitle: "Hindu Undivided Family tax units", icon: "home-outline" },
  { key: "AOP / BOI", title: "AOP / BOI", subtitle: "Association of Persons or Body of Individuals", icon: "layers-outline" },
  { key: "Freelancer", title: "Freelancer", subtitle: "Independent contractors, gig workers & consultants", icon: "laptop-outline" },
  { key: "NGO / Trust", title: "NGO / Trust", subtitle: "Non-profit entities, trusts & societies", icon: "heart-outline" },
];

export const GENDER_OPTIONS = ["Male", "Female", "Other"] as const;

export const INDIAN_STATES_AND_UTS = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi (NCT)",
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
] as const;
