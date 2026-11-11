import type {
  GstRegistrationDraft,
  GstFilingDraft,
  ItrRegistrationDraft,
  TdsDraft,
  TaxNoticeDraft,
  GenericServiceDraft,
} from "./applicationDraftTypes";
import {
  getActiveCustomerMobile,
  persistDraftRecord,
  removeDraftRecord,
} from "./applicationStorage";

export interface DraftSliceState {
  gstDraft: GstRegistrationDraft | null;
  gstFilingDraft: GstFilingDraft | null;
  itrDraft: ItrRegistrationDraft | null;
  tdsDraft: TdsDraft | null;
  taxNoticeDraft: TaxNoticeDraft | null;
  previousYearDraft: GenericServiceDraft | null;
  revisedItrDraft: GenericServiceDraft | null;
  gstComplianceDraft: GenericServiceDraft | null;
  gstCancellationDraft: GenericServiceDraft | null;
  gstAmendmentDraft: GenericServiceDraft | null;
  gstCertificateDraft: GenericServiceDraft | null;
  companyRegistrationDraft: GenericServiceDraft | null;

  saveGstDraft: (draft: GstRegistrationDraft) => void;
  clearGstDraft: () => void;
  saveGstFilingDraft: (draft: GstFilingDraft) => void;
  clearGstFilingDraft: () => void;
  saveItrDraft: (draft: ItrRegistrationDraft) => void;
  clearItrDraft: () => void;
  saveTdsDraft: (draft: Partial<TdsDraft>) => void;
  clearTdsDraft: () => void;
  saveTaxNoticeDraft: (draft: Partial<TaxNoticeDraft>) => void;
  clearTaxNoticeDraft: () => void;
  savePreviousYearDraft: (draft: GenericServiceDraft) => void;
  clearPreviousYearDraft: () => void;
  saveRevisedItrDraft: (draft: GenericServiceDraft) => void;
  clearRevisedItrDraft: () => void;
  saveGstComplianceDraft: (draft: GenericServiceDraft) => void;
  clearGstComplianceDraft: () => void;
  saveGstCancellationDraft: (draft: GenericServiceDraft) => void;
  clearGstCancellationDraft: () => void;
  saveGstAmendmentDraft: (draft: GenericServiceDraft) => void;
  clearGstAmendmentDraft: () => void;
  saveGstCertificateDraft: (draft: GenericServiceDraft) => void;
  clearGstCertificateDraft: () => void;
  saveCompanyRegistrationDraft: (draft: GenericServiceDraft) => void;
  clearCompanyRegistrationDraft: () => void;
}

const timeStamp = (): string =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export const initialDraftState = {
  gstDraft: null,
  gstFilingDraft: null,
  itrDraft: null,
  tdsDraft: null,
  taxNoticeDraft: null,
  previousYearDraft: null,
  revisedItrDraft: null,
  gstComplianceDraft: null,
  gstCancellationDraft: null,
  gstAmendmentDraft: null,
  gstCertificateDraft: null,
  companyRegistrationDraft: null,
};

export const createDraftSlice = <T extends DraftSliceState>(
  set: (fn: (state: T) => Partial<T>) => void
): DraftSliceState => {
  const saveGeneric = (key: string, name: string, cat: string, draft: GenericServiceDraft) => {
    const clean = getActiveCustomerMobile();
    persistDraftRecord(clean, key, {
      serviceKey: key,
      serviceName: name,
      category: cat,
      step: draft.step ?? 0,
      formData: draft.formData || draft,
      documents: draft.documents || [],
      updatedAt: draft.updatedAt || new Date().toISOString().split("T")[0],
    });
  };

  const clearGeneric = (key: string) => {
    removeDraftRecord(getActiveCustomerMobile(), key);
  };

  return {
    ...initialDraftState,

    saveGstDraft: (draft) => {
      set(() => ({ gstDraft: draft } as Partial<T>));
      const clean = getActiveCustomerMobile();
      persistDraftRecord(clean, "gst-registration", {
        serviceKey: "gst-registration",
        serviceName: "GST Registration",
        category: "GST",
        step: draft.stepIndex,
        formData: draft.businessData,
        documents: draft.documents,
        updatedAt: draft.updatedAt || new Date().toISOString().split("T")[0],
      });
    },

    clearGstDraft: () => {
      set(() => ({ gstDraft: null } as Partial<T>));
      clearGeneric("gst-registration");
    },

    saveGstFilingDraft: (draft) => {
      set(() => ({ gstFilingDraft: draft } as Partial<T>));
      const clean = getActiveCustomerMobile();
      persistDraftRecord(clean, "gst-filing", {
        serviceKey: "gst-filing",
        serviceName: "GST Filing",
        category: "GST",
        step: draft.currentStep ?? draft.stepIndex,
        formData: draft.periodData,
        documents: draft.documents,
        updatedAt: draft.updatedAt || new Date().toISOString().split("T")[0],
      });
    },

    clearGstFilingDraft: () => {
      set(() => ({ gstFilingDraft: null } as Partial<T>));
      clearGeneric("gst-filing");
    },

    saveItrDraft: (draft) => {
      set(() => ({ itrDraft: draft } as Partial<T>));
      const clean = getActiveCustomerMobile();
      persistDraftRecord(clean, "itr-filing", {
        serviceKey: "itr-filing",
        serviceName: "ITR Filing",
        category: "ITR",
        step: draft.stepIndex,
        formData: draft.filingData || draft,
        documents: draft.documents,
        updatedAt: draft.updatedAt || new Date().toISOString().split("T")[0],
      });
    },

    clearItrDraft: () => {
      set(() => ({ itrDraft: null } as Partial<T>));
      clearGeneric("itr-filing");
    },

    saveTdsDraft: (draft) =>
      set((state) => {
        const current = state.tdsDraft;
        const updatedTds: TdsDraft = current
          ? {
              ...current,
              ...draft,
              formData: draft.formData
                ? { ...(current.formData || {}), ...draft.formData }
                : current.formData,
              documents: draft.documents ?? current.documents,
            }
          : {
              formData: draft.formData || {},
              documents: draft.documents || [],
              step: draft.step,
              updatedAt: draft.updatedAt,
            };
        const clean = getActiveCustomerMobile();
        persistDraftRecord(clean, "tds-refund", {
          serviceKey: "tds-refund",
          serviceName: "TDS Refund",
          category: "ITR",
          step: updatedTds.step,
          formData: updatedTds.formData,
          documents: updatedTds.documents,
          updatedAt: updatedTds.updatedAt || new Date().toISOString().split("T")[0],
        });
        return { tdsDraft: updatedTds } as Partial<T>;
      }),

    clearTdsDraft: () => {
      set(() => ({ tdsDraft: null } as Partial<T>));
      clearGeneric("tds-refund");
    },

    saveTaxNoticeDraft: (draft) =>
      set((state) => {
        const current = state.taxNoticeDraft;
        const updatedNotice: TaxNoticeDraft = current
          ? {
              ...current,
              ...draft,
              formData: draft.formData
                ? { ...(current.formData || {}), ...draft.formData }
                : current.formData,
              documents: draft.documents ?? current.documents,
            }
          : {
              formData: draft.formData || {},
              documents: draft.documents || [],
              step: draft.step || "DETAILS",
              remarks: draft.remarks || "",
              updatedAt: draft.updatedAt || timeStamp(),
            };
        const clean = getActiveCustomerMobile();
        persistDraftRecord(clean, "tax-notice", {
          serviceKey: "tax-notice",
          serviceName: "Tax Notice Assistance",
          category: "ITR",
          step: updatedNotice.step,
          formData: updatedNotice.formData,
          documents: updatedNotice.documents,
          updatedAt: updatedNotice.updatedAt || new Date().toISOString().split("T")[0],
        });
        return { taxNoticeDraft: updatedNotice } as Partial<T>;
      }),

    clearTaxNoticeDraft: () => {
      set(() => ({ taxNoticeDraft: null } as Partial<T>));
      clearGeneric("tax-notice");
    },

    savePreviousYearDraft: (draft) => {
      set(() => ({ previousYearDraft: draft } as Partial<T>));
      saveGeneric("previous-year-itr", "Previous Year ITR", "ITR", draft);
    },

    clearPreviousYearDraft: () => {
      set(() => ({ previousYearDraft: null } as Partial<T>));
      clearGeneric("previous-year-itr");
    },

    saveRevisedItrDraft: (draft) => {
      set(() => ({ revisedItrDraft: draft } as Partial<T>));
      saveGeneric("revised-itr", "Revised ITR", "ITR", draft);
    },

    clearRevisedItrDraft: () => {
      set(() => ({ revisedItrDraft: null } as Partial<T>));
      clearGeneric("revised-itr");
    },

    saveGstComplianceDraft: (draft) => {
      set(() => ({ gstComplianceDraft: draft } as Partial<T>));
      saveGeneric("gst-compliance", "GST Compliance", "GST", draft);
    },

    clearGstComplianceDraft: () => {
      set(() => ({ gstComplianceDraft: null } as Partial<T>));
      clearGeneric("gst-compliance");
    },

    saveGstCancellationDraft: (draft) => {
      set(() => ({ gstCancellationDraft: draft } as Partial<T>));
      saveGeneric("gst-cancellation", "GST Cancellation", "GST", draft);
    },

    clearGstCancellationDraft: () => {
      set(() => ({ gstCancellationDraft: null } as Partial<T>));
      clearGeneric("gst-cancellation");
    },

    saveGstAmendmentDraft: (draft) => {
      set(() => ({ gstAmendmentDraft: draft } as Partial<T>));
      saveGeneric("gst-amendment", "GST Amendment", "GST", draft);
    },

    clearGstAmendmentDraft: () => {
      set(() => ({ gstAmendmentDraft: null } as Partial<T>));
      clearGeneric("gst-amendment");
    },

    saveGstCertificateDraft: (draft) => {
      set(() => ({ gstCertificateDraft: draft } as Partial<T>));
      saveGeneric("gst-certificate", "GST Certificate", "GST", draft);
    },

    clearGstCertificateDraft: () => {
      set(() => ({ gstCertificateDraft: null } as Partial<T>));
      clearGeneric("gst-certificate");
    },

    saveCompanyRegistrationDraft: (draft) => {
      set(() => ({ companyRegistrationDraft: draft } as Partial<T>));
      saveGeneric("company-registration", "Company Incorporation", "BUSINESS", draft);
    },

    clearCompanyRegistrationDraft: () => {
      set(() => ({ companyRegistrationDraft: null } as Partial<T>));
      clearGeneric("company-registration");
    },
  };
};
