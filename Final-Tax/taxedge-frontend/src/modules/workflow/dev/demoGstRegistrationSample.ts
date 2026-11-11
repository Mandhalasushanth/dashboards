import { gstRegistrationDetails } from '../api/backendApplications';

/**
 * DEVELOPMENT ONLY. A GST registration record shaped like the backend DTO the mobile app saves, passed
 * through the same adapter the live API will use, so demo cases show every field the customer fills in.
 */
export interface GstSampleBusiness {
  readonly legalName: string;
  readonly pan: string;
  readonly city: string;
  readonly district: string;
  readonly state: string;
  readonly pinCode: string;
  readonly constitution: string;
  readonly signatory: string;
  readonly designation: string;
  readonly commencedOn: string;
}

export function gstRegistrationSample(business: GstSampleBusiness): Record<string, string> {
  const firstName = business.signatory.split(' ')[0].toLowerCase();
  return gstRegistrationDetails({
    legalName: business.legalName,
    tradeName: business.legalName,
    constitutionOfBusiness: business.constitution,
    natureOfBusiness: 'TRADER',
    dateOfCommencement: business.commencedOn,
    reasonForRegistration: 'CROSSED_TURN_OVER_THRESHOLD',
    compositionScheme: 'NO_REGULAR_SCHEME',
    placeOfBusiness: 'PRINCIPAL_PLACE_OF_BUSINESS',
    businessAddress: `Shop 12, Main Market Road, ${business.city}`,
    city: business.city,
    district: business.district,
    state: business.state,
    pinCode: business.pinCode,
    hsnSac: '1006',
    principalPlaceAddressType: 'Rental Agreement',
    accountHolderName: business.legalName,
    bankAccountNumber: '50100234567812',
    ifscCode: 'HDFC0001234',
    bankName: 'HDFC Bank',
    branchName: `${business.city} Main`,
    accountType: 'CURRENT',
    signatoryName: business.signatory,
    signatoryPan: business.pan,
    signatoryDob: '1984-03-12',
    designation: business.designation,
    signatoryMobile: '9876543210',
    signatoryEmail: `${firstName}@example.com`,
    aadhaarConsent: true
  });
}
