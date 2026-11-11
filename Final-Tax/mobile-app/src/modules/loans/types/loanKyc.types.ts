import type { LoanCategory } from "./loanCategory.types";

export interface LoanKycAddress {
  houseNumber: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
}

export interface KycRequirementConfig {
  requireDob?: boolean;
  requirePan?: boolean;
  requireAadhaar?: boolean;
  requireEmail?: boolean;
  /** False hides the Aadhaar field (the KYC provider supplies it). Defaults to true. */
  showAadhaar?: boolean;
}

export interface LoanKycData {
  fullName: string;
  mobile: string;
  email: string;
  pan: string;
  aadhaar: string;
  dob: string;
  currentAddress: LoanKycAddress;
  isPermanentSameAsCurrent: boolean;
  permanentAddress: LoanKycAddress;
  consentGiven: boolean;
  isProfilePrefilled?: boolean;
  isProfileLocked?: boolean;
}

export type LoanKycErrors = {
  fullName?: string;
  mobile?: string;
  email?: string;
  pan?: string;
  aadhaar?: string;
  dob?: string;
  "currentAddress.houseNumber"?: string;
  "currentAddress.street"?: string;
  "currentAddress.city"?: string;
  "currentAddress.state"?: string;
  "currentAddress.pincode"?: string;
  "permanentAddress.houseNumber"?: string;
  "permanentAddress.street"?: string;
  "permanentAddress.city"?: string;
  "permanentAddress.state"?: string;
  "permanentAddress.pincode"?: string;
  consentGiven?: string;
};

export type LoanKycVerificationStatus =
  | "idle"
  | "not_connected"
  | "pending"
  | "verifying"
  | "verified"
  | "failed";

export interface LoansFlowState {
  selectedCategory: LoanCategory | null;
  activeStep: "categories" | "kyc" | "loan-details";
  kycData: LoanKycData;
  kycStatus: LoanKycVerificationStatus;
  kycErrors: LoanKycErrors;
  isSubmitting: boolean;
}

