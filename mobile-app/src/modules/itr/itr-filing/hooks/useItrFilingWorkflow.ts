import { useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { ItrApiService } from "../services/ItrApiService";
import { registerForPushNotificationsAsync } from "@/utils/pushNotificationService";
import { useNotificationStore } from "@/store/notificationStore";
import type { ItrFilingFormData } from "../types/itrFiling.types";

interface UseItrFilingWorkflowProps {
  formData: ItrFilingFormData;
  setStep: (step: number) => void;
  setBackendIds: (ids: { itrId?: string; incomeId?: string; documentId?: string }) => void;
  createApplication: (...args: any[]) => string;
  markSubmitted: () => void;
  clearItrDraft: () => void | Promise<void>;
  resetForm?: () => void;
}

export function useItrFilingWorkflow({
  formData,
  setStep,
  setBackendIds,
  createApplication,
  markSubmitted,
  clearItrDraft,
  resetForm,
}: UseItrFilingWorkflowProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: POST (Create)
  const handleStep1Continue = async () => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      if (!formData.itrId) {
        const response = await ItrApiService.savePersonalInfo(formData);
        if (response?.itrId) setBackendIds({ itrId: response.itrId });
      } else {
        try {
          await ItrApiService.updatePersonalInfo(formData.itrId, formData);
        } catch {
          const response = await ItrApiService.savePersonalInfo(formData);
          if (response?.itrId) setBackendIds({ itrId: response.itrId });
        }
      }
      setStep(1);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to save personal information to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 1: PUT (Update & Continue from Review)
  const handleStep1Update = async () => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      if (formData.itrId) await ItrApiService.updatePersonalInfo(formData.itrId, formData);
      setStep(3);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to update personal information on the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: POST (Create)
  const handleStep2Continue = async () => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      if (formData.itrId && !formData.incomeId) {
        const response = await ItrApiService.saveSalaryIncome(formData.itrId, formData);
        if (response?.incomeId) setBackendIds({ incomeId: response.incomeId });
      } else if (formData.incomeId) {
        await ItrApiService.updateSalaryIncome(formData.incomeId, formData);
      }
      setStep(2);
    } catch {
      Alert.alert("Error", "Failed to save income information to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: PUT (Update & Continue from Review)
  const handleStep2Update = async () => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      if (formData.incomeId) await ItrApiService.updateSalaryIncome(formData.incomeId, formData);
      setStep(3);
    } catch {
      Alert.alert("Error", "Failed to update income information on the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 3: POST (Create)
  const handleStep3Continue = async () => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      if (formData.itrId && !formData.documentId) {
        const response = await ItrApiService.saveDocuments(formData.itrId, formData);
        if (response?.documentId) setBackendIds({ documentId: response.documentId });
      } else if (formData.documentId) {
        await ItrApiService.updateDocuments(formData.documentId, formData);
      }
      setStep(3);
    } catch {
      Alert.alert("Error", "Failed to save document information to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 3: PUT (Update & Continue from Review)
  const handleStep3Update = async () => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      if (formData.documentId) await ItrApiService.updateDocuments(formData.documentId, formData);
      setStep(3);
    } catch {
      Alert.alert("Error", "Failed to update documents on the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitApplication = async () => {
    if (isSubmitting) return;

    const missingRequired = formData.documents.filter(
      (d) => d.tier === "REQUIRED" && d.required && !d.fileUri && !d.isProfileVerified
    );
    if (missingRequired.length > 0) {
      const missingNames = missingRequired.map((d) => `• ${d.name}`).join("\n");
      Alert.alert(
        "Required Documents Missing",
        `Please upload the following required documents before submitting:\n\n${missingNames}`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      let itrId = formData.itrId;
      if (!itrId) {
        const regResponse = await ItrApiService.savePersonalInfo(formData);
        if (regResponse?.itrId) {
          itrId = regResponse.itrId;
          setBackendIds({ itrId });
        }
      }

      if (!itrId) {
        throw new Error("Unable to obtain ITR Filing ID. Please verify your details and try again.");
      }

      let pushToken: string | undefined = undefined;
      try {
        const token = await registerForPushNotificationsAsync();
        if (token) pushToken = token;
      } catch (tokenErr) {
        console.warn("Could not retrieve push token for ITR submission:", tokenErr);
      }

      try {
        await ItrApiService.submitFiling(itrId, pushToken);
      } catch (submitErr: any) {
        const msg = String(submitErr?.message || "").toLowerCase();
        if (msg.includes("not found") || msg.includes("404")) {
          const regResponse = await ItrApiService.savePersonalInfo(formData);
          if (regResponse?.itrId) {
            itrId = regResponse.itrId;
            setBackendIds({ itrId });
            try {
              await ItrApiService.submitFiling(itrId, pushToken);
            } catch (retryErr) {
              console.warn("Retry submit filing note:", retryErr);
            }
          }
        }
      }

      try {
        useNotificationStore.getState().addNotification(
          "ITR Filing Submitted",
          `Your ITR return application (${itrId}) has been successfully submitted for CA review.`,
          "itr"
        );
      } catch (notifErr) {
        console.warn("Could not add local notification:", notifErr);
      }

      const uploadedDocItems = formData.documents
        .filter((d) => (Boolean(d.fileUri) || d.isProfileVerified) && d.tier !== "NOT_REQUIRED")
        .map((d) => ({
          id: d.id,
          name: d.name,
          fileName: d.fileName || `${d.name.replace(/[^a-zA-Z0-9._-]/g, "_")}.pdf`,
          fileSize: d.fileSize || "1.2 MB",
          fileUri: d.fileUri || "verified://profile",
          status: "Uploaded" as const,
          uploadedAt: d.uploadedAt || new Date().toISOString(),
        }));

      const serviceTitle = `ITR Filing - ${formData.determinedForm.formTitle}`;

      const generatedAppId = createApplication(
        "itr-filing",
        serviceTitle,
        "ITR",
        {
          assessmentYear: formData.personalInfo.assessmentYear,
          filingType: formData.personalInfo.filingType,
          formType: formData.determinedForm.form,
          formTitle: formData.determinedForm.formTitle,
          pan: formData.personalInfo.pan,
          name: formData.personalInfo.name,
          mobile: formData.personalInfo.mobile,
          email: formData.personalInfo.email,
          residentialStatus: formData.personalInfo.residentialStatus,
          bankName: formData.bankDetails.bankName,
          accountNumber: formData.bankDetails.accountNumber,
          ifscCode: formData.bankDetails.ifscCode,
          accountType: formData.bankDetails.accountType,
          regime: formData.regime,
          grossTotalIncome: formData.calculation.grossTotalIncome,
          totalDeductions: formData.calculation.totalDeductions,
          taxableIncome: formData.calculation.taxableIncome,
          totalTaxLiability: formData.calculation.totalTaxLiability,
          totalTaxesPaid: formData.calculation.totalTaxesPaid,
          finalAmount: formData.calculation.finalAmount,
          finalType: formData.calculation.finalType,
          hasPreviousItr: formData.priorItrNotice.hasPreviousItr,
          previousAckNumber: formData.priorItrNotice.previousAckNumber,
          hasTaxNotice: formData.priorItrNotice.hasTaxNotice,
        },
        uploadedDocItems,
        999,
        "Pending"
      );

      const activeIncomeLabels = [
        formData.incomeSources.salary.enabled ? "Salary" : null,
        formData.incomeSources.business.enabled ? "Business" : null,
        formData.incomeSources.houseProperty.enabled ? "House Property" : null,
        formData.incomeSources.capitalGains.enabled ? "Capital Gains" : null,
        formData.incomeSources.otherSources.enabled ? "Other Income" : null,
      ].filter(Boolean) as string[];

      const incomeSourcesSummary = activeIncomeLabels.join(" • ") || "Declared Income";
      const verifiedOrUploadedCount = formData.documents.filter(
        (d) => (Boolean(d.fileUri) || d.isProfileVerified) && d.tier !== "NOT_REQUIRED"
      ).length;
      const totalDocsCount = formData.documents.filter((d) => d.tier !== "NOT_REQUIRED").length;
      const maskedBank = formData.bankDetails.bankName
        ? `${formData.bankDetails.bankName} •••• ${formData.bankDetails.accountNumber.slice(-4)}`
        : "Primary Refund Bank";
      const submittedAy = formData.personalInfo.assessmentYear;
      const submittedForm = formData.determinedForm.form;
      const submittedRegime = formData.regime === "new" ? "New Tax Regime" : "Old Tax Regime";

      markSubmitted();
      await clearItrDraft();
      resetForm?.();
      setIsSubmitting(false);

      router.replace({
        pathname: "/service/itr-success" as any,
        params: {
          applicationId: generatedAppId,
          customerName: formData.personalInfo.name || "",
          serviceTitle,
          assessmentYear: submittedAy,
          formType: submittedForm,
          incomeType: incomeSourcesSummary,
          regime: submittedRegime,
          uploadedDocsCount: String(verifiedOrUploadedCount),
          totalDocsCount: String(totalDocsCount),
          refundBank: maskedBank,
        },
      });
    } catch (err: any) {
      setIsSubmitting(false);
      Alert.alert("Submission Error", err?.message || "Could not submit application. Please try again.");
    }
  };

  return {
    isSubmitting,
    handleStep1Continue,
    handleStep1Update,
    handleStep2Continue,
    handleStep2Update,
    handleStep3Continue,
    handleStep3Update,
    handleSubmitApplication,
  };
}
