import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUniversalDraftGuard } from "@/shared/hooks/useUniversalDraftGuard";
import { useApplicationStore } from "@/store/applicationStore";
import { getActiveCustomerMobile } from "@/store/applicationStorage";
import { useCompanyRegistrationStore } from "../store/companyRegistrationSlice";
import type { CompanyRegistrationDraft } from "../types/registration.types";

export function useCompanyRegistrationDraftGuard() {
  const draft = useCompanyRegistrationStore((s) => s.draft);
  const setDraft = useCompanyRegistrationStore((s) => s.setDraft);
  const clearEditingStep = useCompanyRegistrationStore((s) => s.clearEditingStep);
  const resetRegistration = useCompanyRegistrationStore((s) => s.resetRegistration);
  const saveCompanyRegistrationDraft = useApplicationStore((s) => s.saveCompanyRegistrationDraft);
  const clearCompanyRegistrationDraft = useApplicationStore((s) => s.clearCompanyRegistrationDraft);

  useEffect(() => {
    const restoreDraft = async () => {
      const current = useCompanyRegistrationStore.getState().draft;
      if (current.company.companyType || current.currentStep > 0) return;
      const zustandDraft = useApplicationStore.getState().companyRegistrationDraft;
      if (zustandDraft?.formData) {
        const fd = zustandDraft.formData as unknown as CompanyRegistrationDraft;
        if ((fd.currentStep ?? 0) < 7 && fd.status !== "Submitted") {
          setDraft(fd);
          return;
        }
      }
      const clean = getActiveCustomerMobile();
      try {
        const raw = await AsyncStorage.getItem(`@finsolz_draft_${clean}_company-registration`);
        if (raw) {
          const parsed = JSON.parse(raw) as { formData?: Record<string, unknown> };
          if (parsed.formData) {
            const fd = parsed.formData as unknown as CompanyRegistrationDraft;
            if ((fd.currentStep ?? 0) < 7 && fd.status !== "Submitted") {
              setDraft(fd);
            }
          }
        }
      } catch {}
    };
    restoreDraft();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const draftGuard = useUniversalDraftGuard({
    isDirty: () => draft.currentStep > 0 || !!draft.company.companyType,
    onSaveDraft: () => {
      clearEditingStep();
      const currentDraft = useCompanyRegistrationStore.getState().draft;
      saveCompanyRegistrationDraft({
        step: currentDraft.currentStep,
        formData: currentDraft as unknown as Record<string, unknown>,
        updatedAt: new Date().toISOString(),
      });
    },
    onDiscardDraft: resetRegistration,
    isSubmitted: () => draft.status === "Submitted" || draft.currentStep === 7,
    discardDestination: "/(main)/home",
  });

  return { ...draftGuard, clearCompanyRegistrationDraft };
}
