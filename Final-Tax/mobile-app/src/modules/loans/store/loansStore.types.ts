import type { LoanCategory } from "../types/loanCategory.types";
import type {
  LoanKycData,
  LoanKycAddress,
  LoanKycErrors,
  LoanKycVerificationStatus,
} from "../types/loanKyc.types";
import type {
  BusinessLoanFormData,
  BusinessLoanType,
  CommonBusinessProfile,
  BusinessLoanDetails,
  WorkingCapitalDetails,
  BusinessLoanErrors,
} from "../businessWorkingCapital/types/businessLoan.types";
import type {
  LoanDocumentUpload,
  LoanReviewErrors,
} from "../types/loanReview.types";
import type {
  PersonalLoanFormData,
  PersonalLoanErrors,
  PersonalEmploymentType,
} from "../personalLoan/types/personalLoan.types";
import type {
  PropertyLoanErrors,
  PropertyLoanFormData,
} from "../property/types/property.types";
import type {
  HomeLoanRequirementFormData,
  HomeLoanRequirementErrors,
} from "../homeLoan/types/homeLoan.types";
import {
  type VehicleLoanErrors,
  type VehicleLoanFormData,
  type VehicleMoneyField,
} from "../vehicle/types/vehicleLoan.types";
import {
  type MachineryLoanErrors,
  type MachineryLoanFormData,
  type MachineryMoneyField,
} from "../machinery/types/machinery.types";
import {
  type MsmeLoanAddress,
  type MsmeLoanErrors,
  type MsmeLoanFormData,
  type MsmeMoneyField,
} from "../msme/types/msmeLoan.types";

export type LoanStep =
  | "categories"
  | "unavailable"
  | "kyc"
  | "business-details"
  | "personal-employment"
  | "home-loan-requirement"
  | "home-employment-income"
  | "property-details"
  | "vehicle-details"
  | "machinery-details"
  | "msme-details"
  | "documents"
  | "review"
  | "submitted";

export const createEmptyAddress = (): LoanKycAddress => ({
  houseNumber: "",
  street: "",
  city: "",
  state: "",
  pincode: "",
});

export const createInitialKycData = (): LoanKycData => ({
  fullName: "",
  mobile: "",
  email: "",
  pan: "",
  aadhaar: "",
  dob: "",
  currentAddress: createEmptyAddress(),
  isPermanentSameAsCurrent: true,
  permanentAddress: createEmptyAddress(),
  consentGiven: false,
  isProfilePrefilled: false,
  isProfileLocked: false,
});

export const createInitialBusinessFormData = (): BusinessLoanFormData => ({
  loanType: "business-loan",
  businessProfile: {
    businessName: "",
    constitution: "",
    constitutionOther: "",
    businessActivity: "",
    activityOther: "",
    establishmentDate: "",
    businessAddress: "",
    pincode: "",
    isGstRegistered: false,
    gstin: "",
    udyamRegistration: "",
  },
  businessLoan: {
    loanAmount: "",
    purpose: "",
    purposeOther: "",
    purposeDescription: "",
    projectCost: "",
  },
  workingCapital: {
    loanAmount: "",
    purpose: "",
    purposeOther: "",
    purposeDescription: "",
    monthlySales: "",
    monthlyExpenses: "",
  },
});

export const createInitialPersonalFormData = (): PersonalLoanFormData => ({
  employmentType: "salaried",
  employerName: "",
  companyName: "",
  jobType: "",
  monthlyNetSalary: "",
  monthlySalary: "",
  workExperience: "",
  salaryCreditMethod: "Bank Account",
  businessOrProfessionName: "",
  professionName: "",
  natureOfBusiness: "",
  averageMonthlyIncome: "",
  monthlyIncome: "",
  yearsInBusiness: "",
  loanAmount: "",
  requestedAmount: "",
  purpose: "",
  purposeOther: "",
});

export const createInitialHomeLoanFormData = (): HomeLoanRequirementFormData => ({
  loanAmount: "",
  requestedAmount: "",
  purpose: "",
  propertyStatus: "",
  approximatePropertyValue: "",
  propertyValue: "",
});

export interface LoansStoreState {
  selectedCategory: LoanCategory | null;
  activeStep: LoanStep;
  /** True while the customer is editing a section opened from Review. */
  returnToReview: boolean;
  /** Steps the customer has already continued past; revisiting one shows "Update & Continue". */
  completedSteps: LoanStep[];
  kycData: LoanKycData;
  kycStatus: LoanKycVerificationStatus;
  kycErrors: LoanKycErrors;
  businessFormData: BusinessLoanFormData;
  businessErrors: BusinessLoanErrors;
  personalFormData: PersonalLoanFormData;
  personalErrors: PersonalLoanErrors;
  homeLoanFormData: HomeLoanRequirementFormData;
  homeLoanErrors: HomeLoanRequirementErrors;
  propertyFormData: PropertyLoanFormData;
  propertyErrors: PropertyLoanErrors;
  vehicleFormData: VehicleLoanFormData;
  vehicleErrors: VehicleLoanErrors;
  invalidVehicleMoneyFields: Partial<Record<VehicleMoneyField, boolean>>;
  machineryFormData: MachineryLoanFormData;
  machineryErrors: MachineryLoanErrors;
  invalidMachineryMoneyFields: Partial<Record<MachineryMoneyField, boolean>>;
  msmeFormData: MsmeLoanFormData;
  msmeErrors: MsmeLoanErrors;
  invalidMsmeMoneyFields: Partial<Record<MsmeMoneyField, boolean>>;
  uploadedDocuments: Record<string, LoanDocumentUpload>;
  isReviewConsentGiven: boolean;
  reviewErrors: LoanReviewErrors;
  submittedApplicationId: string | null;
  submittedAt: string | null;
  /** False while the submission exists only on this device. */
  isSubmissionSynced: boolean;
  isSubmitting: boolean;
  isProfileLocked: boolean;
  pendingCategory: LoanCategory | null;

  // Step 1 Actions
  selectCategory: (category: LoanCategory) => void;
  selectLoanProduct: (productId: string) => boolean;
  setActiveStep: (step: LoanStep) => void;
  /** Opens a section for editing and remembers to come back to Review afterwards. */
  editFromReview: (step: LoanStep) => void;
  /** Moves forward; while editing from Review this returns to Review instead. */
  advanceTo: (nextStep: LoanStep) => void;
  /** Moves back; while editing from Review this returns to Review instead. */
  retreatTo: (previousStep: LoanStep) => void;
  setKycField: <K extends keyof LoanKycData>(field: K, value: LoanKycData[K]) => void;
  setCurrentAddressField: (field: keyof LoanKycAddress, value: string) => void;
  setPermanentAddressField: (field: keyof LoanKycAddress, value: string) => void;
  setPermanentSameAsCurrent: (isSame: boolean) => void;
  setConsent: (consent: boolean) => void;
  populateFromUserProfile: () => void;
  validateForm: () => boolean;
  clearKycErrors: () => void;
  resetKycData: () => void;

  // Step 2 Business Actions
  setLoanType: (type: BusinessLoanType) => void;
  setBusinessProfileField: <K extends keyof CommonBusinessProfile>(
    field: K,
    value: CommonBusinessProfile[K]
  ) => void;
  setBusinessLoanField: <K extends keyof BusinessLoanDetails>(
    field: K,
    value: BusinessLoanDetails[K]
  ) => void;
  setWorkingCapitalField: <K extends keyof WorkingCapitalDetails>(
    field: K,
    value: WorkingCapitalDetails[K]
  ) => void;
  validateBusinessForm: () => boolean;
  clearBusinessErrors: () => void;
  resetBusinessFormData: () => void;

  // Step 2 Personal Loan Actions
  setPersonalEmploymentType: (type: PersonalEmploymentType) => void;
  setPersonalLoanField: <K extends keyof PersonalLoanFormData>(
    field: K,
    value: PersonalLoanFormData[K]
  ) => void;
  validatePersonalForm: () => boolean;
  clearPersonalErrors: () => void;
  resetPersonalFormData: () => void;

  // Step 2 Property / Home Loan Actions
  setPropertyField: <K extends keyof PropertyLoanFormData>(
    field: K,
    value: PropertyLoanFormData[K]
  ) => void;
  validatePropertyForm: () => boolean;
  clearPropertyErrors: () => void;
  resetPropertyFormData: () => void;

  // Step 2 Vehicle Loan Actions
  setVehicleLoanField: <K extends keyof VehicleLoanFormData>(
    field: K,
    value: VehicleLoanFormData[K]
  ) => void;
  setVehicleMoneyInputValidity: (field: VehicleMoneyField, isValid: boolean) => void;
  validateVehicleLoanForm: () => boolean;
  clearVehicleLoanErrors: () => void;
  resetVehicleLoanFormData: () => void;

  // Step 2 Machinery Loan Actions
  setMachineryLoanField: <K extends keyof MachineryLoanFormData>(
    field: K,
    value: MachineryLoanFormData[K]
  ) => void;
  setMachineryMoneyInputValidity: (field: MachineryMoneyField, isValid: boolean) => void;
  validateMachineryLoanForm: () => boolean;
  clearMachineryLoanErrors: () => void;
  resetMachineryLoanFormData: () => void;

  // Step 2 MSME Loan Actions
  setMsmeLoanField: <K extends keyof MsmeLoanFormData>(
    field: K,
    value: MsmeLoanFormData[K]
  ) => void;
  setMsmeAddressField: (field: keyof MsmeLoanAddress, value: string) => void;
  setMsmeMoneyInputValidity: (field: MsmeMoneyField, isValid: boolean) => void;
  validateMsmeLoanForm: () => boolean;
  clearMsmeLoanErrors: () => void;
  resetMsmeLoanFormData: () => void;

  // Step 2 Home Loan Actions
  setHomeLoanField: <K extends keyof HomeLoanRequirementFormData>(
    field: K,
    value: HomeLoanRequirementFormData[K]
  ) => void;
  validateHomeLoanForm: () => boolean;
  clearHomeLoanErrors: () => void;
  resetHomeLoanFormData: () => void;

  // Step 3 Review & Submission Actions
  setDocumentAttachment: (
    documentId: string,
    attachment: LoanDocumentUpload | null
  ) => void;
  setReviewConsent: (consent: boolean) => void;
  validateReview: () => boolean;
  clearReviewErrors: () => void;
  submitLoanApplication: () => Promise<boolean>;
  resetReviewState: () => void;

  resetAll: () => void;
}
