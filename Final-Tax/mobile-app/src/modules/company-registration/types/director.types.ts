export interface DirectorInfo {
  id: string;
  name: string;
  pan: string;
  aadhaar?: string;
  dob?: string;
  fatherName?: string;
  gender?: string;
  nationality?: string;
  placeOfBirth?: string;

  occupation?: string;
  educationalQualification?: string;
  designation?: string;
  category?: string;

  email: string;
  phone?: string;

  hasDin?: boolean;
  din?: string;
  hasDsc?: boolean;
  sharesPercentage?: number;
  residentialAddress?: string;

  // Residency & Permanent Address
  isResidentInIndia?: boolean;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  district?: string;
  state?: string;
  pinCode?: string;

  // Same Address Checkbox & Present Address
  sameAsPermanentAddress?: boolean;
  presentAddressLine1?: string;
  presentAddressLine2?: string;
  presentCity?: string;
  presentDistrict?: string;
  presentState?: string;
  presentPincode?: string;

  // Share Subscription
  numberOfShares?: number;
  amountSubscribed?: number;

  // Document fields (kept in interface for backend schema compatibility)
  identityProofDocName?: string;
  residentialAddressProofDocName?: string;
}

export interface OpcNomineeInfo {
  name: string;
  pan: string;
  aadhaar: string;
  email: string;
  phone: string;
  relationship: string;
  dob?: string;
}

export interface PartnerInfo {
  id: string;
  name: string;
  pan: string;
  aadhaar: string;
  email: string;
  phone: string;
  contributionAmount: number;
  profitSharePercentage: number;
  capitalContribution?: number;
  profitSharingRatio?: number;
}
