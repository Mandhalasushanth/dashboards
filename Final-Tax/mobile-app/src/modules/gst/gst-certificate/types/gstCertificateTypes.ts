export interface CertificateSignatory {
  name: string;
  designation: string;
}

export interface CertificateDetails {
  gstin: string;
  legalName: string;
  tradeName: string;
  constitution: string;
  address: string;
  liabilityDate: string;
  validityFrom: string;
  regType: string;
  regDate: string;
  issueDate: string;
  additionalPlaces: string[];
  signatories: CertificateSignatory[];
  activities: string[];
  state: string;
}

export interface CertificateRequestParams {
  gstin?: string;
  legalName?: string;
  tradeName?: string;
  constitution?: string;
  address?: string;
  signatoryName?: string;
  director?: string;
  state?: string;
}

export interface CertificateFormData {
  gstin: string;
  requestType: string;
}
