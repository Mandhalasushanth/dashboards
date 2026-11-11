import { create } from "zustand";
import { RevisedFormFields, RevisedDocumentItem } from "../types/revisedItr.types";

interface RevisedProgressStore {
  maxStepReached: number;
  setMaxStepReached: (step: number) => void;

  // Backend IDs
  revisedItrId?: string;
  revisionReasonId?: string;
  detailsId?: string;
  documentId?: string;
  setBackendIds: (ids: { revisedItrId?: string; revisionReasonId?: string; detailsId?: string; documentId?: string }) => void;

  formData: RevisedFormFields | null;
  setFormData: (data: Partial<RevisedFormFields>) => void;
  documents: RevisedDocumentItem[] | null;
  setDocuments: (docs: RevisedDocumentItem[] | null) => void;
  revisionReason: string | null;
  setRevisionReason: (reason: string) => void;
  isSubmitted: boolean;
  setIsSubmitted: (isSubmitted: boolean) => void;
  reset: () => void;
}

export const useRevisedProgressStore = create<RevisedProgressStore>((set) => ({
  maxStepReached: 1,
  setMaxStepReached: (step) =>
    set((state) => ({ maxStepReached: Math.max(state.maxStepReached, step) })),

  // Backend IDs
  setBackendIds: (ids) => set((state) => ({ ...state, ...ids })),

  formData: null,
  setFormData: (data) =>
    set((state) => ({ formData: { ...state.formData, ...data } as RevisedFormFields })),
  documents: null,
  setDocuments: (docs) => set({ documents: docs }),
  revisionReason: null,
  setRevisionReason: (reason) => set({ revisionReason: reason }),
  isSubmitted: false,
  setIsSubmitted: (isSubmitted) => set({ isSubmitted }),
  reset: () => set({
    maxStepReached: 1,
    formData: null,
    documents: null,
    revisionReason: null,
    revisedItrId: undefined,
    revisionReasonId: undefined,
    detailsId: undefined,
    documentId: undefined,
    isSubmitted: false,
  }),
}));
