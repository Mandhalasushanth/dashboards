import { create } from "zustand";
import { getInitialFormData } from "./itrInitialState";
import { recalculateItrForm, deepMergeItrFormData, buildApplicationDraftPayload } from "./itrStoreHelpers";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "@/store/authStore";
import { useApplicationStore } from "@/store/applicationStore";
import { authStorage } from "@/modules/authentication/services/authStorage";
import { addDraftToIndex, removeDraftFromIndex } from "@/shared/hooks/useServiceDraft";
import {
  ItrFilingFormData,
  ItrPersonalInfo,
  ItrBankDetails,
  ItrSelectableBank,
  ItrPriorFilingAndNotice,
  IncomeSalaryData,
  IncomeHousePropertyData,
  IncomeBusinessData,
  IncomeCapitalGainsData,
  IncomeOtherSourcesData,
  ItrStructuredDeductions,
  TaxesPaidDetails,
  TaxRegimeType,
  GstReconciliationSummary,
  ItrCategoryType,
  IncomeSourcesState,
} from "../itr-filing/types/itrFiling.types";
import { logger } from "@/core/logging/logger";
export interface ItrDraftState {
  id: string;
  stepIndex: number;
  maxStepReached?: number;
  formData: ItrFilingFormData;
  updatedAt: string;
}

const getCleanMobile = (): string => {
  const auth = useAuthStore.getState();
  const rawMobile = auth.customer?.mobile || auth.authenticatedUser?.mobileNumber || auth.mobileNumber || "user";
  return String(rawMobile).replace(/\D/g, "") || "user";
};
interface ITRState {
  currentStep: number;
  maxStepReached: number;
  setStep: (step: number) => void;
  formData: ItrFilingFormData;
  // Specific Step updaters
  setCategory: (category: ItrCategoryType) => void;
  setPersonalInfo: (info: Partial<ItrPersonalInfo>) => void;
  selectRefundBank: (bankId: string) => void;
  addBankAccount: (bank: ItrSelectableBank) => void;
  updateBankAccount: (bank: ItrSelectableBank) => void;
  setBankDetails: (details: Partial<ItrBankDetails>) => void;
  setPriorItrNotice: (data: Partial<ItrPriorFilingAndNotice>) => void;
  importPriorItrData: (selectedKeys: {
    income?: boolean;
    deductions?: boolean;
    losses?: boolean;
    bank?: boolean;
    filing?: boolean;
  }) => void;
  setIncomeSalary: (data: Partial<IncomeSalaryData>) => void;
  setIncomeHouseProperty: (data: Partial<IncomeHousePropertyData>) => void;
  setIncomeBusiness: (data: Partial<IncomeBusinessData>) => void;
  setIncomeCapitalGains: (data: Partial<IncomeCapitalGainsData>) => void;
  setIncomeOtherSources: (data: Partial<IncomeOtherSourcesData>) => void;
  setRegime: (regime: TaxRegimeType) => void;
  setDeductions: (deductions: Partial<ItrStructuredDeductions>) => void;
  setTaxesPaid: (taxes: Partial<TaxesPaidDetails>) => void;
  setDeclarationAccepted: (accepted: boolean) => void;
  updateDocument: (docId: string, fileInfo: any) => void;
  updateGstReconciliation: (data: Partial<GstReconciliationSummary>) => void;
  setBackendIds: (ids: { itrId?: string; incomeId?: string; documentId?: string }) => void;
  // Draft handling
  itrDraft: ItrDraftState | null;
  /** True between clearItrDraft() and the next saveItrDraft(). Blocks restoreItrDraft() so
   *  a stale AsyncStorage entry left by an in-flight removal cannot pollute a new application. */
  _draftCleared: boolean;
  /** True when AsyncStorage.removeItem failed in clearItrDraft(). resetForm() propagates this
   *  into _draftCleared so restoration is blocked until saveItrDraft() overwrites the stale key. */
  _storageCleanFailed: boolean;
  saveItrDraft: () => Promise<void>;
  restoreItrDraft: () => Promise<boolean>;
  clearItrDraft: () => Promise<void>;
  resetForm: () => void;
  fetchAndPopulateUserProfile: () => Promise<void>;
}
export const useITRStore = create<ITRState>((set, get) => ({
  currentStep: 0,
  maxStepReached: 0,
  _draftCleared: false,
  _storageCleanFailed: false,
  setStep: (step) => set((state) => ({
    currentStep: step,
    maxStepReached: Math.max(state.maxStepReached, step)
  })),
  setBackendIds: (ids) =>
    set((state) => ({
      formData: { ...state.formData, ...ids },
    })),
  formData: getInitialFormData(),
  setCategory: (category: ItrCategoryType) =>
    set((state) => {
      const prevSources = state.formData.incomeSources;
      let newSources: IncomeSourcesState = {
        salary: { ...prevSources.salary, enabled: false },
        houseProperty: { ...prevSources.houseProperty, enabled: false },
        business: { ...prevSources.business, enabled: false },
        capitalGains: { ...prevSources.capitalGains, enabled: false },
        otherSources: { ...prevSources.otherSources, enabled: false },
      };
      if (category === "salaried") newSources.salary.enabled = true;
      else if (category === "business") { newSources.business.enabled = true; newSources.business.businessType = "presumptive_44ad"; }
      else if (category === "professional" || category === "freelancer") { newSources.business.enabled = true; newSources.business.businessType = "presumptive_44ada"; }
      else if (category === "trader_investor") { newSources.capitalGains.enabled = true; newSources.capitalGains.hasFnoIntraday = true; }
      else if (category === "rental") { newSources.houseProperty.enabled = true; newSources.houseProperty.propertyType = "let_out"; }
      else if (category === "capital_gains") { newSources.capitalGains.enabled = true; }
      else if (category === "multiple") { newSources.salary.enabled = true; newSources.business.enabled = true; }
      return {
        formData: recalculateItrForm({
          ...state.formData,
          category,
          incomeSources: newSources,
        })
      };
    }),
  setPersonalInfo: (info) =>
    set((state) => {
      const personalInfo = { ...state.formData.personalInfo, ...info };
      return {
        formData: recalculateItrForm({
          ...state.formData,
          personalInfo,
        })
      };
    }),
  selectRefundBank: (bankId) =>
    set((state) => {
      const updatedAccounts = state.formData.bankAccountsList.map((bank) => ({
        ...bank,
        isPrimaryRefund: bank.id === bankId,
      }));
      const selected = updatedAccounts.find((b) => b.id === bankId);
      if (!selected) return state;
      return {
        formData: {
          ...state.formData,
          bankAccountsList: updatedAccounts,
          bankDetails: {
            bankName: selected.bankName,
            accountNumber: selected.accountNumber,
            confirmAccountNumber: selected.accountNumber,
            ifscCode: selected.ifscCode,
            accountType: selected.accountType,
            isPrimaryRefund: true,
            validationStatus: selected.validationStatus,
          },
        },
      };
    }),
  addBankAccount: (newBank) =>
    set((state) => ({
      formData: {
        ...state.formData,
        bankAccountsList: [...state.formData.bankAccountsList, newBank],
      },
    })),
  updateBankAccount: (updatedBank) =>
    set((state) => {
      const updatedList = state.formData.bankAccountsList.map((b) =>
        b.id === updatedBank.id ? updatedBank : b
      );
      const isSelected = state.formData.bankDetails.accountNumber === updatedBank.accountNumber;
      return {
        formData: {
          ...state.formData,
          bankAccountsList: updatedList,
          ...(isSelected
            ? {
              bankDetails: {
                ...state.formData.bankDetails,
                bankName: updatedBank.bankName,
                accountNumber: updatedBank.accountNumber,
                ifscCode: updatedBank.ifscCode,
                accountType: updatedBank.accountType,
              },
            }
            : {}),
        },
      };
    }),
  setBankDetails: (details) =>
    set((state) => ({
      formData: {
        ...state.formData,
        bankDetails: { ...state.formData.bankDetails, ...details },
      },
    })),
  setPriorItrNotice: (data) =>
    set((state) => ({
      formData: recalculateItrForm({
        ...state.formData,
        priorItrNotice: { ...state.formData.priorItrNotice, ...data },
      }),
    })),
  importPriorItrData: (selectedKeys) =>
    set((state) => {
      const prior = state.formData.priorItrNotice;
      return {
        formData: {
          ...state.formData,
          priorItrNotice: {
            ...prior,
            importedIncomeDetails: selectedKeys.income ?? prior.importedIncomeDetails,
            importedDeductions: selectedKeys.deductions ?? prior.importedDeductions,
            importedLosses: selectedKeys.losses ?? prior.importedLosses,
            importedBankDetails: selectedKeys.bank ?? prior.importedBankDetails,
            importedFilingDetails: selectedKeys.filing ?? prior.importedFilingDetails,
          },
        },
      };
    }),
  setIncomeSalary: (data) =>
    set((state) => {
      const salary = { ...state.formData.incomeSources.salary, ...data };
      const incomeSources = { ...state.formData.incomeSources, salary };
      return {
        formData: recalculateItrForm({
          ...state.formData,
          incomeSources,
        })
      };
    }),
  setIncomeHouseProperty: (data) =>
    set((state) => {
      const houseProperty = {
        ...state.formData.incomeSources.houseProperty,
        ...data,
      };
      const incomeSources = { ...state.formData.incomeSources, houseProperty };
      return {
        formData: recalculateItrForm({
          ...state.formData,
          incomeSources,
        })
      };
    }),
  setIncomeBusiness: (data) =>
    set((state) => {
      const business = { ...state.formData.incomeSources.business, ...data };
      const incomeSources = { ...state.formData.incomeSources, business };
      return {
        formData: recalculateItrForm({
          ...state.formData,
          incomeSources,
        })
      };
    }),
  setIncomeCapitalGains: (data) =>
    set((state) => {
      const capitalGains = {
        ...state.formData.incomeSources.capitalGains,
        ...data,
      };
      const incomeSources = { ...state.formData.incomeSources, capitalGains };
      return {
        formData: recalculateItrForm({
          ...state.formData,
          incomeSources,
        })
      };
    }),
  setIncomeOtherSources: (data) =>
    set((state) => {
      const otherSources = {
        ...state.formData.incomeSources.otherSources,
        ...data,
      };
      const incomeSources = { ...state.formData.incomeSources, otherSources };
      return { formData: recalculateItrForm({ ...state.formData, incomeSources }) };
    }),
  setRegime: (regime) =>
    set((state) => {
      return { formData: recalculateItrForm({ ...state.formData, regime }) };
    }),

  setDeductions: (deductionsPartial) =>
    set((state) => ({
      formData: recalculateItrForm({
        ...state.formData,
        deductions: {
          ...state.formData.deductions,
          ...deductionsPartial,
        },
      }),
    })),
  setTaxesPaid: (taxesPartial) =>
    set((state) => ({
      formData: recalculateItrForm({
        ...state.formData,
        taxesPaid: {
          ...state.formData.taxesPaid,
          ...taxesPartial,
        },
      }),
    })),
  setDeclarationAccepted: (declarationAccepted) =>
    set((state) => ({
      formData: { ...state.formData, declarationAccepted },
    })),
  updateDocument: (docId, fileInfo) =>
    set((state) => ({
      formData: {
        ...state.formData,
        documents: state.formData.documents.map((doc) =>
          doc.id !== docId
            ? doc
            : fileInfo
              ? { ...doc, fileUri: fileInfo.uri, fileName: fileInfo.name, fileSize: fileInfo.size, mimeType: fileInfo.type, uploadedAt: new Date().toISOString() }
              : { ...doc, fileUri: undefined, fileName: undefined, fileSize: undefined, mimeType: undefined, uploadedAt: undefined }
        ),
      },
    })),
  updateGstReconciliation: (gstData) =>
    set((state) => {
      const existing = state.formData.gstReconciliation;
      if (!existing) return state;
      return {
        formData: {
          ...state.formData,
          gstReconciliation: {
            ...existing,
            ...gstData,
          },
        },
      };
    }),
  itrDraft: null,
  saveItrDraft: async (): Promise<void> => {
    const { currentStep, maxStepReached, formData } = get();
    const draft: ItrDraftState = {
      id: `itr-draft-${Date.now()}`,
      stepIndex: currentStep,
      maxStepReached,
      formData,
      updatedAt: new Date().toISOString(),
    };
    set({ itrDraft: draft, _draftCleared: false, _storageCleanFailed: false });
    const clean = getCleanMobile();

    const storagePayload = {
      serviceKey: "itr-filing",
      serviceName: "ITR Filing",
      category: "ITR",
      step: currentStep,
      stepIndex: currentStep,
      maxStepReached,
      formData,
      documents: formData.documents,
      updatedAt: draft.updatedAt,
    };
    await AsyncStorage.setItem(`@finsolz_draft_${clean}_itr-filing`, JSON.stringify(storagePayload));

    try {
      await addDraftToIndex(clean, "itr-filing");
    } catch (indexErr) {
      logger.warn("[ITRStore] Failed to update draft index", {
        error: indexErr instanceof Error ? indexErr.message : String(indexErr),
      });
    }

    try {
      useApplicationStore.getState().saveItrDraft(
        buildApplicationDraftPayload(draft.id, currentStep, formData, draft.updatedAt) as any
      );
    } catch (appStoreErr) {
      logger.warn("[ITRStore] Failed to sync applicationStore draft", {
        error: appStoreErr instanceof Error ? appStoreErr.message : String(appStoreErr),
      });
    }
  },
  restoreItrDraft: async (): Promise<boolean> => {
    // If the draft was cleared in this session (e.g. after submit), skip restoration.
    // This prevents a stale AsyncStorage entry from being read before the async removal finishes.
    if (get()._draftCleared) return false;
    try {
      const clean = getCleanMobile();
      const raw = await AsyncStorage.getItem(`@finsolz_draft_${clean}_itr-filing`);
      let draftData: any = null;
      if (raw) {
        draftData = JSON.parse(raw);
      } else {
        draftData = get().itrDraft;
      }
      if (!draftData) return false;
      const restoredStep =
        typeof draftData.stepIndex === "number"
          ? draftData.stepIndex
          : typeof draftData.step === "number"
            ? draftData.step
            : 0;

      const parsedMaxStep =
        typeof draftData.maxStepReached === "number"
          ? draftData.maxStepReached
          : (restoredStep >= 3 ? 3 : restoredStep);
      const restoredMaxStep = Math.max(restoredStep, parsedMaxStep);

      const restoredFormData = draftData.formData || draftData.filingData;
      if (restoredFormData) {
        const merged = deepMergeItrFormData(getInitialFormData(), restoredFormData);
        const recalculated = recalculateItrForm(merged);
        set({
          currentStep: restoredStep,
          maxStepReached: restoredMaxStep,
          formData: recalculated,
          itrDraft: {
            id: draftData.id || `itr-draft-${Date.now()}`,
            stepIndex: restoredStep,
            maxStepReached: restoredMaxStep,
            formData: recalculated,
            updatedAt: draftData.updatedAt || new Date().toISOString(),
          },
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
  clearItrDraft: async (): Promise<void> => {
    // Set the flag synchronously so restoreItrDraft() sees it immediately,
    // even before the async storage operations below complete.
    set({ itrDraft: null, _draftCleared: true, _storageCleanFailed: false });
    const clean = getCleanMobile();
    useApplicationStore.getState().clearItrDraft();
    const results = await Promise.allSettled([
      removeDraftFromIndex(clean, "itr-filing"),
      AsyncStorage.removeItem(`@finsolz_draft_${clean}_itr-filing`),
    ]);
    if (results[1].status === "rejected") {
      set({ _storageCleanFailed: true });
      logger.warn("[ITRStore] Draft AsyncStorage removal failed; restoration guard stays active", {
        reason: results[1].reason instanceof Error ? results[1].reason.message : String(results[1].reason),
      });
    }
  },
  resetForm: () =>
    set((state) => ({
      currentStep: 0,
      maxStepReached: 0,
      formData: getInitialFormData(),
      itrDraft: null,
      // Keep the guard active if storage removal failed — cleared only when saveItrDraft overwrites the key.
      _draftCleared: state._storageCleanFailed,
    })),
  fetchAndPopulateUserProfile: async () => {
    try {
      const p = authStorage.getUser() as any;
      if (!p) return;
      set((prev) => {
        const cur = prev.formData.personalInfo;
        return {
          formData: {
            ...prev.formData,
            personalInfo: {
              ...cur,
              pan: cur.pan || p.pan || p.panNumber || "",
              aadhaar: cur.aadhaar || p.aadhaar || p.aadhaarNumber || "",
              name: cur.name || p.name || p.fullName || "",
              dob: cur.dob || p.dob || p.dateOfBirth || "",
              mobile: cur.mobile || p.mobileNumber || p.mobile || "",
              email: cur.email || p.email || "",
              address: cur.address || p.address || p.addressLine1 || "",
              city: cur.city || p.city || "",
              state: cur.state || p.state || "",
              pincode: cur.pincode || p.pincode || p.pinCode || "",
              isAutoVerified: Boolean(cur.pan || p.pan || p.panNumber),
            },
          },
        };
      });
    } catch { }
  },
}));
