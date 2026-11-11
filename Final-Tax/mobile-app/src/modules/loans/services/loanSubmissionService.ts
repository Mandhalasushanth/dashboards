import type { BusinessLoanFormData } from "../businessWorkingCapital/types/businessLoan.types";
import type { PersonalLoanFormData } from "../personalLoan/types/personalLoan.types";
import type { PropertyLoanFormData } from "../property/types/property.types";
import type { HomeLoanRequirementFormData } from "../homeLoan/types/homeLoan.types";
import type { LoanKycData } from "../types/loanKyc.types";
import type { LoanDocumentUpload } from "../types/loanReview.types";
import type { LoanCategoryId } from "../types/loanCategory.types";
import type { VehicleLoanFormData } from "../vehicle/types/vehicleLoan.types";
import type { MachineryLoanFormData } from "../machinery/types/machinery.types";
import type { MsmeLoanFormData } from "../msme/types/msmeLoan.types";

export interface LoanSubmissionPayload {
  kycData: LoanKycData;
  businessFormData: BusinessLoanFormData;
  personalFormData?: PersonalLoanFormData;
  propertyFormData?: PropertyLoanFormData;
  homeLoanFormData?: HomeLoanRequirementFormData;
  vehicleFormData?: VehicleLoanFormData;
  machineryFormData?: MachineryLoanFormData;
  msmeFormData?: MsmeLoanFormData;
  categoryId?: LoanCategoryId;
  documents: LoanDocumentUpload[];
}

export interface LoanSubmissionResult {
  applicationId: string;
  submittedAt: string;
  /** False while the application exists only on this device. */
  isSyncedToServer: boolean;
}

/** The single boundary through which a completed application leaves the frontend. */
export interface LoanSubmissionService {
  submit: (payload: LoanSubmissionPayload) => Promise<LoanSubmissionResult>;
}

/**
 * Placeholder used until the real submission API is connected: nothing is sent anywhere.
 * It records the submission locally and says so through `isSyncedToServer: false`.
 */
export const localLoanSubmissionService: LoanSubmissionService = {
  submit: async () => {
    const now = new Date();
    return {
      applicationId: `TXE-LN-${now.getTime().toString().slice(-6)}`,
      submittedAt: now.toISOString(),
      isSyncedToServer: false,
    };
  },
};

let activeService: LoanSubmissionService = localLoanSubmissionService;

export const getLoanSubmissionService = (): LoanSubmissionService => activeService;

/** Connects a real implementation (or a test double). */
export const setLoanSubmissionService = (service: LoanSubmissionService): void => {
  activeService = service;
};
