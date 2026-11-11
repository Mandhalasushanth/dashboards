import { create } from "zustand";
import type { GstRegistrationDraft, GstFilingDraft } from "../types/gst.types";

interface GstStoreState {
  registrationDraft: Partial<GstRegistrationDraft>;
  filingDraft: Partial<GstFilingDraft>;
  activeStep: number;
  setRegistrationDraft: (draft: Partial<GstRegistrationDraft>) => void;
  updateRegistrationField: (field: string, value: unknown) => void;
  setFilingDraft: (draft: Partial<GstFilingDraft>) => void;
  setActiveStep: (step: number) => void;
  resetDrafts: () => void;
}

export const useGstStore = create<GstStoreState>((set) => ({
  registrationDraft: {},
  filingDraft: {},
  activeStep: 0,
  setRegistrationDraft: (draft) =>
    set((state) => ({ registrationDraft: { ...state.registrationDraft, ...draft } })),
  updateRegistrationField: (field, value) =>
    set((state) => ({
      registrationDraft: { ...state.registrationDraft, [field]: value },
    })),
  setFilingDraft: (draft) =>
    set((state) => ({ filingDraft: { ...state.filingDraft, ...draft } })),
  setActiveStep: (activeStep) => set({ activeStep }),
  resetDrafts: () => set({ registrationDraft: {}, filingDraft: {}, activeStep: 0 }),
}));

export default useGstStore;
