import { create } from 'zustand';
import type { CompanyRegistrationDraft, LinkedRegistrations, ApplicationReceipt } from '../types/registration.types';
import type { CompanyType, CompanyDetails } from '../types/company.types';
import type { DirectorInfo, OpcNomineeInfo, PartnerInfo } from '../types/director.types';
import type { DocumentStatus, Application } from '../../../types/domain';
import { useApplicationStore } from '../../../store/applicationStore';
import { getSuffixForType, isOpcCompanyType } from '../validation/companySchema';
import { getInitialDraft } from './initialDraft';

interface CompanyRegistrationState {
  registrationId: string | null;
  setRegistrationId: (id: string | null) => void;
  registeredOfficeId: string | null;
  setRegisteredOfficeId: (id: string | null) => void;
  draft: CompanyRegistrationDraft;
  fieldErrors: Record<string, string>;
  editingStep: number | null;
  setFieldErrors: (errors: Record<string, string>) => void;
  clearFieldError: (key: string) => void;
  clearAllFieldErrors: () => void;
  setCompanyType: (type: CompanyType) => void;
  updateCompanyDetails: (details: Partial<CompanyDetails>) => void;
  addDirector: (director: DirectorInfo) => void;
  updateDirector: (id: string, director: Partial<DirectorInfo>) => void;
  removeDirector: (id: string) => void;
  addPartner: (partner: PartnerInfo) => void;
  removePartner: (id: string) => void;
  setOpcNominee: (nominee: OpcNomineeInfo) => void;
  toggleLinkedRegistration: (key: keyof LinkedRegistrations) => void;
  updateDocumentStatus: (documentId: string, status: DocumentStatus, fileUri?: string, fileName?: string) => void;
  setStep: (step: number) => void;
  startEditingStep: (step: number) => void;
  clearEditingStep: () => void;
  processPayment: (paymentMethod: string) => void;
  submitRegistrationSuccess: (appId: string, statusText?: string) => void;
  setDraft: (draft: CompanyRegistrationDraft) => void;
  resetRegistration: () => void;
}

export const useCompanyRegistrationStore = create<CompanyRegistrationState>((set) => ({
  registrationId: null,
  setRegistrationId: (registrationId) => set({ registrationId }),
  registeredOfficeId: null,
  setRegisteredOfficeId: (registeredOfficeId) => set({ registeredOfficeId }),
  draft: getInitialDraft(),
  fieldErrors: {},
  editingStep: null,
  setFieldErrors: (fieldErrors) => set({ fieldErrors }),
  clearFieldError: (key) =>
    set((state) => {
      const next = { ...state.fieldErrors };
      delete next[key];
      return { fieldErrors: next };
    }),
  clearAllFieldErrors: () => set({ fieldErrors: {} }),
  setCompanyType: (type) =>
    set((state) => {
      const isOpc = isOpcCompanyType(type);
      let directors = state.draft.directors;
      if (isOpc && directors.length > 0) {
        directors = [{ ...directors[0], sharesPercentage: 100 }];
      }
      const suffix = getSuffixForType(type);
      const nextErrors = { ...state.fieldErrors };
      delete nextErrors.companyType;
      delete nextErrors.nameSuffix;
      return {
        fieldErrors: nextErrors,
        draft: {
          ...state.draft,
          company: { ...state.draft.company, companyType: type, nameSuffix: suffix },
          directors,
        },
      };
    }),
  updateCompanyDetails: (details) =>
    set((state) => {
      const nextErrors = { ...state.fieldErrors };
      Object.keys(details).forEach((k) => delete nextErrors[k]);
      return {
        fieldErrors: nextErrors,
        draft: {
          ...state.draft,
          company: { ...state.draft.company, ...details },
        },
      };
    }),
  addDirector: (director) =>
    set((state) => {
      if (isOpcCompanyType(state.draft.company.companyType) && state.draft.directors.length >= 1) {
        return state;
      }
      const nextErrors = { ...state.fieldErrors };
      delete nextErrors.directorsCount;
      return {
        fieldErrors: nextErrors,
        draft: {
          ...state.draft,
          directors: [...state.draft.directors, director],
        },
      };
    }),
  updateDirector: (id, updatedFields) =>
    set((state) => {
      const nextErrors = { ...state.fieldErrors };
      Object.keys(updatedFields).forEach((k) => {
        delete nextErrors[`dir_${id}_${k}`];
        delete nextErrors[k];
      });
      return {
        fieldErrors: nextErrors,
        draft: {
          ...state.draft,
          directors: state.draft.directors.map((d) => (d.id === id ? { ...d, ...updatedFields } : d)),
        },
      };
    }),
  removeDirector: (id) =>
    set((state) => ({
      draft: {
        ...state.draft,
        directors: state.draft.directors.filter((d) => d.id !== id),
      },
    })),
  addPartner: (partner) =>
    set((state) => ({
      draft: {
        ...state.draft,
        partners: [...state.draft.partners, partner],
      },
    })),
  removePartner: (id) =>
    set((state) => ({
      draft: {
        ...state.draft,
        partners: state.draft.partners.filter((p) => p.id !== id),
      },
    })),
  setOpcNominee: (opcNominee) =>
    set((state) => ({
      draft: { ...state.draft, opcNominee },
    })),
  toggleLinkedRegistration: (key) =>
    set((state) => ({
      draft: {
        ...state.draft,
        linkedRegistrations: {
          ...state.draft.linkedRegistrations,
          [key]: !state.draft.linkedRegistrations[key],
        },
      },
    })),
  updateDocumentStatus: (documentId, status, fileUri, fileName) =>
    set((state) => {
      const exists = state.draft.documents.some((doc) => doc.id === documentId);
      const updatedDocs = exists
        ? state.draft.documents.map((doc) => (doc.id === documentId ? { ...doc, status, fileUri, fileName } : doc))
        : [...state.draft.documents, { id: documentId, name: documentId, category: 'Conditional Doc', required: true, status, fileUri, fileName }];
      const nextErrors = { ...state.fieldErrors };
      delete nextErrors[documentId];
      delete nextErrors.documentsChecklist;

      const nextCompany = { ...state.draft.company };
      if (documentId === 'doc-address') {
        nextCompany.ownershipDocName = status === 'Uploaded' ? (fileName || '') : '';
        nextCompany.ownershipDocUri = status === 'Uploaded' ? (fileUri || '') : '';
      } else if (documentId === 'doc-noc') {
        nextCompany.ownerNocName = status === 'Uploaded' ? (fileName || '') : '';
        nextCompany.ownerNocUri = status === 'Uploaded' ? (fileUri || '') : '';
      } else if (documentId === 'doc-utility') {
        nextCompany.officeAddressProofName = status === 'Uploaded' ? (fileName || '') : '';
        nextCompany.officeAddressProofUri = status === 'Uploaded' ? (fileUri || '') : '';
      }

      return {
        fieldErrors: nextErrors,
        draft: {
          ...state.draft,
          company: nextCompany,
          documents: updatedDocs,
        },
      };
    }),
  setStep: (currentStep) =>
    set((state) => ({
      editingStep: state.editingStep === currentStep ? state.editingStep : null,
      draft: { ...state.draft, currentStep },
    })),
  startEditingStep: (step) =>
    set((state) => ({
      editingStep: step,
      draft: { ...state.draft, currentStep: step },
    })),
  clearEditingStep: () => set({ editingStep: null }),
  processPayment: (paymentMethod) =>
    set((state) => {
      const receipt: ApplicationReceipt = {
        applicationId: state.draft.id,
        companyName: state.draft.company.proposedName1,
        companyType: state.draft.company.companyType,
        appliedDate: new Date().toISOString().split("T")[0],
        totalAmount: state.draft.feeBreakdown.totalAmount,
        paymentStatus: 'Paid',
        paymentMethod,
        transactionId: `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
      };

      const mappedApp: Application = {
        id: state.draft.id,
        serviceId: 'company-registration',
        serviceName: 'Company Registration',
        category: 'BUSINESS',
        status: 'Under Verification',
        progress: 100,
        assignedExecutive: 'Finsolz Compliance Team',
        paymentAmount: state.draft.feeBreakdown.totalAmount,
        paymentStatus: 'Paid',
        createdAt: new Date().toISOString().split("T")[0],
        formData: {
          companyType: state.draft.company.companyType,
          proposedName: state.draft.company.proposedName1,
        },
        documents: state.draft.documents.map(d => ({ name: d.name, status: d.status as any, fileUri: d.fileUri })),
        timeline: state.draft.trackingStages?.map((stg) => ({
          title: stg.title,
          description: stg.description,
          status: stg.status as "completed" | "current" | "pending",
          date: stg.updatedAt || 'Today',
        })) || [],
        chatHistory: [],
      };

      useApplicationStore.getState().addApplication(mappedApp);

      return {
        draft: { ...state.draft, paymentStatus: 'Paid', status: 'Submitted', receipt },
      };
    }),
  submitRegistrationSuccess: (appId, statusText) =>
    set((state) => {
      const realId = appId || state.draft.id || `APP-${Date.now().toString().slice(-6)}`;
      const dateStr = new Date().toISOString().split('T')[0];
      const mappedApp: Application = {
        id: realId,
        serviceId: 'company-registration',
        serviceName: 'Company Registration',
        category: 'BUSINESS',
        status: (statusText as any) || 'Under Verification',
        progress: 100,
        assignedExecutive: 'Finsolz Compliance Team',
        paymentAmount: state.draft.feeBreakdown.totalAmount,
        paymentStatus: 'Pending',
        createdAt: dateStr,
        formData: { companyType: state.draft.company.companyType, proposedName: state.draft.company.proposedName1 },
        documents: state.draft.documents.map(d => ({ name: d.name, status: d.status as any, fileUri: d.fileUri })),
        timeline: state.draft.trackingStages?.map((stg) => ({ title: stg.title, description: stg.description, status: stg.status as any, date: stg.updatedAt || 'Today' })) || [],
        chatHistory: [],
      };
      useApplicationStore.getState().addApplication(mappedApp);
      return { draft: { ...state.draft, id: realId, status: 'Submitted', createdAt: dateStr, currentStep: 7 }, editingStep: null };
    }),
  setDraft: (newDraft) => set({ draft: newDraft }),
  resetRegistration: () =>
    set({
      registrationId: null,
      registeredOfficeId: null,
      draft: getInitialDraft(),
      fieldErrors: {},
      editingStep: null,
    }),
}));
