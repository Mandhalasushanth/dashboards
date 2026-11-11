/**
 * Hook: useGstFilingRestore
 * Encapsulates one-time hydration of GST Filing state from store drafts,
 * existing application records, and URL search parameters.
 */

import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useApplicationStore } from "@/store/applicationStore";
import { getActiveCustomerMobile } from "@/store/applicationStorage";
import { FilingDocItem } from "@/modules/gst/gst-filing/config/gstFilingDocumentsConfig";
import { GstFilingPeriodData } from "@/modules/gst/gst-filing/components/GstFilingPeriodStep/GstFilingPeriodStep";
import { syncPreviousAppDocuments } from "@/modules/gst/gst-filing/hooks/gstFilingHelpers";

interface UseGstFilingRestoreProps {
  params: {
    appId?: string;
    step?: string;
    filingId?: string;
    id?: string;
  };
  setFilingId: (id: string | null | ((prev: string | null) => string | null)) => void;
  setCreatedAppId: (id: string) => void;
  setCurrentStep: (step: number) => void;
  setPeriodData: React.Dispatch<React.SetStateAction<GstFilingPeriodData>>;
  setDocuments: React.Dispatch<React.SetStateAction<FilingDocItem[]>>;
}

export function useGstFilingRestore({
  params,
  setFilingId,
  setCreatedAppId,
  setCurrentStep,
  setPeriodData,
  setDocuments,
}: UseGstFilingRestoreProps) {
  const gstFilingDraft = useApplicationStore((state) => state.gstFilingDraft);

  useEffect(() => {
    const restoreTimer = setTimeout(() => {
      const routeFilingId =
        params.filingId ||
        params.id ||
        (params.appId?.startsWith("FIL") ? params.appId : undefined);
      if (routeFilingId) {
        setFilingId(routeFilingId);
      }

      if (params.appId) {
        const existingApp = useApplicationStore
          .getState()
          .applications.find((a) => a.id === params.appId);
        if (existingApp) {
          setCreatedAppId(existingApp.id);
          const fData = (existingApp.formData || {}) as Record<string, any>;
          if (fData.filingId || fData.gstfilingId || existingApp.id.startsWith("FIL")) {
            setFilingId(fData.filingId || fData.gstfilingId || existingApp.id);
          }
          setPeriodData((prev) => ({
            ...prev,
            gstin: fData.gstin || prev.gstin,
            businessName:
              fData.businessName ||
              fData.tradeName ||
              fData.applicantName ||
              prev.businessName,
            tradeName: fData.tradeName || fData.businessName || prev.tradeName,
            taxpayerScheme: fData.taxpayerScheme || prev.taxpayerScheme,
            filingNature: fData.filingNature || prev.filingNature,
            financialYear: fData.financialYear || prev.financialYear,
            filingPeriod:
              fData.filingPeriod || fData.filingMonth || prev.filingPeriod,
            filingMonth:
              fData.filingMonth || fData.filingPeriod || prev.filingMonth,
            filingType: fData.filingType || prev.filingType,
            filingFrequency: fData.filingFrequency || prev.periodType,
            periodType: fData.filingFrequency || prev.periodType,
            calculationMethod:
              fData.calculationMethod ||
              (fData.taxablePurchases || fData.taxableSales || fData.turnover || fData.eligibleItc
                ? "manual_estimates"
                : prev.calculationMethod),
            taxableSales: fData.taxableSales || fData.turnover || prev.taxableSales,
            turnover: fData.turnover || fData.taxableSales || prev.turnover,
            taxablePurchases: fData.taxablePurchases || prev.taxablePurchases,
            eligibleItc: fData.eligibleItc || prev.eligibleItc,
          }));

          if (
            Array.isArray(existingApp.documents) &&
            existingApp.documents.length > 0
          ) {
            setDocuments((prevDocs) =>
              syncPreviousAppDocuments(prevDocs, existingApp.documents as any[]),
            );
          }

          if (params.step) {
            const stepNum = parseInt(params.step, 10);
            if (!isNaN(stepNum)) setCurrentStep(stepNum);
          } else {
            setCurrentStep(2);
          }
          return;
        }
      }

      if (gstFilingDraft) {
        if (gstFilingDraft.createdFilingId) {
          setFilingId((prev) => prev || gstFilingDraft.createdFilingId || null);
        }
        if (gstFilingDraft.periodData) {
          setPeriodData((prev) => ({ ...prev, ...gstFilingDraft.periodData }));
        }
        if (gstFilingDraft.documents && gstFilingDraft.documents.length > 0) {
          setDocuments(gstFilingDraft.documents as FilingDocItem[]);
        }
        if (
          typeof gstFilingDraft.stepIndex === "number" &&
          gstFilingDraft.stepIndex < 4 &&
          !params.step
        ) {
          setCurrentStep(gstFilingDraft.stepIndex);
        }
      } else {
        void (async () => {
          const clean = getActiveCustomerMobile();
          try {
            const raw = await AsyncStorage.getItem(`@finsolz_draft_${clean}_gst-filing`);
            if (!raw) return;
            const parsed = JSON.parse(raw) as { formData?: Partial<GstFilingPeriodData>; documents?: FilingDocItem[]; step?: number };
            if (parsed.formData) {
              setPeriodData((prev) => ({ ...prev, ...parsed.formData }));
            }
            if (Array.isArray(parsed.documents) && parsed.documents.length > 0) {
              setDocuments(parsed.documents as FilingDocItem[]);
            }
            if (typeof parsed.step === "number" && parsed.step < 4 && !params.step) {
              setCurrentStep(parsed.step);
            }
          } catch {}
        })();
      }
    }, 0);

    return () => clearTimeout(restoreTimer);
  }, [gstFilingDraft, params.appId, params.filingId, params.id, params.step, setCreatedAppId, setCurrentStep, setDocuments, setFilingId, setPeriodData]);
}
