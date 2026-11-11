import {
  ItrFilingFormData,
  ItrPersonalInfo,
  ItrBankDetails,
  ItrSelectableBank,
  ItrPriorFilingAndNotice,
  IncomeSourcesState,
  ItrStructuredDeductions,
  TaxesPaidDetails,
  GstReconciliationSummary,
  ItrDocumentItem,
} from "../itr-filing/types/itrFiling.types";
import { calculateItrTax } from "../itr-filing/engine/itrTaxCalculator";
import { determineApplicableItrForm } from "../itr-filing/engine/itrFormEngine";
import { generateDynamicDocumentChecklist } from "../itr-filing/engine/itrDocumentEngine";

export function deepMergeItrFormData(
  initial: ItrFilingFormData,
  draft?: Partial<ItrFilingFormData> | null
): ItrFilingFormData {
  if (!draft) return initial;

  const mergedPersonalInfo: ItrPersonalInfo = {
    ...initial.personalInfo,
    ...(draft.personalInfo || {}),
  };

  const mergedBankDetails: ItrBankDetails = {
    ...initial.bankDetails,
    ...(draft.bankDetails || {}),
  };

  const mergedBankAccountsList: ItrSelectableBank[] =
    Array.isArray(draft.bankAccountsList) && draft.bankAccountsList.length > 0
      ? draft.bankAccountsList
      : initial.bankAccountsList;

  const mergedPriorItrNotice: ItrPriorFilingAndNotice = {
    ...initial.priorItrNotice,
    ...(draft.priorItrNotice || {}),
  };

  const draftSources = draft.incomeSources;
  const mergedIncomeSources: IncomeSourcesState = {
    salary: { ...initial.incomeSources.salary, ...(draftSources?.salary || {}) },
    houseProperty: { ...initial.incomeSources.houseProperty, ...(draftSources?.houseProperty || {}) },
    business: { ...initial.incomeSources.business, ...(draftSources?.business || {}) },
    capitalGains: { ...initial.incomeSources.capitalGains, ...(draftSources?.capitalGains || {}) },
    otherSources: { ...initial.incomeSources.otherSources, ...(draftSources?.otherSources || {}) },
  };

  const draftDeductions = draft.deductions;
  const mergedDeductions: ItrStructuredDeductions = {
    sec80c: { ...initial.deductions.sec80c, ...(draftDeductions?.sec80c || {}) },
    sec80d: { ...initial.deductions.sec80d, ...(draftDeductions?.sec80d || {}) },
    sec24b: draftDeductions?.sec24b ?? initial.deductions.sec24b,
    sec80e: draftDeductions?.sec80e ?? initial.deductions.sec80e,
    otherDeductionsList: Array.isArray(draftDeductions?.otherDeductionsList)
      ? draftDeductions.otherDeductionsList
      : initial.deductions.otherDeductionsList,
  };

  const mergedTaxesPaid: TaxesPaidDetails = {
    ...initial.taxesPaid,
    ...(draft.taxesPaid || {}),
  };

  const draftGst = draft.gstReconciliation;
  const mergedGstReconciliation: GstReconciliationSummary | undefined =
    draftGst || initial.gstReconciliation
      ? {
          ...(initial.gstReconciliation || ({} as GstReconciliationSummary)),
          ...(draftGst || {}),
        }
      : undefined;

  const mergedDocuments: ItrDocumentItem[] =
    Array.isArray(draft.documents) && draft.documents.length > 0
      ? draft.documents
      : initial.documents;

  return {
    ...initial,
    itrId: draft.itrId ?? initial.itrId,
    incomeId: draft.incomeId ?? initial.incomeId,
    documentId: draft.documentId ?? initial.documentId,
    personalInfo: mergedPersonalInfo,
    bankDetails: mergedBankDetails,
    bankAccountsList: mergedBankAccountsList,
    priorItrNotice: mergedPriorItrNotice,
    incomeSources: mergedIncomeSources,
    deductions: mergedDeductions,
    taxesPaid: mergedTaxesPaid,
    documents: mergedDocuments,
    gstReconciliation: mergedGstReconciliation,
    declarationAccepted: draft.declarationAccepted ?? initial.declarationAccepted,
    category: draft.category !== undefined ? draft.category : initial.category,
    accountType: draft.accountType ?? initial.accountType,
    regime: draft.regime ?? initial.regime,
    calculation: initial.calculation,
    determinedForm: initial.determinedForm,
  };
}

export const recalculateItrForm = (formData: ItrFilingFormData): ItrFilingFormData => {
  const ay = formData.personalInfo.assessmentYear;
  const calculation = calculateItrTax(
    formData.incomeSources,
    formData.deductions,
    formData.taxesPaid,
    formData.regime,
    ay
  );
  const determinedForm = determineApplicableItrForm(
    formData.incomeSources,
    formData.personalInfo.residentialStatus,
    calculation.grossTotalIncome,
    ay
  );
  const documents = generateDynamicDocumentChecklist(
    formData.incomeSources,
    formData.priorItrNotice,
    formData.deductions,
    formData.taxesPaid,
    formData.regime,
    formData.personalInfo,
    formData.documents
  );
  return { ...formData, calculation, determinedForm, documents };
};

export const buildApplicationDraftPayload = (
  draftId: string,
  currentStep: number,
  formData: ItrFilingFormData,
  updatedAt: string
) => ({
  id: draftId,
  stepIndex: currentStep,
  category: formData.category || "salaried",
  categoryTitle: formData.determinedForm?.formTitle || "ITR Filing",
  formType: formData.determinedForm?.form || "ITR-1",
  assessmentYear: formData.personalInfo?.assessmentYear || "",
  incomeAmount: String(formData.calculation?.grossTotalIncome || "0"),
  regime: formData.regime || "new",
  bankDetails: {
    bankName: formData.bankDetails?.bankName || "",
    accountNumber: formData.bankDetails?.accountNumber || "",
    ifscCode: formData.bankDetails?.ifscCode || "",
    accountType: formData.bankDetails?.accountType || "Savings",
  },
  deductions: {
    sec80c: String(formData.calculation?.totalDeductions || "0"),
    sec80d: formData.deductions?.sec80d?.selfSpouseChildren || "0",
    homeLoan24b: formData.deductions?.sec24b || "0",
    educationLoan80e: formData.deductions?.sec80e || "0",
    otherDeductions: "0",
  },
  previousFilingOption: formData.priorItrNotice?.hasPreviousItr ? "yes" : "no",
  previousAckNumber: formData.priorItrNotice?.previousAckNumber || "",
  documents: (formData.documents || []) as any,
  filingData: formData as any,
  updatedAt,
});
