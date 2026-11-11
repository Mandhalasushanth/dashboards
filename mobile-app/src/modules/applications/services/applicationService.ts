import { apiClient } from "../../../core/api/apiClient";
import { ApiError } from "../../../core/api/apiError";
import { useAuthStore } from "../../authentication/store/authStore";
import { logger } from "../../../core/logging/logger";
import { getErrorMessage } from "@/core/error-handling/errorMessage";
import type { Application } from "../../../types/domain";

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const state = useAuthStore.getState();
  const customerId = state.customer?.customerId || state.authenticatedUser?.customerId;
  const mobile = state.customer?.mobile || state.authenticatedUser?.mobileNumber || state.mobileNumber;

  if (customerId && customerId.trim()) {
    headers["X-Customer-Id"] = customerId.trim();
  }
  if (mobile && mobile.trim()) {
    headers["X-Customer-Mobile"] = mobile.trim();
  }
  return headers;
}

import { extractApplicationsFromResponse } from "../utils/applicationResponseParser";
import { appendFilePart } from "@/shared/utils/formDataFile";
import { sanitizeMessageText } from "../utils/chatAttachmentUtils";
import { gstApi } from "@/modules/gst/services/gstApi";
import { mapGstBackendToApplication, type GstBackendApplicationDto } from "@/modules/gst/services/gstApplicationMapper";
import { mapGstFilingBackendToApplication, type GstFilingBackendDto } from "@/modules/gst/services/gstFilingApplicationMapper";
import { mapGstComplianceBackendToApplication, type GstComplianceBackendDto } from "@/modules/gst/services/gstComplianceApplicationMapper";
import { mapGstAmendmentBackendToApplication, type GstAmendmentBackendDto } from "@/modules/gst/services/gstAmendmentApplicationMapper";
import { itrApi } from "@/modules/itr/services/itrApi";
import { mapItrFilingBackendToApplication, type ItrFilingBackendDto } from "@/modules/itr/services/itrFilingApplicationMapper";
import { mapRevisedItrBackendToApplication, type RevisedItrBackendDto } from "@/modules/itr/services/revisedItrApplicationMapper";
import { mapTdsRefundBackendToApplication, type TdsRefundBackendDto } from "@/modules/itr/services/tdsRefundApplicationMapper";
export { extractApplicationsFromResponse };

export const applicationService = {
  getApplications: async (): Promise<Application[]> => {
    const headers = getAuthHeaders();
    let genericList: Application[] = [];

    // 1. Fetch Generic Applications if endpoint available
    try {
      const result = await apiClient.get<unknown>("/applications", { headers });
      const list = extractApplicationsFromResponse(result);
      genericList = list.map((app) => ({
        ...app,
        documents: Array.isArray(app?.documents) ? app.documents : [],
        timeline: Array.isArray(app?.timeline) ? app.timeline : [],
        chatHistory: Array.isArray(app?.chatHistory) ? app.chatHistory : [],
      }));
    } catch (err: unknown) {
      if (!(err instanceof ApiError && (err.statusCode === 204 || err.statusCode === 404))) {
        const errMsg = getErrorMessage(err);
        if (
          !errMsg ||
          (!errMsg.includes("404") &&
            !errMsg.toLowerCase().includes("not found") &&
            !errMsg.toLowerCase().includes("no applications") &&
            !errMsg.toLowerCase().includes("no static resource"))
        ) {
          logger.debug("[applicationService] /applications endpoint error:", { error: errMsg });
        }
      }
    }

    // 2. Fetch Live GST Applications from backend
    let gstList: Application[] = [];
    try {
      const gstDtos = await gstApi.getMyApplications();
      if (Array.isArray(gstDtos)) {
        gstList = gstDtos.map((dto: GstBackendApplicationDto) => mapGstBackendToApplication(dto));
      }
    } catch (gstErr: unknown) {
      logger.debug("[applicationService] Failed to fetch GST applications from backend:", {
        error: getErrorMessage(gstErr),
      });
    }

    // 3. Fetch Live GST Filing Applications from backend
    let filingList: Application[] = [];
    try {
      const filingDtos = await gstApi.getMyFilingApplications();
      if (Array.isArray(filingDtos)) {
        filingList = filingDtos.map((dto: GstFilingBackendDto) => mapGstFilingBackendToApplication(dto));
      }
    } catch (filingErr: unknown) {
      logger.debug("[applicationService] Failed to fetch GST filing applications from backend:", {
        error: getErrorMessage(filingErr),
      });
    }

    // 4. Fetch Live GST Compliance Applications from backend
    let complianceList: Application[] = [];
    try {
      const complianceDtos = await gstApi.getMyComplianceApplications();
      if (Array.isArray(complianceDtos)) {
        complianceList = complianceDtos.map((dto: GstComplianceBackendDto) =>
          mapGstComplianceBackendToApplication(dto)
        );
      }
    } catch (complianceErr: unknown) {
      logger.debug("[applicationService] Failed to fetch GST compliance applications from backend:", {
        error: getErrorMessage(complianceErr),
      });
    }

    // 5. Fetch Live GST Amendment Applications from backend
    let amendmentList: Application[] = [];
    try {
      const amendmentDtos = await gstApi.getMyAmendmentApplications();
      if (Array.isArray(amendmentDtos)) {
        amendmentList = amendmentDtos.map((dto: GstAmendmentBackendDto) =>
          mapGstAmendmentBackendToApplication(dto)
        );
      }
    } catch (amendmentErr: unknown) {
      logger.debug("[applicationService] Failed to fetch GST amendment applications from backend:", {
        error: getErrorMessage(amendmentErr),
      });
    }

    // 6. Fetch Live ITR Filing Applications from backend
    let itrFilingList: Application[] = [];
    try {
      const itrDtos = await itrApi.getMyItrFilingApplications();
      if (Array.isArray(itrDtos)) {
        itrFilingList = itrDtos.map((dto: ItrFilingBackendDto) => mapItrFilingBackendToApplication(dto));
      }
    } catch (itrErr: unknown) {
      logger.debug("[applicationService] Failed to fetch ITR filing applications from backend:", {
        error: getErrorMessage(itrErr),
      });
    }

    // 7. Fetch Live Revised ITR Applications from backend
    let revisedItrList: Application[] = [];
    try {
      const revisedDtos = await itrApi.getMyRevisedItrApplications();
      if (Array.isArray(revisedDtos)) {
        revisedItrList = revisedDtos.map((dto: RevisedItrBackendDto) => mapRevisedItrBackendToApplication(dto));
      }
    } catch (revisedErr: unknown) {
      logger.debug("[applicationService] Failed to fetch Revised ITR applications from backend:", {
        error: getErrorMessage(revisedErr),
      });
    }

    // 8. Fetch Live TDS Refund Applications from backend
    let tdsRefundList: Application[] = [];
    try {
      const tdsDtos = await itrApi.getMyTdsRefundApplications();
      if (Array.isArray(tdsDtos)) {
        tdsRefundList = tdsDtos.map((dto: TdsRefundBackendDto) => mapTdsRefundBackendToApplication(dto));
      }
    } catch (tdsErr: unknown) {
      logger.debug("[applicationService] Failed to fetch TDS Refund applications from backend:", {
        error: getErrorMessage(tdsErr),
      });
    }

    return [
      ...gstList,
      ...filingList,
      ...complianceList,
      ...amendmentList,
      ...itrFilingList,
      ...revisedItrList,
      ...tdsRefundList,
      ...genericList,
    ];
  },

  getApplicationById: async (id: string): Promise<Application | null> => {
    if (!id) return null;
    const headers = getAuthHeaders();
    try {
      return await apiClient.get<Application>("/applications/" + encodeURIComponent(id), { headers });
    } catch {
      return null;
    }
  },

  createApplication: async (app: Application): Promise<Application> => {
    const headers = getAuthHeaders();
    const state = useAuthStore.getState();
    const customerId = state.customer?.customerId || state.authenticatedUser?.customerId;
    const mobile = state.customer?.mobile || state.authenticatedUser?.mobileNumber || state.mobileNumber;

    const payload = {
      ...app,
      id: app.id && app.id.trim() ? app.id.trim() : `APP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: customerId || undefined,
      mobileNumber: mobile || undefined,
    };

    try {
      return await apiClient.post<Application>("/applications", payload, { headers });
    } catch (err) {
      logger.debug("[applicationService] Backend /applications endpoint unavailable, saved to local persistence", {
        error: getErrorMessage(err),
      });
      return payload as Application;
    }
  },

  updateApplication: async (app: Application): Promise<Application> => {
    try {
      const headers = getAuthHeaders();
      return await apiClient.post<Application>("/applications", app, { headers });
    } catch (err) {
      logger.debug("[applicationService] Backend /applications endpoint unavailable, saved to local persistence", {
        error: getErrorMessage(err),
      });
      return app;
    }
  },

  uploadChatAttachment: async (
    appId: string,
    file: { uri: string; name: string; type: string; size?: number }
  ): Promise<string | null> => {
    const formData = new FormData();
    appendFilePart(formData, "file", {
      uri: file.uri,
      name: file.name,
      type: file.type,
    });
    formData.append("applicationId", appId);

    const headers = getAuthHeaders();
    try {
      const res = await apiClient.post<{ url?: string; fileUrl?: string; attachmentUrl?: string }>(
        `/applications/${encodeURIComponent(appId)}/attachments`,
        formData,
        { headers }
      );
      const remoteUrl = res?.attachmentUrl || res?.fileUrl || res?.url;
      if (remoteUrl && typeof remoteUrl === "string") {
        return remoteUrl;
      }
    } catch (err) {
      logger.debug("[applicationService] Backend attachment upload endpoint unavailable, will handle via fallback", {
        error: getErrorMessage(err),
      });
    }
    return null;
  },

  sendChatMessage: async (
    appId: string,
    text: string,
    sender: "user" | "staff" = "user",
    attachment?: { uri: string; name: string; type: string; size?: number }
  ): Promise<boolean> => {
    try {
      const app = await applicationService.getApplicationById(appId);
      if (!app) return false;

      let remoteUrl: string | undefined;
      if (attachment) {
        remoteUrl = (await applicationService.uploadChatAttachment(appId, attachment)) || undefined;
      }

      const cleanText = sanitizeMessageText(text);
      const newMessage = {
        id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        sender,
        text: cleanText,
        caption: cleanText || undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        imageUrl: remoteUrl || attachment?.uri,
        attachmentUrl: remoteUrl || attachment?.uri,
        attachmentName: attachment?.name,
      };

      const updatedApp: Application = {
        ...app,
        chatHistory: [...(app.chatHistory || []), newMessage],
      };

      await applicationService.updateApplication(updatedApp);
      return true;
    } catch (e) {
      logger.warn("[applicationService] Failed to persist chat message to backend:", { error: e });
      return false;
    }
  },

  /**
   * Fetches the document base64 payload from existing module endpoints on-demand for preview.
   */
  fetchDocumentDataUri: async (
    serviceId: string | undefined,
    formData: Record<string, any> | undefined,
    docName: string
  ): Promise<string | null> => {
    const fd = formData || {};
    const normalized = docName.toLowerCase().replace(/[^a-z0-9]/g, "");

    // 1. Determine field name
    let fieldName: string | null = null;
    if (normalized.includes("pancard") || normalized === "pan") fieldName = "panCard";
    else if (normalized.includes("aadhaar") || normalized.includes("aadhar")) fieldName = "aadhaarCard";
    else if (normalized.includes("businessregistration") || normalized.includes("registrationproof")) fieldName = "businessRegistrationProof";
    else if (normalized.includes("principalplace") || normalized.includes("addressproof")) fieldName = "principalPlaceAddressProof";
    else if (normalized.includes("bankpassbook") || normalized.includes("cheque") || normalized.includes("passbook")) fieldName = "bankPassbookOrCancelledCheque";
    else if (normalized.includes("photograph") || normalized.includes("passport") || normalized.includes("photo")) fieldName = "passportSizePhotograph";
    else if (normalized.includes("salesinvoice")) fieldName = "salesInvoice";
    else if (normalized.includes("purchaseinvoice")) fieldName = "purchaseInvoices";
    else if (normalized.includes("gstr2b") || normalized.includes("itc")) fieldName = "gstr2bItcStatement";
    else if (normalized.includes("creditnote")) fieldName = "creditNotes";
    else if (normalized.includes("debitnote")) fieldName = "debitNotes";
    else if (normalized.includes("bankstatement") || normalized.includes("bankaccountstatement")) fieldName = "bankStatement";
    else if (normalized.includes("form16") || normalized.includes("form16a")) fieldName = "form16PartAPartB";
    else if (normalized.includes("form26as")) fieldName = "form26as";
    else if (normalized.includes("aistis") || normalized.includes("ais")) fieldName = "aisTis";
    else if (normalized.includes("businesspan")) fieldName = "businessPanDocument";
    else if (normalized.includes("salarypayslip") || normalized.includes("payslip")) fieldName = "salaryPayslips";

    try {
      // GST Registration
      if (serviceId === "gst-registration" || fd.gstId || fd.documentId) {
        const docId = fd.documentId || fd.gstId;
        if (docId) {
          const res = await apiClient.get<Record<string, any>>(`/api/v1/gst/documents/${docId}`);
          if (res && fieldName && res[fieldName]) {
            const raw = String(res[fieldName]);
            const mime = raw.startsWith("JVBERi0") ? "application/pdf" : "image/jpeg";
            return `data:${mime};base64,${raw}`;
          }
        }
      }

      // GST Filing
      if (serviceId === "gst-filing" || fd.filingId || fd.gstfilingId) {
        const filingId = fd.filingId || fd.gstfilingId || fd.id;
        if (filingId) {
          const res = await apiClient.get<Record<string, any>>(`/api/v1/gst/filing/documents/${filingId}`);
          if (res) {
            const target = fieldName ? res[fieldName] : null;
            if (target) {
              const raw = String(target);
              const mime = raw.startsWith("JVBERi0") ? "application/pdf" : "image/jpeg";
              return `data:${mime};base64,${raw}`;
            }
          }
        }
      }

      // ITR Filing
      if (serviceId === "itr-filing" || serviceId === "itr" || fd.itrId) {
        const docId = fd.documentId || fd.itrId || fd.id;
        if (docId) {
          const res = await apiClient.get<Record<string, any>>(`/api/v1/itr/documents/${docId}`);
          if (res) {
            const target =
              fieldName === "bankStatement"
                ? res.bankAccountStatement || res.bankStatement
                : fieldName
                ? res[fieldName]
                : null;
            if (target) {
              const raw = String(target);
              const mime = raw.startsWith("JVBERi0") ? "application/pdf" : "image/jpeg";
              return `data:${mime};base64,${raw}`;
            }
          }
        }
      }

      // Revised ITR
      if (serviceId === "revised-itr" || fd.revisedItrId) {
        const docId = fd.documentId || fd.revisedItrId || fd.id;
        if (docId) {
          const res = await apiClient.get<Record<string, any>>(`/api/v1/itr/revised/document/${docId}`);
          if (res) {
            const target =
              fieldName === "bankStatement"
                ? res.bankStatements || res.bankStatement
                : fieldName === "aisTis"
                ? res.aisTisStatement || res.aisTis
                : fieldName === "form16PartAPartB"
                ? res.form16Form16A || res.form16PartAPartB
                : fieldName
                ? res[fieldName]
                : null;
            if (target) {
              const raw = String(target);
              const mime = raw.startsWith("JVBERi0") ? "application/pdf" : "image/jpeg";
              return `data:${mime};base64,${raw}`;
            }
          }
        }
      }

      // TDS Refund
      if (serviceId === "tds-refund" || fd.tdsRefundId) {
        const tdsId = fd.tdsRefundId || fd.id;
        if (tdsId) {
          const res = await apiClient.get<Record<string, any>>(`/tds-refund/get/${tdsId}`);
          if (res) {
            const target =
              fieldName === "businessPanDocument" || normalized.includes("pan")
                ? res.businessPanDocument
                : res.aadhaarDocument;
            if (target) {
              const raw = String(target);
              const mime = raw.startsWith("JVBERi0") ? "application/pdf" : "image/jpeg";
              return `data:${mime};base64,${raw}`;
            }
          }
        }
      }
    } catch (err) {
      logger.debug("[applicationService] fetchDocumentDataUri error:", { error: getErrorMessage(err) });
    }
    return null;
  },
};

export default applicationService;
