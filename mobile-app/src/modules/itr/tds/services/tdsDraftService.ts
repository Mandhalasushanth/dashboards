import AsyncStorage from "@react-native-async-storage/async-storage";
import { TdsCustomerIncomeFormData } from "../types/customerIncome.types";
import { useAuthStore } from "@/modules/authentication/store/authStore";
import { authStorage } from "@/modules/authentication/services/authStorage";
import { addDraftToIndex, removeDraftFromIndex } from "@/shared/hooks/useServiceDraft";

function getAuthMobile(): string {
  const state = useAuthStore.getState();
  return String(
    state.customer?.mobile ||
    state.authenticatedUser?.mobileNumber ||
    (state.authenticatedUser as any)?.mobile ||
    authStorage.getSession().activeMobile ||
    state.mobileNumber ||
    ""
  );
}

function getCleanMobile(): string {
  return getAuthMobile().replace(/\D/g, "") || "user";
}

export function getTdsCustId(fallbackMobile?: string): string {
  const rawMobile = getAuthMobile() || fallbackMobile || "";
  return rawMobile.replace(/\D/g, "").slice(-10);
}

const getStorageKeyForm = () => `@finsolz_draft_${getCleanMobile()}_tds-refund`;
const getStorageKeyDocs = () => `@finsolz_draft_${getCleanMobile()}_tds_docs`;
const getStorageKeyAppId = () => `@finsolz_draft_${getCleanMobile()}_tds_app_id`;

export const INITIAL_TDS_FORM_DATA: TdsCustomerIncomeFormData = {
  business: { legalName: "", pan: "", aadhaar: "", mobileNumber: "" },
  personal: {
    fullName: "",
    pan: "",
    aadhaar: "",
    dob: "",
    mobileNumber: "",
    email: "",
    residentialAddress: "",
    city: "",
    state: "",
    pinCode: "",
  },
  bank: {
    accountHolderName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    bankName: "",
    branchName: "",
    accountType: "savings",
    isIfscVerified: false,
  },
  income: {
    assessmentYear: "2025-26",
    financialYear: "2024-25",
    taxRegime: "NEW",
    salaryIncome: "",
    otherIncome: "",
    interestIncome: "",
    hasRentalIncome: false,
    rentalIncome: "",
    municipalTaxesPaid: "",
    hasCapitalGains: false,
    shortTermCapitalGains: "",
    longTermCapitalGains: "",
    hasBusinessIncome: false,
    grossTurnover: "",
    netBusinessProfit: "",
    hasHomeLoan: false,
    homeLoanInterestSec24b: "",
    hasDeductions: false,
    deductions80C: "",
    deductions80D: "",
    donations80G: "",
    otherDeductions: "",
    hasPreviousLoss: false,
    carryForwardLossAmount: "",
    totalTdsDeducted: "",
    tcsAmount: "",
    advanceTaxPaid: "",
    selfAssessmentTaxPaid: "",
  },
};

export const tdsDraftService = {
  saveFormDraft: async (formData: TdsCustomerIncomeFormData, step: string = "FORM"): Promise<void> => {
    try {
      const cleanMobile = getCleanMobile();
      const payload = {
        serviceKey: "tds-refund",
        serviceName: "TDS Refund",
        category: "ITR",
        step,
        formData,
        updatedAt: new Date().toISOString().split("T")[0],
      };
      await AsyncStorage.setItem(getStorageKeyForm(), JSON.stringify(payload));
      await addDraftToIndex(cleanMobile, "tds-refund");
    } catch (err) {
      console.error("Failed to save TDS form draft:", err);
    }
  },

  getFormDraft: async (): Promise<TdsCustomerIncomeFormData> => {
    try {
      const raw = await AsyncStorage.getItem(getStorageKeyForm());
      if (raw) {
        const parsed = JSON.parse(raw);
        const data = parsed.formData || parsed;
        return {
          business: { ...INITIAL_TDS_FORM_DATA.business, ...(data.business || {}) },
          personal: { ...INITIAL_TDS_FORM_DATA.personal, ...(data.personal || {}) },
          bank: { ...INITIAL_TDS_FORM_DATA.bank, ...(data.bank || {}) },
          income: { ...INITIAL_TDS_FORM_DATA.income, ...(data.income || {}) },
        };
      }
    } catch (err) {
      console.error("Failed to read TDS form draft:", err);
    }
    return INITIAL_TDS_FORM_DATA;
  },

  getDraftMetadata: async (): Promise<{ step?: string; updatedAt?: string } | null> => {
    try {
      const raw = await AsyncStorage.getItem(getStorageKeyForm());
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          step: parsed.step,
          updatedAt: parsed.updatedAt,
        };
      }
    } catch {}
    return null;
  },

  saveDocumentsDraft: async (documents: any[]): Promise<void> => {
    try {
      const cleanMobile = getCleanMobile();
      await AsyncStorage.setItem(getStorageKeyDocs(), JSON.stringify(documents));
      const raw = await AsyncStorage.getItem(getStorageKeyForm());
      const existing = raw ? JSON.parse(raw) : {};
      await AsyncStorage.setItem(
        getStorageKeyForm(),
        JSON.stringify({
          serviceKey: "tds-refund",
          serviceName: "TDS Refund",
          category: "ITR",
          step: existing.step || "DOCUMENTS",
          formData: existing.formData || {},
          documents,
          updatedAt: new Date().toISOString().split("T")[0],
        }),
      );
      await addDraftToIndex(cleanMobile, "tds-refund");
    } catch (err) {
      console.error("Failed to save TDS documents draft:", err);
    }
  },

  getDocumentsDraft: async (): Promise<any[] | null> => {
    try {
      const raw = await AsyncStorage.getItem(getStorageKeyDocs());
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error("Failed to read TDS documents draft:", err);
    }
    return null;
  },

  saveApplicationId: async (appId: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(getStorageKeyAppId(), appId);
    } catch (err) {
      console.error("Failed to save application ID:", err);
    }
  },

  getApplicationId: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(getStorageKeyAppId());
    } catch {
      return null;
    }
  },

  clearDraft: async (): Promise<void> => {
    try {
      const cleanMobile = getCleanMobile();
      await AsyncStorage.removeItem(getStorageKeyForm());
      await AsyncStorage.removeItem(getStorageKeyDocs());
      await AsyncStorage.removeItem(getStorageKeyAppId());
      await removeDraftFromIndex(cleanMobile, "tds-refund");
    } catch {}
  },
};

export default tdsDraftService;
