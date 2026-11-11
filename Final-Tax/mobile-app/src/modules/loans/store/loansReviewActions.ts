import type { StoreApi } from "zustand";
import { resolveLoanDocumentRequirements } from "../constants/loanDocumentResolver";
import { getLoanSubmissionService } from "../services/loanSubmissionService";
import { validateReviewSubmission } from "../validation/loanReviewValidation";
import { pruneBusinessFormData } from "../businessWorkingCapital/utils/pruneBusinessFormData";
import { prunePropertyFormData } from "../property/utils/propertyFlow";
import { prunePersonalFormData } from "../personalLoan/utils/prunePersonalFormData";
import { createInitialBusinessFormData, type LoansStoreState } from "./loansStore.types";

type ReviewActionKeys =
  | "setDocumentAttachment"
  | "setReviewConsent"
  | "validateReview"
  | "clearReviewErrors"
  | "submitLoanApplication"
  | "resetReviewState";

const SUBMIT_FAILED_MESSAGE =
  "We couldn't submit your application right now. Your details are saved — please try again.";

const omitKey = <T,>(record: Record<string, T>, key: string): Record<string, T> =>
  Object.fromEntries(Object.entries(record).filter(([k]) => k !== key));

/** Documents, consent and submission actions of the loans store. */
export function createReviewActions(
  set: StoreApi<LoansStoreState>["setState"],
  get: StoreApi<LoansStoreState>["getState"]
): Pick<LoansStoreState, ReviewActionKeys> {
  return {
    setDocumentAttachment: (documentId, attachment) =>
      set((state) => {
        const others = omitKey(state.uploadedDocuments, documentId);
        return {
          uploadedDocuments: attachment
            ? { ...others, [documentId]: attachment }
            : others,
          reviewErrors: {
            ...state.reviewErrors,
            documents: omitKey(state.reviewErrors.documents ?? {}, documentId),
          },
        };
      }),

    setReviewConsent: (consent) =>
      set((state) => {
        const { consent: consentError, ...otherErrors } = state.reviewErrors;
        return {
          isReviewConsentGiven: consent,
          reviewErrors: consent
            ? otherErrors
            : { ...otherErrors, ...(consentError ? { consent: consentError } : {}) },
        };
      }),

    validateReview: () => {
      const { isValid, errors } = validateReviewSubmission(
        get().kycData,
        get().businessFormData,
        get().uploadedDocuments,
        get().isReviewConsentGiven,
        get().personalFormData,
        get().selectedCategory?.id,
        get().homeLoanFormData,
        get().propertyFormData,
        get().vehicleFormData,
        get().invalidVehicleMoneyFields,
        get().machineryFormData,
        get().invalidMachineryMoneyFields,
        get().msmeFormData,
        get().invalidMsmeMoneyFields
      );
      set({ reviewErrors: errors });
      return isValid;
    },

    clearReviewErrors: () => set({ reviewErrors: {} }),

    submitLoanApplication: async () => {
      if (get().isSubmitting) return false;
      if (!get().validateReview()) return false;

      set({ isSubmitting: true });
      try {
        const { kycData, businessFormData, uploadedDocuments } = get();
        // Only documents that apply to the selected loan type are sent
        const categoryId = get().selectedCategory?.id;
        const isPersonal = categoryId === "personal-loan";
        const isProperty = categoryId === "property-loan";
        const isHome = categoryId === "home-loan";
        const isVehicle = categoryId === "vehicle-loan";
        const isMachinery = categoryId === "machinery-loan";
        const isMsme = categoryId === "msme-loan";
        const requirements = resolveLoanDocumentRequirements({
          categoryId,
          businessFormData,
          personalFormData: get().personalFormData,
          homeLoanFormData: get().homeLoanFormData,
          propertyFormData: get().propertyFormData,
          vehicleFormData: get().vehicleFormData,
          machineryFormData: get().machineryFormData,
          msmeFormData: get().msmeFormData,
        });
        const applicableDocuments = requirements.flatMap((requirement) => {
          const upload = uploadedDocuments[requirement.id];
          return upload?.fileUri ? [upload] : [];
        });

        const result = await getLoanSubmissionService().submit({
          // A hidden, provider-supplied Aadhaar is never sent from a personal application.
          kycData: isPersonal ? { ...kycData, aadhaar: "" } : kycData,
          businessFormData:
            categoryId === "business-loan" || !categoryId
              ? pruneBusinessFormData(businessFormData)
              : createInitialBusinessFormData(),
          personalFormData: isPersonal
            ? prunePersonalFormData(get().personalFormData)
            : undefined,
          propertyFormData: isProperty
            ? prunePropertyFormData(get().propertyFormData)
            : undefined,
          homeLoanFormData: isHome ? get().homeLoanFormData : undefined,
          vehicleFormData: isVehicle ? get().vehicleFormData : undefined,
          machineryFormData: isMachinery ? get().machineryFormData : undefined,
          msmeFormData: isMsme ? get().msmeFormData : undefined,
          categoryId,
          documents: applicableDocuments,
        });
        set({
          submittedApplicationId: result.applicationId,
          submittedAt: result.submittedAt,
          isSubmissionSynced: result.isSyncedToServer,
          isSubmitting: false,
          activeStep: "submitted",
        });
        return true;
      } catch {
        set((state) => ({
          isSubmitting: false,
          reviewErrors: { ...state.reviewErrors, general: SUBMIT_FAILED_MESSAGE },
        }));
        return false;
      }
    },

    resetReviewState: () =>
      set({
        uploadedDocuments: {},
        isReviewConsentGiven: false,
        reviewErrors: {},
        submittedApplicationId: null,
        submittedAt: null,
        isSubmissionSynced: false,
        isSubmitting: false,
      }),
  };
}
