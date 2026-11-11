export type CompanyType =
  | 'Private Limited'
  | 'One Person Company (OPC)'
  | 'Section 8 (NGO)'
  | 'Public Limited'
  | 'Limited Liability Partnership (LLP)'
  | 'Sole Proprietorship';

export type CompanyClass = 'Private' | 'Public';
export type CompanyCategory = 'Company limited by Shares' | 'Company limited by Guarantee' | 'Unlimited Company';
export type CompanySubCategory = 'Indian Non-Government Company' | 'State Government Company' | 'Central Government Company';

export interface CompanyDetails {
  companyType: CompanyType;
  industryCategory?: string;
  businessActivityDescription?: string;
  // Classification
  companyClass: CompanyClass;
  companyCategory: CompanyCategory;
  companySubCategory: CompanySubCategory;
  // Business Activity & NIC
  primaryActivity: string;
  nicCode: string;
  secondaryActivity?: string;
  // Proposed Names
  proposedName1: string;
  proposedName2: string;
  proposedName3?: string;
  nameSuffix: string;
  nameAvailabilityStatus?: 'Available' | 'Pending Verification' | 'Reserved';
  // Registered Office
  registeredAddressLine: string;
  registeredCity: string;
  registeredDistrict?: string;
  registeredState: string;
  registeredPincode: string;
  premisesOwnership: 'Rented' | 'Owned' | 'Leased';
  companyEmail: string;
  companyMobile: string;
  officeAddressProofName?: string;
  officeAddressProofUri?: string;
  ownershipDocName?: string;
  ownershipDocUri?: string;
  ownerNocName?: string;
  ownerNocUri?: string;
  // Capital & Shareholding
  authorizedCapital: number;
  paidUpCapital: number;
  numberOfShares: number;
  faceValuePerShare: number;
  // Linked Bank Account
  accountNumber?: string;
}



