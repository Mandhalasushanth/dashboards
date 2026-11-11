import { apiClient } from "../../../core/api/apiClient";
import { tokenManager, JwtUtils } from "../../../core/authentication/tokenManager";
import { useAuthStore } from "../../authentication/store/authStore";
import { authStorage } from "../../authentication/services/authStorage";
import { logger } from "../../../core/logging/logger";
import {
  UploadDocumentItem,
  executeXhrUpload,
  resolveApiBaseUrl,
  resolveAsyncApiBaseUrl,
  mapRegistrationDocField,
  resolveAddressProofEnum,
  normalizeDocumentUri,
  resolveDocumentMimeType,
} from "./gstUploadHelper";
import { gstFilingApi } from "./gstFilingApi";
import { gstComplianceApi } from "./gstComplianceApi";
import { gstAmendmentApi } from "./gstAmendmentApi";
import { appendFilePart } from "@/shared/utils/formDataFile";
import type { mapGstRegistrationPayload } from "@/modules/gst/gst-registration/utils/gstRegistrationMapper";
import type { GstFilingPayload } from "@/modules/gst/gst-filing/types/gstFilingPayload.types";

/** Body sent to the GST business register / update endpoints. */
type GstRegistrationPayload = ReturnType<typeof mapGstRegistrationPayload>;

export interface GstinEntityDetails {
  gstin: string;
  legalName: string;
  tradeName: string;
  taxpayerScheme: "Regular Scheme" | "QRMP Scheme" | "Composition Scheme";
  state: string;
  stateCode: string;
  status: "Active" | "Suspended" | "Cancelled";
  registrationDate: string;
}

const resolveCustomerId = async (): Promise<string> => {
  try {
    const authState = useAuthStore.getState();
    const custId =
      authState.customer?.customerId ||
      authState.authenticatedUser?.customerId ||
      authState.authenticatedUser?.custId ||
      (authState.customer as any)?.custId ||
      "";
    if (custId && typeof custId === "string" && custId.trim() !== "" && custId.trim() !== "undefined") {
      return custId.trim();
    }
  } catch (err) {
    // Intentional fallback to storage/token resolution cascade
    logger.debug("[gstApi] Customer ID resolution: authStore unavailable, cascading to storage", { error: err });
  }

  try {
    const user = authStorage.getUser();
    const session = authStorage.getSession();
    const custId =
      user?.customerId ||
      user?.custId ||
      session?.activeCustId ||
      "";
    if (custId && typeof custId === "string" && custId.trim() !== "" && custId.trim() !== "undefined") {
      return custId.trim();
    }
  } catch (err) {
    // Intentional fallback to token decoding
    logger.debug("[gstApi] Customer ID resolution: authStorage unavailable, cascading to token", { error: err });
  }

  try {
    const token = await tokenManager.getAccessToken();
    if (token) {
      const payload = JwtUtils.decodePayload(token);
      if (payload?.sub && typeof payload.sub === "string" && payload.sub.trim() !== "" && payload.sub.trim() !== "undefined") {
        return payload.sub.trim();
      }
    }
  } catch (err) {
    logger.debug("[gstApi] Customer ID resolution: token decoding failed", { error: err });
  }

  return "";
};

const STATE_CODES: Record<string, string> = {
  "07": "Delhi",
  "24": "Gujarat",
  "27": "Maharashtra",
  "29": "Karnataka",
  "33": "Tamil Nadu",
  "36": "Telangana",
  "19": "West Bengal",
  "09": "Uttar Pradesh",
  "06": "Haryana",
  "08": "Rajasthan",
};

function buildRegistrationFormData(
  documents: UploadDocumentItem[],
  addressProofTypeOverride?: string
): { formData: FormData; hasFiles: boolean } {
  const formData = new FormData();
  let hasFiles = false;
  let selectedAddressType = addressProofTypeOverride || "RENTAL_AGREEMENT";

  for (const doc of documents) {
    if (!doc.fileUri) continue;
    const key = `${doc.id || ""} ${doc.name || ""}`.toLowerCase();
    const fieldName = mapRegistrationDocField(key);

    if (fieldName === "principalPlaceAddressProof" && doc.subtitle?.trim() && !doc.subtitle.includes("/")) {
      selectedAddressType = doc.subtitle.trim();
    }

    if (fieldName) {
      hasFiles = true;
      const name = doc.fileName || `${fieldName}.pdf`;
      const mime = resolveDocumentMimeType(name, doc.mimeType || undefined);
      const cleanUri = normalizeDocumentUri(doc.fileUri);
      appendFilePart(formData, fieldName, {
        uri: cleanUri,
        name: name,
        type: mime,
      });
    }
  }

  if (hasFiles) {
    formData.append("principalPlaceAddressType", resolveAddressProofEnum(selectedAddressType));
  }

  return { formData, hasFiles };
}

export const gstApi = {
  lookupGstin: async (gstin: string): Promise<GstinEntityDetails | null> => {
    const clean = gstin.trim().toUpperCase();
    if (clean.length !== 15) return null;

    const stateCode = clean.substring(0, 2);
    const stateName = STATE_CODES[stateCode] || "Karnataka";

    return {
      gstin: clean,
      legalName: "Shree Deshmukh Enterprises Private Limited",
      tradeName: "Shree Deshmukh Traders",
      taxpayerScheme: clean.endsWith("Z5") ? "Regular Scheme" : "QRMP Scheme",
      state: stateName,
      stateCode,
      status: "Active",
      registrationDate: "12-Aug-2022",
    };
  },

  getBusiness: async (gstId: string) => {
    const token = await tokenManager.getAccessToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const cleanGstId = String(gstId || "").trim();
    return apiClient.get<any>(`/api/v1/gst/business/${cleanGstId}`, { headers });
  },

  getRegistrationDocuments: async (documentId: string) => {
    const token = await tokenManager.getAccessToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const cleanDocId = String(documentId || "").trim();
    return apiClient.get<any>(`/api/v1/gst/documents/${cleanDocId}`, { headers });
  },

  submitRegistration: async (businessData: GstRegistrationPayload) => {
    const token = await tokenManager.getAccessToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const payload = { ...businessData };
    if (!payload.customerId || String(payload.customerId).trim() === "") {
      const custId = await resolveCustomerId();
      if (custId) payload.customerId = custId;
    }

    if (!payload.customerId) {
      throw new Error(
        "Customer profile ID is missing. Please log in or complete your profile before registering GST."
      );
    }

    return apiClient.post<any>("/api/v1/gst/business/register", payload, { headers });
  },

  updateRegistration: async (gstId: string, businessData: GstRegistrationPayload) => {
    const token = await tokenManager.getAccessToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const cleanGstId = String(gstId || "").trim();
    if (!cleanGstId) {
      throw new Error("GST ID is required to update business details.");
    }

    const payload = { ...businessData, gstId: cleanGstId };
    if (!payload.customerId || String(payload.customerId).trim() === "") {
      const custId = await resolveCustomerId();
      if (custId) payload.customerId = custId;
    }

    return apiClient.put<any>(`/api/v1/gst/business/update/${cleanGstId}`, payload, { headers });
  },

  uploadAllDocuments: async (
    gstId: string,
    documents: UploadDocumentItem[],
    addressProofTypeOverride?: string
  ): Promise<string> => {
    const { formData, hasFiles } = buildRegistrationFormData(documents, addressProofTypeOverride);
    if (!hasFiles) return "No documents selected for upload";

    const baseUrl = await resolveAsyncApiBaseUrl();
    const cleanGstId = String(gstId || "").trim();
    const url = `${baseUrl}/api/v1/gst/documents/${cleanGstId}/register`;
    return executeXhrUpload(url, "POST", formData);
  },

  updateAllDocuments: async (
    documentId: string,
    documents: UploadDocumentItem[],
    addressProofTypeOverride?: string
  ): Promise<string> => {
    const { formData, hasFiles } = buildRegistrationFormData(documents, addressProofTypeOverride);
    if (!hasFiles) return "No documents selected for upload";

    const baseUrl = await resolveAsyncApiBaseUrl();
    const cleanDocId = String(documentId || "").trim();
    const url = `${baseUrl}/api/v1/gst/documents/${cleanDocId}/update`;
    return executeXhrUpload(url, "PUT", formData);
  },

  uploadDocument: async (
    gstId: string,
    documentType: string,
    addressProofType: string,
    fileUri: string,
    fileName: string
  ): Promise<string> => {
    const formData = new FormData();
    const fieldName = mapRegistrationDocField(documentType || "");

    if (fieldName === "principalPlaceAddressProof") {
      formData.append("principalPlaceAddressType", resolveAddressProofEnum(addressProofType));
    }

    const name = fileName || "document.pdf";
    const mime = resolveDocumentMimeType(name);
    const cleanUri = normalizeDocumentUri(fileUri);

    appendFilePart(formData, fieldName || "file", {
      uri: cleanUri,
      name: name,
      type: mime,
    });

    const baseUrl = await resolveAsyncApiBaseUrl();
    const cleanGstId = String(gstId || "").trim();
    const url = `${baseUrl}/api/v1/gst/documents/${cleanGstId}/register`;
    return executeXhrUpload(url, "POST", formData);
  },

  // Filing APIs delegated to gstFilingApi
  createFiling: async (payload: GstFilingPayload) => gstFilingApi.createFiling(payload, resolveCustomerId),
  updateFiling: async (filingId: string, payload: GstFilingPayload) =>
    gstFilingApi.updateFiling(filingId, payload, resolveCustomerId),
  getFilingById: async (filingId: string) => gstFilingApi.getFilingById(filingId),
  getFilingDocuments: async (gstfilingId: string) => gstFilingApi.getFilingDocuments(gstfilingId),
  uploadAllFilingDocuments: async (filingId: string, documents: UploadDocumentItem[]) =>
    gstFilingApi.uploadAllFilingDocuments(filingId, documents),
  updateAllFilingDocuments: async (filingId: string, documents: UploadDocumentItem[]) =>
    gstFilingApi.updateAllFilingDocuments(filingId, documents),
  uploadFilingDocument: async (filingId: string, documentType: string, fileUri: string, fileName: string) =>
    gstFilingApi.uploadFilingDocument(filingId, documentType, fileUri, fileName),
  fetchFilings: async (gstin: string) => gstFilingApi.fetchFilings(gstin),
  submitFinalFiling: async (filingId: string, pushToken?: string) =>
    gstFilingApi.submitFinalFiling(filingId, pushToken),
  submitFinalCompliance: async (complianceId: string, pushToken?: string) =>
    gstComplianceApi.submitFinalCompliance(complianceId, pushToken),
  submitFinalAmendment: async (
    sectionId: string,
    gstId?: string,
    id?: number | string | null,
    pushToken?: string,
  ) => gstAmendmentApi.submitFinalAmendmentRecord(sectionId, gstId, id, pushToken),

  fetchStatus: async (applicationId: string) => {
    return apiClient.get<{ status: string; timeline: any[] }>(`/api/v1/gst/status/${applicationId}`);
  },

  submitFinalRegistration: async (gstId: string, pushToken?: string) => {
    const token = await tokenManager.getAccessToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const cleanGstId = String(gstId || "").trim();
    const params: Record<string, string> = { gstId: cleanGstId };
    if (pushToken) params.pushToken = pushToken;
    return apiClient.post<string>("/api/v1/gst/submit", undefined, { headers, params });
  },

  getMyApplications: async (custId?: string) => {
    const token = await tokenManager.getAccessToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const resolvedCustId = custId || (await resolveCustomerId());
    if (!resolvedCustId) return [];
    return apiClient.get<import("./gstApplicationMapper").GstBackendApplicationDto[]>(
      `/api/v1/my-applications/${encodeURIComponent(resolvedCustId)}`,
      { headers }
    );
  },

  getMyFilingApplications: async (custId?: string) => {
    const token = await tokenManager.getAccessToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const resolvedCustId = custId || (await resolveCustomerId());
    if (!resolvedCustId) return [];
    return apiClient.get<import("./gstFilingApplicationMapper").GstFilingBackendDto[]>(
      `/api/v1/my-applications/filing/${encodeURIComponent(resolvedCustId)}`,
      { headers }
    );
  },

  getMyComplianceApplications: async (custId?: string) => {
    const token = await tokenManager.getAccessToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const resolvedCustId = custId || (await resolveCustomerId());
    if (!resolvedCustId) return [];
    return apiClient.get<import("./gstComplianceApplicationMapper").GstComplianceBackendDto[]>(
      `/api/v1/my-applications/compliance/${encodeURIComponent(resolvedCustId)}`,
      { headers }
    );
  },

  getMyAmendmentApplications: async (custId?: string) => {
    const token = await tokenManager.getAccessToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const resolvedCustId = custId || (await resolveCustomerId());
    if (!resolvedCustId) return [];
    return apiClient.get<import("./gstAmendmentApplicationMapper").GstAmendmentBackendDto[]>(
      `/api/v1/my-applications/amendment/${encodeURIComponent(resolvedCustId)}`,
      { headers }
    );
  },
};

export default gstApi;
