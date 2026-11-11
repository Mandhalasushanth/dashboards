import { create } from "zustand";
import { normalizeMoneyInput } from "../utils/moneyInput";
import { authStorage } from "@/modules/authentication/services/authStorage";
import type {
  LoanKycErrors,
} from "../types/loanKyc.types";
import { validateLoanKyc } from "../validation/loanKycValidation";
import { loanKycService } from "../services/loanKycService";
import { validateBusinessLoanForm } from "../businessWorkingCapital/validation/businessLoanValidation";
import { createPersonalActions } from "../personalLoan/store/personalLoanActions";
import { createPropertyActions } from "../property/store/propertyLoanActions";
import { createInitialPropertyFormData } from "../property/types/property.types";
import { createVehicleLoanActions } from "../vehicle/store/vehicleLoanActions";
import { createInitialVehicleLoanFormData } from "../vehicle/types/vehicleLoan.types";
import { createMachineryLoanActions } from "../machinery/store/machineryLoanActions";
import { createInitialMachineryLoanFormData } from "../machinery/types/machinery.types";
import { createMsmeLoanActions } from "../msme/store/msmeLoanActions";
import { createInitialMsmeLoanFormData } from "../msme/types/msmeLoan.types";
import { validateHomeLoanRequirementForm } from "../homeLoan/validation/homeLoanValidation";
import { createReviewActions } from "./loansReviewActions";
import { getLoanEntryStep } from "../constants/loanFlow";
import { useAuthStore } from "@/modules/authentication/store/authStore";
import { isProfileComplete } from "@/shared/guards/serviceAccess";
import { resolveLoanCategory } from "../constants/loanCategories";
import {
  createInitialKycData,
  createInitialBusinessFormData,
  createInitialPersonalFormData,
  createInitialHomeLoanFormData,
  type LoansStoreState,
  type LoanStep,
} from "./loansStore.types";

export type { LoanStep, LoansStoreState };

export const useLoansStore = create<LoansStoreState>((set, get) => ({
  selectedCategory: null,
  activeStep: "categories",
  returnToReview: false,
  completedSteps: [],
  kycData: createInitialKycData(),
  kycStatus: "not_connected",
  kycErrors: {},
  businessFormData: createInitialBusinessFormData(),
  businessErrors: {},
  personalFormData: createInitialPersonalFormData(),
  personalErrors: {},
  homeLoanFormData: createInitialHomeLoanFormData(),
  homeLoanErrors: {},
  propertyFormData: createInitialPropertyFormData(),
  propertyErrors: {},
  vehicleFormData: createInitialVehicleLoanFormData(),
  vehicleErrors: {},
  invalidVehicleMoneyFields: {},
  machineryFormData: createInitialMachineryLoanFormData(),
  machineryErrors: {},
  invalidMachineryMoneyFields: {},
  msmeFormData: createInitialMsmeLoanFormData(),
  msmeErrors: {},
  invalidMsmeMoneyFields: {},
  uploadedDocuments: {},
  isReviewConsentGiven: false,
  reviewErrors: {},
  submittedApplicationId: null,
  submittedAt: null,
  isSubmissionSynced: false,
  isSubmitting: false,
  isProfileLocked: false,
  pendingCategory: null,

  selectCategory: (category) =>
    set((state) => {
      const isDifferentLoan = state.selectedCategory?.id !== category.id;
      const authState = useAuthStore.getState();
      const storageUser = authStorage.getUser();
      const profileComplete = isProfileComplete({
        profileCompleted: authState.profileCompleted,
        isExistingUser: authState.isExistingUser,
        customerExists: authState.customerExists,
        customer: authState.customer || (storageUser as any),
        authenticatedUser: authState.authenticatedUser || (storageUser as any),
      });
      const isLocked = state.isProfileLocked || state.kycData.isProfileLocked || profileComplete;
      const preservedProfile = isLocked
        ? {
            fullName: state.kycData.fullName,
            mobile: state.kycData.mobile,
            email: state.kycData.email,
            pan: state.kycData.pan,
            aadhaar: state.kycData.aadhaar,
            dob: state.kycData.dob,
            currentAddress: { ...state.kycData.currentAddress },
            permanentAddress: { ...state.kycData.permanentAddress },
            isPermanentSameAsCurrent: state.kycData.isPermanentSameAsCurrent,
            isProfilePrefilled: state.kycData.isProfilePrefilled,
            isProfileLocked: true,
          }
        : null;

      return {
        selectedCategory: category,
        pendingCategory: null,
        activeStep: getLoanEntryStep(category.id),
        returnToReview: false,
        isProfileLocked: isLocked,
        ...(isDifferentLoan
          ? {
              completedSteps: [],
              kycData: preservedProfile
                ? {
                    ...createInitialKycData(),
                    ...preservedProfile,
                  }
                : createInitialKycData(),
              kycStatus: "not_connected" as const,
              kycErrors: {},
              businessFormData: createInitialBusinessFormData(),
              businessErrors: {},
              personalFormData: createInitialPersonalFormData(),
              personalErrors: {},
              homeLoanFormData: createInitialHomeLoanFormData(),
              homeLoanErrors: {},
              propertyFormData: createInitialPropertyFormData(),
              propertyErrors: {},
              vehicleFormData: createInitialVehicleLoanFormData(),
              vehicleErrors: {},
              invalidVehicleMoneyFields: {},
              machineryFormData: createInitialMachineryLoanFormData(),
              machineryErrors: {},
              invalidMachineryMoneyFields: {},
              msmeFormData: createInitialMsmeLoanFormData(),
              msmeErrors: {},
              invalidMsmeMoneyFields: {},
              uploadedDocuments: {},
              isReviewConsentGiven: false,
              reviewErrors: {},
              submittedApplicationId: null,
              submittedAt: null,
              isSubmissionSynced: false,
              isSubmitting: false,
            }
          : null),
      };
    }),

  selectLoanProduct: (productId: string) => {
    const resolved = resolveLoanCategory(productId);
    if (!resolved) return false;

    const authState = useAuthStore.getState();
    const storageUser = authStorage.getUser();
    const profileComplete = isProfileComplete({
      profileCompleted: authState.profileCompleted,
      isExistingUser: authState.isExistingUser,
      customerExists: authState.customerExists,
      customer: authState.customer || (storageUser as any),
      authenticatedUser: authState.authenticatedUser || (storageUser as any),
    });

    if (!profileComplete) {
      set({
        pendingCategory: resolved.category,
        selectedCategory: resolved.category,
      });
      if (resolved.loanType) {
        get().setLoanType(resolved.loanType);
      }
      authState.openCompleteProfileModal(`/service/loans?category=${productId}`);
      return false;
    }

    get().populateFromUserProfile();
    get().selectCategory(resolved.category);
    if (resolved.loanType) {
      get().setLoanType(resolved.loanType);
    }
    return true;
  },

  setActiveStep: (step) => set({ activeStep: step }),

  editFromReview: (step) => set({ activeStep: step, returnToReview: true }),

  advanceTo: (nextStep) =>
    set((state) => {
      const completedSteps = Array.from(
        new Set([...state.completedSteps, state.activeStep])
      );
      return state.returnToReview || nextStep === "review"
        ? { activeStep: "review", returnToReview: false, reviewErrors: {}, completedSteps }
        : { activeStep: nextStep, completedSteps };
    }),

  retreatTo: (previousStep) =>
    set((state) =>
      state.returnToReview
        ? { activeStep: "review", returnToReview: false }
        : { activeStep: previousStep }
    ),

  setKycField: (field, value) =>
    set((state) => {
      const isLocked = state.isProfileLocked || state.kycData.isProfileLocked;
      const profileFields = ["fullName", "mobile", "email", "pan", "aadhaar", "dob"];
      if (isLocked && profileFields.includes(field as string)) {
        return state;
      }
      const nextErrors = { ...state.kycErrors };
      delete nextErrors[field as keyof LoanKycErrors];
      return {
        kycData: { ...state.kycData, [field]: value },
        kycErrors: nextErrors,
      };
    }),

  setCurrentAddressField: (field, value) =>
    set((state) => {
      const isLocked = state.isProfileLocked || state.kycData.isProfileLocked;
      if (isLocked) {
        return state;
      }
      const updatedCurrent = {
        ...state.kycData.currentAddress,
        [field]: value,
      };
      const nextErrors = { ...state.kycErrors };
      delete nextErrors[`currentAddress.${field}` as keyof LoanKycErrors];
      return {
        kycData: {
          ...state.kycData,
          currentAddress: updatedCurrent,
          permanentAddress: state.kycData.isPermanentSameAsCurrent
            ? { ...updatedCurrent }
            : state.kycData.permanentAddress,
        },
        kycErrors: nextErrors,
      };
    }),

  setPermanentAddressField: (field, value) =>
    set((state) => {
      const isLocked = state.isProfileLocked || state.kycData.isProfileLocked;
      if (isLocked) {
        return state;
      }
      const nextErrors = { ...state.kycErrors };
      delete nextErrors[`permanentAddress.${field}` as keyof LoanKycErrors];
      return {
        kycData: {
          ...state.kycData,
          permanentAddress: { ...state.kycData.permanentAddress, [field]: value },
        },
        kycErrors: nextErrors,
      };
    }),

  setPermanentSameAsCurrent: (isSame) =>
    set((state) => {
      const isLocked = state.isProfileLocked || state.kycData.isProfileLocked;
      if (isLocked) {
        return state;
      }
      return {
        kycData: {
          ...state.kycData,
          isPermanentSameAsCurrent: isSame,
          permanentAddress: isSame
            ? { ...state.kycData.currentAddress }
            : state.kycData.permanentAddress,
        },
      };
    }),

  setConsent: (consent) =>
    set((state) => {
      const nextErrors = { ...state.kycErrors };
      if (consent) delete nextErrors.consentGiven;
      return {
        kycData: { ...state.kycData, consentGiven: consent },
        kycErrors: nextErrors,
      };
    }),

  populateFromUserProfile: () => {
    try {
      const authState = useAuthStore.getState();
      const storageUser = authStorage.getUser();
      const profile = (authState.customer || authState.authenticatedUser || storageUser) as Record<string, string> | null;
      if (!profile) return;

      const isComplete = isProfileComplete({
        profileCompleted: authState.profileCompleted,
        isExistingUser: authState.isExistingUser,
        customerExists: authState.customerExists,
        customer: authState.customer || (storageUser as any),
        authenticatedUser: authState.authenticatedUser || (storageUser as any),
      });

      const pan = (profile.pan || profile.panNumber || "").toUpperCase();
      const aadhaar = profile.aadhaar || profile.aadhaarNumber || "";
      const name = profile.name || profile.fullName || "";
      const rawDob = profile.dob || profile.dateOfBirth || "";
      const mobile = profile.mobileNumber || profile.mobile || "";
      const email = profile.email || "";
      const addressLine1 = profile.addressLine1 || profile.address || "";
      const addressLine2 = profile.addressLine2 || "";
      const city = profile.city || "";
      const state = profile.state || "";
      const pincode = profile.pincode || profile.pinCode || "";

      // Normalize DOB if provided in ISO format YYYY-MM-DD
      let normalizedDob = rawDob;
      if (rawDob) {
        const apiFormat = /^(\d{4})-(\d{2})-(\d{2})$/.exec(rawDob.trim());
        if (apiFormat) {
          normalizedDob = `${apiFormat[3]}-${apiFormat[2]}-${apiFormat[1]}`;
        }
      }

      // Handle address splitting if addressLine2 is empty and addressLine1 contains commas
      let houseNumber = addressLine1;
      let street = addressLine2;
      if (!street && addressLine1) {
        const parts = addressLine1.split(/,|\n/).map((p: string) => p.trim()).filter(Boolean);
        if (parts.length > 1) {
          houseNumber = parts[0];
          street = parts.slice(1).join(", ");
        } else {
          street = addressLine1;
        }
      }

      const hasProfileData = Boolean(name || mobile || pan || aadhaar);

      set((prev) => ({
        isProfileLocked: isComplete ? true : prev.isProfileLocked,
        kycStatus: "not_connected",
        kycData: {
          ...prev.kycData,
          fullName: name || prev.kycData.fullName,
          mobile: mobile || prev.kycData.mobile,
          email: email || prev.kycData.email,
          pan: pan || prev.kycData.pan,
          aadhaar: aadhaar || prev.kycData.aadhaar,
          dob: normalizedDob || prev.kycData.dob,
          currentAddress: {
            houseNumber: houseNumber || prev.kycData.currentAddress.houseNumber,
            street: street || prev.kycData.currentAddress.street,
            city: city || prev.kycData.currentAddress.city,
            state: state || prev.kycData.currentAddress.state,
            pincode: pincode || prev.kycData.currentAddress.pincode,
          },
          permanentAddress: prev.kycData.isPermanentSameAsCurrent
            ? {
                houseNumber: houseNumber || prev.kycData.currentAddress.houseNumber,
                street: street || prev.kycData.currentAddress.street,
                city: city || prev.kycData.currentAddress.city,
                state: state || prev.kycData.currentAddress.state,
                pincode: pincode || prev.kycData.currentAddress.pincode,
              }
            : prev.kycData.permanentAddress,
          isProfilePrefilled: hasProfileData || prev.kycData.isProfilePrefilled,
          isProfileLocked: isComplete ? true : prev.kycData.isProfileLocked,
        },
      }));
    } catch {
      // Graceful fallback
    }
  },

  validateForm: () => {
    const requirements = loanKycService.getProviderRequirements(
      get().selectedCategory?.id
    );
    const { isValid, errors } = validateLoanKyc(get().kycData, requirements);
    set({ kycErrors: errors });
    return isValid;
  },

  clearKycErrors: () => set({ kycErrors: {} }),
  resetKycData: () => set({ kycData: createInitialKycData(), kycErrors: {} }),

  // Step 2 Actions
  setLoanType: (type) =>
    set((state) => {
      const uploadedDocuments = { ...state.uploadedDocuments };
      if (state.businessFormData.loanType !== type) {
        delete uploadedDocuments.bank_statement;
      }
      return {
        businessFormData: { ...state.businessFormData, loanType: type },
        uploadedDocuments,
        businessErrors: {},
      };
    }),

  setBusinessProfileField: (field, value) =>
    set((state) => {
      const nextErrors = { ...state.businessErrors };
      delete nextErrors[field as string];
      const uploadedDocuments = { ...state.uploadedDocuments };
      if (
        field === "isGstRegistered" &&
        state.businessFormData.businessProfile.isGstRegistered !== value
      ) {
        delete uploadedDocuments.gst_certificate;
      }
      return {
        businessFormData: {
          ...state.businessFormData,
          businessProfile: {
            ...state.businessFormData.businessProfile,
            [field]: value,
          },
        },
        uploadedDocuments,
        businessErrors: nextErrors,
      };
    }),

  setBusinessLoanField: (field, value) =>
    set((state) => {
      const nextErrors = { ...state.businessErrors };
      const map: Record<string, string> = {
        loanAmount: "businessLoanAmount",
        purpose: "businessLoanPurpose",
        purposeOther: "businessLoanPurposeOther",
        purposeDescription: "businessLoanDescription",
        projectCost: "businessLoanProjectCost",
      };
      if (map[field]) delete nextErrors[map[field]];
      return {
        businessFormData: {
          ...state.businessFormData,
          businessLoan: {
            ...state.businessFormData.businessLoan,
            [field]: value,
          },
        },
        businessErrors: nextErrors,
      };
    }),

  setWorkingCapitalField: (field, value) =>
    set((state) => {
      const nextErrors = { ...state.businessErrors };
      const map: Record<string, string> = {
        loanAmount: "workingCapitalAmount",
        purpose: "workingCapitalPurpose",
        purposeOther: "workingCapitalPurposeOther",
        purposeDescription: "workingCapitalDescription",
        monthlySales: "monthlySales",
        monthlyExpenses: "monthlyExpenses",
      };
      if (map[field]) delete nextErrors[map[field]];
      return {
        businessFormData: {
          ...state.businessFormData,
          workingCapital: {
            ...state.businessFormData.workingCapital,
            [field]: value,
          },
        },
        businessErrors: nextErrors,
      };
    }),

  validateBusinessForm: () => {
    const { isValid, errors } = validateBusinessLoanForm(get().businessFormData);
    set({ businessErrors: errors });
    return isValid;
  },

  clearBusinessErrors: () => set({ businessErrors: {} }),
  resetBusinessFormData: () =>
    set({
      businessFormData: createInitialBusinessFormData(),
      businessErrors: {},
    }),

  // Step 2 Personal Loan Actions
  ...createPersonalActions(set, get),

  // Step 2 Property / Home Loan Actions
  ...createPropertyActions(set, get),

  // Step 2 Vehicle Loan Actions
  ...createVehicleLoanActions(set, get),

  // Step 2 Machinery Loan Actions
  ...createMachineryLoanActions(set, get),

  // Step 2 MSME Loan Actions
  ...createMsmeLoanActions(set, get),

  // Step 2 Home Loan Actions
  setHomeLoanField: (field, value) =>
    set((state) => {
      const nextErrors = { ...state.homeLoanErrors };
      delete nextErrors[field];
      const isMoneyField =
        field === "loanAmount" ||
        field === "requestedAmount" ||
        field === "approximatePropertyValue" ||
        field === "propertyValue";
      const cleanValue = (
        isMoneyField && typeof value === "string" ? normalizeMoneyInput(value) : value
      ) as typeof value;
      const updated = {
        ...state.homeLoanFormData,
        [field]: cleanValue,
      };
      if (field === "loanAmount") {
        updated.requestedAmount = cleanValue as string;
        delete nextErrors.requestedAmount;
      }
      if (field === "requestedAmount") {
        updated.loanAmount = cleanValue as string;
        delete nextErrors.loanAmount;
      }
      if (field === "approximatePropertyValue") {
        updated.propertyValue = cleanValue as string;
        delete nextErrors.propertyValue;
      }
      if (field === "propertyValue") {
        updated.approximatePropertyValue = cleanValue as string;
        delete nextErrors.approximatePropertyValue;
      }
      return {
        homeLoanFormData: updated,
        homeLoanErrors: nextErrors,
      };
    }),

  validateHomeLoanForm: () => {
    const { isValid, errors } = validateHomeLoanRequirementForm(
      get().homeLoanFormData
    );
    set({ homeLoanErrors: errors });
    return isValid;
  },

  clearHomeLoanErrors: () => set({ homeLoanErrors: {} }),
  resetHomeLoanFormData: () =>
    set({
      homeLoanFormData: createInitialHomeLoanFormData(),
      homeLoanErrors: {},
    }),

  // Documents, consent and submission
  ...createReviewActions(set, get),

  resetAll: () =>
    set({
      selectedCategory: null,
      activeStep: "categories",
      returnToReview: false,
      completedSteps: [],
      isProfileLocked: false,
      pendingCategory: null,
      kycData: createInitialKycData(),
      kycErrors: {},
      kycStatus: "not_connected",
      businessFormData: createInitialBusinessFormData(),
      businessErrors: {},
      personalFormData: createInitialPersonalFormData(),
      personalErrors: {},
      homeLoanFormData: createInitialHomeLoanFormData(),
      homeLoanErrors: {},
      propertyFormData: createInitialPropertyFormData(),
      propertyErrors: {},
      vehicleFormData: createInitialVehicleLoanFormData(),
      vehicleErrors: {},
      invalidVehicleMoneyFields: {},
      machineryFormData: createInitialMachineryLoanFormData(),
      machineryErrors: {},
      invalidMachineryMoneyFields: {},
      msmeFormData: createInitialMsmeLoanFormData(),
      msmeErrors: {},
      invalidMsmeMoneyFields: {},
      uploadedDocuments: {},
      isReviewConsentGiven: false,
      reviewErrors: {},
      submittedApplicationId: null,
      submittedAt: null,
      isSubmissionSynced: false,
      isSubmitting: false,
    }),
}));
