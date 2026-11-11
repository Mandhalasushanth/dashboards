import type { Customer } from "@/shared/types/domain";
import type { DevUser } from "@/modules/authentication/types/auth.types";
import type { CustomerApiRecord } from "@/modules/authentication/services/authApi";
import type { PersonalDetails, TdsCustomerIncomeFormData } from "../../types/customerIncome.types";
import {
  validateCustomerIncomeForm,
  validatePersonalDetails,
  validateBusinessDetails,
  CustomerFormErrors,
} from "../../validation/tdsCustomerSchema";

/** Customer fields as returned by the customer-details API or read from the locally stored user. */
export type CustomerProfileRecord = CustomerApiRecord;

/** Logged-in user as stored by auth; older records carry `custId` instead of `customerId`. */
type AuthUserRecord = DevUser & { custId?: string };

/** Customer built from a fetched profile record, falling back to what the app already holds. */
export const mergeFetchedCustomer = (
  apiRes: CustomerProfileRecord,
  currentCustomer: Customer | null,
  currentAuthUser: AuthUserRecord | null,
  activeMobile: string | null | undefined,
  activeCustId: string | null | undefined
): Customer => ({
  name: apiRes.name || apiRes.fullName || currentCustomer?.name || "",
  email: apiRes.email || currentCustomer?.email || "",
  mobile: apiRes.mobileNumber || apiRes.mobile || currentCustomer?.mobile || activeMobile || "",
  pan: apiRes.pan || currentCustomer?.pan || "",
  aadhaar: apiRes.aadhaar || currentCustomer?.aadhaar || "",
  dob: apiRes.dob || apiRes.dateOfBirth || currentCustomer?.dob || "",
  customerType: apiRes.customerType || apiRes.custType || currentCustomer?.customerType || "Individual",
  addressLine1: apiRes.addressLine1 || currentCustomer?.addressLine1 || "",
  addressLine2: apiRes.addressLine2 || currentCustomer?.addressLine2 || "",
  city: apiRes.city || currentCustomer?.city || "",
  state: apiRes.state || currentCustomer?.state || "",
  pincode: apiRes.pincode || apiRes.pinCode || currentCustomer?.pincode || "",
  address: apiRes.address || currentCustomer?.address || "",
  customerId: apiRes.custId || apiRes.customerId || currentCustomer?.customerId || activeCustId || "",
  avatarUri: currentCustomer?.avatarUri || null,
  profileCompleted: true,
  hasPasscode: currentCustomer?.hasPasscode ?? Boolean(currentAuthUser?.passcode),
});

/** Personal-details section of the TDS form, from the best available profile source. */
export const buildPersonalDetails = (
  apiRes: CustomerProfileRecord | null,
  currentCustomer: Customer | null,
  currentAuthUser: AuthUserRecord | null
): PersonalDetails => {
  const rawPan = apiRes?.pan || currentCustomer?.pan || currentAuthUser?.pan || "";
  const rawAadhaar = apiRes?.aadhaar || currentCustomer?.aadhaar || currentAuthUser?.aadhaar || "";
  const rawDob = apiRes?.dob || apiRes?.dateOfBirth || currentCustomer?.dob || currentAuthUser?.dob || "";
  const rawMobile = apiRes?.mobileNumber || apiRes?.mobile || currentCustomer?.mobile || currentAuthUser?.mobileNumber || "";
  const rawEmail = apiRes?.email || currentCustomer?.email || currentAuthUser?.email || "";
  const rawName = apiRes?.name || apiRes?.fullName || currentCustomer?.name || currentAuthUser?.name || "";

  let rawAddress = apiRes?.addressLine1 || currentCustomer?.addressLine1 || apiRes?.address || currentCustomer?.address || "";
  if (apiRes?.addressLine2 || currentCustomer?.addressLine2) {
    // One of the two is set (checked above), so the empty fallback never applies.
    const line2 = apiRes?.addressLine2 || currentCustomer?.addressLine2 || "";
    rawAddress = rawAddress ? `${rawAddress}, ${line2}` : line2;
  }

  const rawCity = apiRes?.city || currentCustomer?.city || "";
  const rawState = apiRes?.state || currentCustomer?.state || "";
  const rawPin = apiRes?.pincode || apiRes?.pinCode || currentCustomer?.pincode || "";

  return {
    fullName: rawName,
    pan: rawPan,
    aadhaar: rawAadhaar,
    dob: rawDob,
    mobileNumber: rawMobile,
    email: rawEmail,
    residentialAddress: rawAddress,
    city: rawCity,
    state: rawState,
    pinCode: rawPin,
  };
};

/** Customer record after the user edits their personal details on the TDS form. */
export const buildCustomerFromPersonal = (
  normalizedPersonal: PersonalDetails,
  cleanMob: string,
  currentCust: Customer | null,
  currentAuthUser: AuthUserRecord | null
): Customer => ({
  name: normalizedPersonal.fullName,
  email: normalizedPersonal.email,
  mobile: cleanMob || normalizedPersonal.mobileNumber,
  pan: normalizedPersonal.pan,
  aadhaar: normalizedPersonal.aadhaar,
  dob: normalizedPersonal.dob,
  customerType: currentCust?.customerType || "Individual",
  addressLine1: normalizedPersonal.residentialAddress,
  addressLine2: currentCust?.addressLine2 || "",
  city: normalizedPersonal.city,
  state: normalizedPersonal.state,
  pincode: normalizedPersonal.pinCode,
  address: `${normalizedPersonal.residentialAddress}, ${normalizedPersonal.city}, ${normalizedPersonal.state} - ${normalizedPersonal.pinCode}`,
  customerId: currentCust?.customerId || currentAuthUser?.customerId || currentAuthUser?.custId || "",
  avatarUri: currentCust?.avatarUri || null,
  profileCompleted: true,
  hasPasscode: currentCust?.hasPasscode ?? Boolean(currentAuthUser?.passcode),
});

/** Request body for `authApi.updateCustomerProfile`. */
export const buildCustomerProfileUpdate = (updatedCustomer: Customer) => ({
  custId: updatedCustomer.customerId || undefined,
  name: updatedCustomer.name,
  email: updatedCustomer.email,
  mobileNumber: updatedCustomer.mobile,
  pan: updatedCustomer.pan,
  aadhaar: updatedCustomer.aadhaar,
  dob: updatedCustomer.dob,
  addressLine1: updatedCustomer.addressLine1,
  addressLine2: updatedCustomer.addressLine2,
  city: updatedCustomer.city,
  state: updatedCustomer.state,
  pincode: updatedCustomer.pincode,
  address: updatedCustomer.address,
});

/** Saves the updated customer details to local authStorage session and user records. */
export const persistUpdatedCustomer = async (updatedCustomer: Customer, cleanMob?: string) => {
  try {
    const { authStorage } = await import("@/modules/authentication/services/authStorage");
    const existingUser = authStorage.getUser() || {};
    authStorage.saveUser({
      ...existingUser,
      name: updatedCustomer.name,
      email: updatedCustomer.email,
      mobileNumber: updatedCustomer.mobile,
      pan: updatedCustomer.pan,
      aadhaar: updatedCustomer.aadhaar,
      dob: updatedCustomer.dob,
      address: `${updatedCustomer.addressLine1 || ""} ${updatedCustomer.addressLine2 || ""}`.trim(),
      addressLine1: updatedCustomer.addressLine1,
      addressLine2: updatedCustomer.addressLine2,
      city: updatedCustomer.city,
      state: updatedCustomer.state,
      pincode: updatedCustomer.pincode,
      customerType: updatedCustomer.customerType,
    } as any);

    if (cleanMob) {
      authStorage.saveSession({
        ...authStorage.getSession(),
        isLoggedIn: true,
        activeMobile: cleanMob,
      });
    }
  } catch {}
};

/** Synchronizes updated personal details across authStore, customerStore, and backend profile API. */
export const syncUpdatedCustomerProfile = async (
  normalizedPersonal: PersonalDetails,
  cleanMob: string
): Promise<void> => {
  const { authApi } = await import("@/modules/authentication/services/authApi");
  const { useAuthStore } = await import("@/modules/authentication/store/authStore");
  const { useCustomerStore } = await import("@/modules/customer/store/customerStore");

  const currentCust = useAuthStore.getState().customer;
  const currentAuthUser = useAuthStore.getState().authenticatedUser;

  const updatedCustomer: Customer = buildCustomerFromPersonal(
    normalizedPersonal,
    cleanMob,
    currentCust,
    currentAuthUser as any
  );

  useAuthStore.setState({ customer: updatedCustomer, profileCompleted: true });
  try {
    useCustomerStore.getState().setProfile(updatedCustomer);
  } catch {}

  await persistUpdatedCustomer(updatedCustomer, cleanMob);

  try {
    await authApi.updateCustomerProfile(buildCustomerProfileUpdate(updatedCustomer));
  } catch (err: any) {
    console.warn("⚠️ [TDS Form] Error sending customer update to backend:", err?.message);
  }
};

/**
 * Merges objects sequentially, but only overrides a field if the source value
 * is non-empty (not undefined, null, or empty string).
 * This prevents empty drafts/defaults from wiping out populated database values.
 */
export function mergeNonEmptyFields<T extends Record<string, any>>(
  base: T,
  ...sources: (Partial<T> | null | undefined)[]
): T {
  const result = { ...base };
  for (const source of sources) {
    if (!source || typeof source !== "object") continue;
    for (const [key, val] of Object.entries(source)) {
      if (val !== undefined && val !== null && val !== "") {
        (result as any)[key] = val;
      }
    }
  }
  return result;
}

/**
 * Validates only the specified section when the user is in edit mode.
 */
export function validateSection(
  section: "personal" | "business" | "bank" | "income" | string | undefined,
  formData: TdsCustomerIncomeFormData
): { isValid: boolean; errors: CustomerFormErrors } {
  const errors: CustomerFormErrors = {};

  if (!section || section === "all") {
    return validateCustomerIncomeForm(formData);
  }

  if (section === "personal") {
    const val = validatePersonalDetails(formData.personal);
    Object.entries(val.errors).forEach(([k, v]) => {
      errors[`personal.${k}`] = v;
    });
  } else if (section === "business") {
    if (formData.business) {
      const val = validateBusinessDetails(formData.business);
      Object.entries(val.errors).forEach(([k, v]) => {
        errors[`business.${k}`] = v;
      });
    }
  } else if (section === "bank") {
    const full = validateCustomerIncomeForm(formData);
    Object.entries(full.errors).forEach(([k, v]) => {
      if (k.startsWith("bank.")) {
        errors[k] = v;
      }
    });
  } else if (section === "income") {
    const full = validateCustomerIncomeForm(formData);
    Object.entries(full.errors).forEach(([k, v]) => {
      if (k.startsWith("income.")) {
        errors[k] = v;
      }
    });
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/** Updates form errors on blur for a single field path. */
export function applyBlurValidation(
  prev: CustomerFormErrors,
  fieldPath: string,
  formData: TdsCustomerIncomeFormData
): CustomerFormErrors {
  try {
    const validation = validateCustomerIncomeForm(formData);
    const fieldError = validation.errors[fieldPath];
    const next = { ...prev };
    let hasChanged = false;

    if (fieldError) {
      if (next[fieldPath] !== fieldError) {
        next[fieldPath] = fieldError;
        hasChanged = true;
      }
    } else if (next[fieldPath]) {
      delete next[fieldPath];
      hasChanged = true;
    }

    if (
      fieldPath === "bank.accountNumber" &&
      next["bank.confirmAccountNumber"] &&
      !validation.errors["bank.confirmAccountNumber"]
    ) {
      delete next["bank.confirmAccountNumber"];
      hasChanged = true;
    }

    return hasChanged ? next : prev;
  } catch (err) {
    console.warn(`[TDS Validation] Error validating on blur for ${fieldPath}:`, err);
    return prev;
  }
}

/** Loads and merges saved document draft with initial documents definition. */
export async function loadDraftDocuments(): Promise<any[]> {
  try {
    const { tdsDraftService } = await import("../../services/tdsDraftService");
    const { INITIAL_TDS_DOCUMENTS } = await import("../../constants/tdsDocuments.constants");
    const draftDocs = await tdsDraftService.getDocumentsDraft();
    if (draftDocs && draftDocs.length > 0) {
      return INITIAL_TDS_DOCUMENTS.map((initialDoc) => {
        const draftDoc = draftDocs.find((d: any) => d.id === initialDoc.id);
        return draftDoc
          ? { ...initialDoc, ...draftDoc, title: initialDoc.title, subtitle: initialDoc.subtitle }
          : initialDoc;
      });
    }
    return INITIAL_TDS_DOCUMENTS;
  } catch (err) {
    console.warn("[TDS Form] loadDraftDocuments warning:", err);
    return [];
  }
}

/** Synchronizes application state with backend (PUT on edit, full save otherwise). */
export async function syncApplicationBackend(
  isEditing: boolean,
  targetId: string | undefined,
  custId: string,
  formData: TdsCustomerIncomeFormData,
  activeDocs: any[]
): Promise<string> {
  const { tdsApiService } = await import("../../services/tdsApiService");

  if (isEditing && targetId) {
    console.log(`🌐 [TDS Form] Updating record via PUT /tds-refund/update/${targetId}`);
    const savedTdsId = await tdsApiService.updateBankAccount(
      targetId,
      formData.bank,
      custId,
      formData.business,
      activeDocs as any,
      formData.personal,
    );

    try {
      await tdsApiService.saveIncomeTaxInfo(formData.income, targetId);
    } catch (e) {
      console.warn("[TDS Form] saveIncomeTaxInfo auxiliary update warning:", e);
    }
    try {
      await tdsApiService.saveTdsTaxesPaid(formData.income, custId, targetId);
    } catch (e) {
      console.warn("[TDS Form] saveTdsTaxesPaid auxiliary update warning:", e);
    }
    const hasUploadedDocs = (activeDocs as any[]).some(
      (d) => d.status === "uploaded" || Boolean(d.fileUri),
    );
    if (hasUploadedDocs) {
      try {
        await tdsApiService.saveDocuments(activeDocs as any, targetId);
      } catch (e) {
        console.warn("[TDS Form] saveDocuments auxiliary update warning:", e);
      }
    }
    return savedTdsId || targetId;
  }

  return await tdsApiService.saveFullTdsApplication(
    formData,
    activeDocs as any,
    custId,
    targetId,
  );
}
