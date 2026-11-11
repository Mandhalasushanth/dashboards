import type { Customer, CustomerProfile, ProfileFormValues, ProfileFormErrors } from "../../../shared/types/domain";

export type { Customer, CustomerProfile, ProfileFormValues, ProfileFormErrors };

export interface KYCDetails {
  pan: string;
  aadhaar: string;
  isVerified: boolean;
  panDocumentUri?: string;
  aadhaarDocumentUri?: string;
}
