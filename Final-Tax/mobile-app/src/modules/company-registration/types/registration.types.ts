import type { CompanyDetails } from './company.types';
import type { DirectorInfo, OpcNomineeInfo, PartnerInfo } from './director.types';
import type { DocumentStatus } from '../../../types/domain';

export interface CompanyDoc {
  id: string;
  name: string;
  category: string;
  required: boolean;
  status: DocumentStatus;
  fileUri?: string;
  fileName?: string;
}

export interface LinkedRegistrations {
  pan: boolean;
  tan: boolean;
  gst: boolean;
  esic: boolean;
  epfo: boolean;
  professionalTax: boolean;
  bankAccount: boolean;
}

export interface FeeBreakdown {
  professionalFee: number;
  gstAmount: number;
  statutoryCharges: number;
  totalAmount: number;
}

export interface TrackingStage {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
  updatedAt?: string;
}

export interface ApplicationReceipt {
  applicationId: string;
  companyName: string;
  companyType: string;
  appliedDate: string;
  totalAmount: number;
  paymentStatus: 'Paid' | 'Pending';
  paymentMethod: string;
  transactionId: string;
}

export interface CompanyRegistrationDraft {
  id: string;
  company: CompanyDetails;
  directors: DirectorInfo[];
  opcNominee?: OpcNomineeInfo;
  partners: PartnerInfo[];
  documents: CompanyDoc[];
  linkedRegistrations: LinkedRegistrations;
  feeBreakdown: FeeBreakdown;
  trackingStages: TrackingStage[];
  receipt?: ApplicationReceipt;
  currentStep: number;
  totalFee?: number;
  paymentStatus: 'Pending' | 'Paid';
  status: 'Draft' | 'KYC Pending' | 'Under Review' | 'Name Reservation' | 'DSC / DIN Process' | 'Ready for Filing' | 'Submitted' | 'Government Query' | 'Approved' | 'Documents Issued' | 'Completed';
  createdAt: string;
}
