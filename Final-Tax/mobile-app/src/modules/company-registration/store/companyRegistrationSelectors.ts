import type { CompanyRegistrationDraft } from "../types/registration.types";

export const selectCompany = (state: { draft: CompanyRegistrationDraft }) => state.draft.company;
export const selectDirectors = (state: { draft: CompanyRegistrationDraft }) => state.draft.directors;
export const selectPartners = (state: { draft: CompanyRegistrationDraft }) => state.draft.partners;
export const selectCurrentStep = (state: { draft: CompanyRegistrationDraft }) => state.draft.currentStep;
export const selectTotalFee = (state: { draft: CompanyRegistrationDraft }) => state.draft.totalFee;
