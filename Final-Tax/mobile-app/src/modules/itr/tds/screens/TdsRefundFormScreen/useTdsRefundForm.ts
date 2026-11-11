import { useState, useEffect, useRef } from "react";
import { Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuthStore } from "@/modules/authentication/store/authStore";
import { authStorage } from "@/modules/authentication/services/authStorage";
import { useTdsProgressStore } from "../../store/tdsProgressStore";
import {
  TdsCustomerIncomeFormData,
  PersonalDetails,
} from "../../types/customerIncome.types";
import { cleanIfsc } from "../../utils/tdsValidation";
import {
  validateCustomerIncomeForm,
  CustomerFormErrors,
} from "../../validation/tdsCustomerSchema";
import { tdsDraftService, INITIAL_TDS_FORM_DATA, getTdsCustId } from "../../services/tdsDraftService";
import { tdsApiService } from "../../services/tdsApiService";
import { useUniversalDraftGuard } from "@/shared/hooks/useUniversalDraftGuard";
import { useTdsProfileSync } from "./useTdsProfileSync";
import { describeSaveError } from "./tdsFormHelpers";
import {
  syncUpdatedCustomerProfile,
  mergeNonEmptyFields,
  validateSection,
  applyBlurValidation,
  loadDraftDocuments,
  syncApplicationBackend,
} from "./useTdsRefundForm.helpers";
import { UpdateBankField } from "./TdsRefundFormSections.types";

export const useTdsRefundForm = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<TdsCustomerIncomeFormData>(INITIAL_TDS_FORM_DATA);
  const [errors, setErrors] = useState<CustomerFormErrors>({});
  const {
    isEditing: isEditingParam,
    id: paramId,
    applicationId: paramAppId,
    section: paramSection,
  } = useLocalSearchParams<{
    isEditing?: string;
    id?: string;
    applicationId?: string;
    section?: string;
  }>();
  // BUG_B23_007: Derive isEditing directly from route params so it's always in sync
  const isEditing = isEditingParam === "true";

  const { isProfileLoading, profileFetchError, fetchAndPopulateProfile } = useTdsProfileSync(setFormData);

  const initialSnapshotRef = useRef<string | null>(null);
  const [hasUserEdited, setHasUserEdited] = useState(false);
  const isSavingRef = useRef(false);
  const [isSaving, setIsSaving] = useState(false);

  const documentsRef = useRef<any[]>([]);

  const draftGuard = useUniversalDraftGuard({
    saveDestination: "/service/itr",
    discardDestination: "/service/itr",
    isDirty: () => {
      // hasUserEdited must be checked first — before the snapshot null-guard.
      // If the user edits before the async loadData() sets initialSnapshotRef,
      // returning false here would silently swallow the guard.
      if (hasUserEdited) return true;
      if (!initialSnapshotRef.current) return false;
      const currentSnapshot = JSON.stringify({ bank: formData.bank, income: formData.income });
      return currentSnapshot !== initialSnapshotRef.current;
    },
    onSaveDraft: async () => {
      await tdsDraftService.saveFormDraft(formData);
      await tdsDraftService.saveDocumentsDraft(documentsRef.current);
    },
    onDiscardDraft: async () => {
      await tdsDraftService.clearDraft();
    },
    isSubmitted: () => useTdsProgressStore.getState().isSubmitted,
  });

  useEffect(() => {
    async function loadData() {
      const freshPersonal = await fetchAndPopulateProfile();

      const currentMobile = useAuthStore.getState().customer?.mobile ||
        authStorage.getSession().activeMobile ||
        useAuthStore.getState().mobileNumber ||
        freshPersonal?.mobileNumber;

      const custId = getTdsCustId(freshPersonal?.mobileNumber);

      let draftBank: any = null;
      let draftIncome: any = null;
      let draftBusiness: any = null;
      let draftPersonal: any = null;
      const savedDraft = await tdsDraftService.getFormDraft();
      
      if (savedDraft) {
        const isSameCustomer = !savedDraft.personal?.mobileNumber ||
          !currentMobile ||
          savedDraft.personal.mobileNumber.replace(/\D/g, "") === currentMobile.replace(/\D/g, "");

        if (isSameCustomer) {
          draftBank = savedDraft.bank;
          draftIncome = savedDraft.income;
          draftBusiness = savedDraft.business;
          draftPersonal = savedDraft.personal;
        } else {
          await tdsDraftService.clearDraft();
          useTdsProgressStore.getState().reset();
        }
      } else if (!isEditingParam) {
        useTdsProgressStore.getState().reset();
      }

      // Check application store draft as secondary fallback
      let storeDraftForm: any = null;
      try {
        const appStore = (await import("@/store/applicationStore")).useApplicationStore.getState();
        if (appStore.tdsDraft?.formData) {
          storeDraftForm = appStore.tdsDraft.formData;
        }
      } catch {}

      let backendApp: any = null;
      let dbDetails: any = null;
      const routeAppId = (paramId || paramAppId) as string | undefined;
      const existingAppId = routeAppId || (await tdsDraftService.getApplicationId());
      if (existingAppId) {
        await tdsDraftService.saveApplicationId(existingAppId);
      }

      try {
        if (existingAppId || custId) {
          backendApp = await tdsApiService.fetchFullTdsApplication(custId || "", existingAppId || undefined);
        }
        if (backendApp?.tdsRefundId) {
          await tdsDraftService.saveApplicationId(backendApp.tdsRefundId);
        }
      } catch (err) {
        console.warn("[TDS Screen] Backend fetch warning:", err);
      }

      // Direct fallback to getTdsRefund if backendApp didn't provide business data
      if ((!backendApp || !backendApp.business?.legalName) && existingAppId) {
        try {
          dbDetails = await tdsApiService.getTdsRefund(existingAppId);
        } catch {}
      }
      if (!dbDetails && custId && (!backendApp || !backendApp.business?.legalName)) {
        try {
          dbDetails = await tdsApiService.getBankAccountByCustId(custId);
        } catch {}
      }

      const backendBusinessFromDb = dbDetails ? {
        legalName: dbDetails.legalBusinessName || "",
        pan: dbDetails.businessPan || "",
        aadhaar: dbDetails.aadhaarNumber || "",
        mobileNumber: dbDetails.mobileNumber || "",
      } : null;

      const backendBankFromDb = dbDetails ? {
        accountHolderName: dbDetails.accountHolderName || "",
        accountNumber: dbDetails.accountNumber || "",
        confirmAccountNumber: dbDetails.confirmAccountNumber || dbDetails.accountNumber || "",
        ifscCode: dbDetails.ifscCode || "",
        bankName: dbDetails.bankName || "",
        branchName: dbDetails.branchName || "",
        accountType: (dbDetails.accountType?.toLowerCase() === "current" ? "current" : "savings") as any,
        isIfscVerified: Boolean(dbDetails.bankName),
      } : null;

      setFormData((prev) => {
        const mergedBusiness = mergeNonEmptyFields(
          prev.business,
          backendApp?.business,
          backendBusinessFromDb,
          storeDraftForm?.business,
          draftBusiness
        );

        const mergedBank = mergeNonEmptyFields(
          prev.bank,
          backendApp?.bank,
          backendBankFromDb,
          storeDraftForm?.bank,
          draftBank
        );

        const mergedIncome = mergeNonEmptyFields(
          prev.income,
          backendApp?.income,
          storeDraftForm?.income,
          draftIncome
        );

        const mergedPersonal = mergeNonEmptyFields(
          prev.personal,
          freshPersonal,
          storeDraftForm?.personal,
          draftPersonal
        );
        
        // BUG_B23_001: snapshot keys must match isDirty keys ({bank, income}) — business excluded
        initialSnapshotRef.current = JSON.stringify({ bank: mergedBank, income: mergedIncome });
        
        return {
          ...prev,
          bank: mergedBank,
          income: mergedIncome,
          business: mergedBusiness,
          personal: mergedPersonal,
        };
      });
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveProfile = async (updated: PersonalDetails) => {
    const cleanMob = updated.mobileNumber ? updated.mobileNumber.replace(/\D/g, "").slice(-10) : "";
    const normalizedPersonal: PersonalDetails = {
      ...updated,
      mobileNumber: cleanMob || updated.mobileNumber,
    };

    const nextFormState: TdsCustomerIncomeFormData = {
      ...formData,
      personal: normalizedPersonal,
      bank: {
        ...formData.bank,
        accountHolderName: formData.bank.accountHolderName || normalizedPersonal.fullName,
      },
    };

    setFormData(nextFormState);
    setErrors((prev) => {
      const next = { ...prev };
      let hasPersonalErrors = false;
      Object.keys(next).forEach((k) => {
        if (k.startsWith("personal.")) {
          delete next[k];
          hasPersonalErrors = true;
        }
      });
      return hasPersonalErrors ? next : prev;
    });

    await syncUpdatedCustomerProfile(normalizedPersonal, cleanMob);
    await tdsDraftService.saveFormDraft(nextFormState);
  };

  const updateBank: UpdateBankField = (field, value) => {
    setHasUserEdited(true);
    setFormData((prev) => ({
      ...prev,
      bank: { ...prev.bank, [field]: value },
    }));

    const errorKey = `bank.${field}` as keyof CustomerFormErrors;
    // BUG_B23_006: when accountNumber changes, the confirmAccountNumber mismatch error is stale — clear it too
    const shouldClearConfirm = field === "accountNumber" && Boolean(errors["bank.confirmAccountNumber"]);
    if (errors[errorKey] || shouldClearConfirm) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[errorKey];
        if (field === "accountNumber") {
          delete next["bank.confirmAccountNumber"];
        }
        return next;
      });
    }
  };


  const handleIfscChange = (val: string) => {
    updateBank("ifscCode", cleanIfsc(val));
  };

  const updateBusiness = (field: string, value: string) => {
    setHasUserEdited(true);
    setFormData((prev) => ({
      ...prev,
      business: { ...prev.business, [field]: value },
    }));

    const errorKey = `business.${field}` as keyof CustomerFormErrors;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[errorKey];
        return next;
      });
    }
  };

  const handleBlurField = (fieldPath: string) => {
    setErrors((prev) => applyBlurValidation(prev, fieldPath, formData));
  };

  // BUG_B23_002: documents state moved before handleContinue to fix forward reference
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    async function loadDocs() {
      const mergedDocs = await loadDraftDocuments();
      setDocuments(mergedDocs);
      documentsRef.current = mergedDocs;
    }
    loadDocs();
  }, []);

  const handleUploadSuccess = (id: string, payload: any) => {
    setDocuments((prev) => {
      const next = prev.map((doc) => doc.id === id ? { ...doc, status: "uploaded", fileUri: payload.uri, fileName: payload.name } : doc);
      documentsRef.current = next;
      return next;
    });
  };
  const handleUploadError = (id: string, errorMessage: string) => {
    setDocuments((prev) => {
      const next = prev.map((doc) => doc.id === id ? { ...doc, status: "not_uploaded", errorMessage } : doc);
      documentsRef.current = next;
      return next;
    });
  };
  const handleRemove = (id: string) => {
    setDocuments((prev) => {
      const next = prev.map((doc) => doc.id === id ? { ...doc, status: "not_uploaded", fileUri: undefined } : doc);
      documentsRef.current = next;
      return next;
    });
  };

  const handleContinue = async () => {
    const activeDocs =
      documentsRef.current && documentsRef.current.length > 0
        ? documentsRef.current
        : documents;

    // Validate specific section in edit mode, or full form otherwise
    const validation = isEditing && paramSection
      ? validateSection(paramSection, formData)
      : validateCustomerIncomeForm(formData);

    const hasMissingMandatoryDocs = !isEditing && activeDocs.some((doc) => doc.isMandatory && doc.status !== 'uploaded');

    if (!validation.isValid || hasMissingMandatoryDocs) {
      if (!validation.isValid) {
        setErrors(validation.errors);
        Alert.alert(
          "Incomplete Information",
          "Please complete all required fields correctly to proceed."
        );
      } else {
        Alert.alert(
          "Incomplete Documents",
          "Please upload all mandatory documents (PAN and Aadhaar) to proceed."
        );
      }
      return;
    }
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    setIsSaving(true);

    try {
      // Persist to local draft storage and application store
      await tdsDraftService.saveFormDraft(formData, isEditing ? "REVIEW" : "FORM");
      await tdsDraftService.saveDocumentsDraft(activeDocs);
      try {
        const appStore = (await import("@/store/applicationStore")).useApplicationStore.getState();
        appStore.saveTdsDraft?.({
          formData,
          documents: activeDocs as any,
          step: isEditing ? "ESTIMATE" : "FORM",
          updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        });
      } catch (storeErr) {
        console.warn("[TDS Form] appStore.saveTdsDraft warning:", storeErr);
      }

      const custId = getTdsCustId(formData.personal.mobileNumber);
      const draftAppId = await tdsDraftService.getApplicationId();
      let targetId = ((paramId || paramAppId || draftAppId) as string | undefined)?.trim();

      // Fallback: If editing and no targetId found, attempt lookup by custId
      if (!targetId && custId) {
        try {
          const existingDb = await tdsApiService.getBankAccountByCustId(custId);
          if (existingDb?.id) {
            targetId = existingDb.id;
            await tdsDraftService.saveApplicationId(targetId);
          }
        } catch (findErr) {
          console.warn("[TDS Form] Cust ID lookup fallback warning:", findErr);
        }
      }

      console.log(`🚀 [TDS Form] handleContinue -> isEditing: ${isEditing}, targetId: ${targetId}`);

      const savedTdsId = await syncApplicationBackend(
        isEditing,
        targetId,
        custId,
        formData,
        activeDocs,
      );
      await tdsDraftService.saveApplicationId(savedTdsId || targetId || "");
    } catch (err) {
      console.error("[TDS Screen] Backend update/save failed:", err);
      Alert.alert("Unable to Save Application", describeSaveError(err));
      return;
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
    draftGuard.markSubmitted();
    if (useTdsProgressStore.getState().maxStepReached < 3) {
      useTdsProgressStore.getState().setMaxStepReached(3);
    }
    if (isEditing) {
      router.back();
    } else {
      router.push("/service/tds-estimate" as any);
    }
  };

  // Explicit back handler used by the custom header back button.
  // Checks dirty state directly so the draft modal fires even if
  // usePreventRemove hasn't yet had a chance to react to the latest render.
  const handleBack = () => {
    const dirty =
      hasUserEdited ||
      (initialSnapshotRef.current !== null &&
        JSON.stringify({ bank: formData.bank, income: formData.income }) !==
          initialSnapshotRef.current);
    if (dirty) {
      draftGuard.openDraftModal();
    } else {
      router.back();
    }
  };

  return {
    formData,
    errors,
    isProfileLoading,
    isEditing,
    profileFetchError,
    fetchAndPopulateProfile,
    handleSaveProfile,
    updateBusiness,
    updateBank,
    handleIfscChange,
    handleBlurField,
    handleContinue,
    handleBack,
    isSaving,
    draftGuard,
    documents,
    handleUploadSuccess,
    handleUploadError,
    handleRemove,
  };
};
