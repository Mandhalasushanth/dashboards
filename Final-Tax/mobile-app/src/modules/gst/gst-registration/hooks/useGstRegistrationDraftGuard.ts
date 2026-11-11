import { useEffect, useRef, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useApplicationStore } from "@/store/applicationStore";
import { getActiveCustomerMobile } from "@/store/applicationStorage";
import { useUniversalDraftGuard } from "@/shared/hooks/useUniversalDraftGuard";
import { gstApi } from "@/modules/gst/services/gstApi";
import { mapDtoToGstBusinessFormData, formatUiDate } from "@/modules/gst/gst-registration/utils/gstRegistrationMapper";
import type { GstBusinessFormData } from "@/modules/gst/gst-registration/components/GstBusinessStep/GstBusinessStep";
import type { DocumentItem } from "@/modules/gst/gst-registration/components/GstUnifiedDocumentStep/GstUnifiedDocumentStep.types";
import {
  INITIAL_BUSINESS_DATA, isBackendGstId, hasAnyGstDataEntered, sanitizeRestoredDocuments,
} from "@/modules/gst/gst-registration/utils/gstDraftLifecycle";
import { INITIAL_DOCUMENTS } from "@/modules/gst/gst-registration/components/GstUnifiedDocumentStep/GstUnifiedDocumentStep";
import { logger } from "@/core/logging/logger";

interface Props {
  businessData: GstBusinessFormData;
  documents: DocumentItem[];
  screenIndex: number;
  createdGstId: string;
  documentId: string;
  setBusinessData: React.Dispatch<React.SetStateAction<GstBusinessFormData>>;
  setDocuments: React.Dispatch<React.SetStateAction<DocumentItem[]>>;
  setScreenIndex: React.Dispatch<React.SetStateAction<number>>;
  setCreatedGstId: React.Dispatch<React.SetStateAction<string>>;
  setDocumentId: React.Dispatch<React.SetStateAction<string>>;
  setIsEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  params: { gstId?: string; id?: string; appId?: string; edit?: string; isEdit?: string; step?: string };
}

export function useGstRegistrationDraftGuard({
  businessData, documents, screenIndex, createdGstId, documentId,
  setBusinessData, setDocuments, setScreenIndex, setCreatedGstId, setDocumentId, setIsEditMode,
  params,
}: Props) {
  const { gstDraft, saveGstDraft, clearGstDraft } = useApplicationStore();
  const hasRestoredDraftRef = useRef(false);

  useEffect(() => {
    if (hasRestoredDraftRef.current) return;
    hasRestoredDraftRef.current = true;
    try {
      const rawRouteGstId = params.gstId || params.id || params.appId;
      const routeGstId = isBackendGstId(rawRouteGstId) ? rawRouteGstId : undefined;
      if (params.edit === "true" || params.isEdit === "true") setIsEditMode(true);
      if (params.step) {
        const parsed = parseInt(params.step, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 3) setScreenIndex(parsed);
      }
      if (gstDraft) {
        if (gstDraft.businessData) {
          setBusinessData((prev) => ({
            ...prev, ...gstDraft.businessData,
            businessName: gstDraft.businessData.businessName || (gstDraft.businessData as Record<string, unknown>).registeredBusinessName as string || "",
            businessType: gstDraft.businessData.businessType || "",
            signatoryDob: formatUiDate(gstDraft.businessData.signatoryDob || prev.signatoryDob),
          }));
        }
        if (Array.isArray(gstDraft.documents) && gstDraft.documents.length > 0) {
          setDocuments(sanitizeRestoredDocuments(gstDraft.documents as DocumentItem[], INITIAL_DOCUMENTS));
        }
        if (typeof gstDraft.stepIndex === "number" && gstDraft.stepIndex < 3 && !params.step) setScreenIndex(gstDraft.stepIndex);
        const draftGstId = isBackendGstId(gstDraft.createdGstId) ? gstDraft.createdGstId
          : isBackendGstId((gstDraft.businessData as Record<string, unknown>)?.gstId as string) ? (gstDraft.businessData as Record<string, unknown>).gstId as string : undefined;
        if (draftGstId) setCreatedGstId(draftGstId);
        if (gstDraft.documentId) setDocumentId(gstDraft.documentId);
      } else {
        void (async () => {
          const clean = getActiveCustomerMobile();
          try {
            const raw = await AsyncStorage.getItem(`@finsolz_draft_${clean}_gst-registration`);
            if (!raw) return;
            const parsed = JSON.parse(raw) as { formData?: Partial<GstBusinessFormData>; documents?: DocumentItem[]; step?: number };
            if (parsed.formData) {
              setBusinessData((prev) => ({
                ...prev, ...parsed.formData,
                businessName: (parsed.formData as Record<string, unknown>).businessName as string || "",
                businessType: (parsed.formData as Record<string, unknown>).businessType as string || "",
                signatoryDob: formatUiDate(parsed.formData?.signatoryDob || prev.signatoryDob),
              }));
            }
            if (Array.isArray(parsed.documents) && parsed.documents.length > 0) {
              setDocuments(sanitizeRestoredDocuments(parsed.documents as DocumentItem[], INITIAL_DOCUMENTS));
            }
            if (typeof parsed.step === "number" && parsed.step < 3 && !params.step) {
              setScreenIndex(parsed.step);
            }
          } catch {}
        })();
      }
      if (routeGstId) {
        setCreatedGstId(routeGstId);
        setBusinessData((prev) => ({ ...prev, gstId: routeGstId }));
        gstApi.getBusiness(routeGstId)
          .then((dto) => {
            if (!dto) return;
            const mapped = mapDtoToGstBusinessFormData(dto);
            setBusinessData((p) => {
              const activeDob = typeof p.signatoryDob === "string" ? p.signatoryDob.trim() : "";
              const mappedDob = typeof mapped.signatoryDob === "string" ? mapped.signatoryDob.trim() : "";
              return {
                ...p,
                ...mapped,
                signatoryDob: activeDob ? activeDob : mappedDob,
                gstId: routeGstId,
              };
            });
          })
          .catch((e) => logger.warn("[useGstRegistrationDraftGuard] Could not fetch business details:", { error: e }));
      }
    } catch (err) { logger.warn("[useGstRegistrationDraftGuard] Failed to restore GST draft/params:", { error: err }); }
  }, [params.gstId, params.id, params.appId, params.edit, params.isEdit, params.step, gstDraft]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasAnyDataEntered = useCallback((): boolean => {
    return hasAnyGstDataEntered(businessData, documents, INITIAL_BUSINESS_DATA);
  }, [businessData, documents]);

  const syncDraft = useCallback(
    (stepOverride?: number, gstIdOverride?: string, docsOverride?: DocumentItem[]) => {
      try {
        const targetGstId = gstIdOverride ?? createdGstId;
        saveGstDraft({
          id: "draft-gst",
          stepIndex: stepOverride ?? screenIndex,
          personalData: {},
          businessData: {
            ...businessData,
            signatoryDob: formatUiDate(businessData.signatoryDob),
            ...(targetGstId ? { gstId: targetGstId } : {}),
          } as never,
          createdGstId: targetGstId,
          documents: (docsOverride ?? documents) as never,
          updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          ...(documentId ? { documentId } : {}),
        });
      } catch (err) { logger.warn("[useGstRegistrationDraftGuard] Failed to sync GST draft:", { error: err }); }
    },
    [businessData, createdGstId, documentId, documents, saveGstDraft, screenIndex],
  );

  const draftGuard = useUniversalDraftGuard({
    isDirty: hasAnyDataEntered,
    onSaveDraft: syncDraft,
    onDiscardDraft: clearGstDraft,
    isSubmitted: () => screenIndex >= 3,
  });

  return { syncDraft, draftGuard, hasAnyDataEntered, clearGstDraft };
}
