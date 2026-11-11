import { apiClient } from "../../../core/api/apiClient";
import { tokenManager } from "../../../core/authentication/tokenManager";
import {
  UploadDocumentItem,
  executeXhrUpload,
  resolveApiBaseUrl,
  resolveAsyncApiBaseUrl,
  mapFilingDocField,
  normalizeDocumentUri,
  resolveDocumentMimeType,
} from "./gstUploadHelper";
import { appendFilePart } from "@/shared/utils/formDataFile";
import type { GstFilingPayload } from "@/modules/gst/gst-filing/types/gstFilingPayload.types";

export const gstFilingApi = {
  createFiling: async (payload: GstFilingPayload, resolveCustomerId: () => Promise<string>) => {
    const token = await tokenManager.getAccessToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const finalPayload = { ...payload };
    if (
      !finalPayload.customerId ||
      String(finalPayload.customerId).trim() === "" ||
      String(finalPayload.customerId).trim() === "undefined"
    ) {
      const custId = await resolveCustomerId();
      if (custId) finalPayload.customerId = custId;
    }

    if (finalPayload.returnType) {
      const rt = String(finalPayload.returnType).toUpperCase();
      finalPayload.returnType = rt.includes("3B") || rt.includes("3_B") ? "GSTR_3B" : "GSTR_1";
    }

    if (finalPayload.financialYear) {
      finalPayload.financialYear = String(finalPayload.financialYear).replace(/^FY\s*/i, "").trim();
    }

    return apiClient.post<string>("/api/v1/gst/filing/create", finalPayload, { headers });
  },

  updateFiling: async (filingId: string, payload: GstFilingPayload, resolveCustomerId: () => Promise<string>) => {
    const token = await tokenManager.getAccessToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const finalPayload = { ...payload };
    if (
      !finalPayload.customerId ||
      String(finalPayload.customerId).trim() === "" ||
      String(finalPayload.customerId).trim() === "undefined"
    ) {
      const custId = await resolveCustomerId();
      if (custId) finalPayload.customerId = custId;
    }

    if (finalPayload.returnType) {
      const rt = String(finalPayload.returnType).toUpperCase();
      finalPayload.returnType = rt.includes("3B") || rt.includes("3_B") ? "GSTR_3B" : "GSTR_1";
    }

    if (finalPayload.financialYear) {
      finalPayload.financialYear = String(finalPayload.financialYear).replace(/^FY\s*/i, "").trim();
    }

    const cleanFilingId = String(filingId || "").trim();
    return apiClient.put<string>(`/api/v1/gst/filing/update/${cleanFilingId}`, finalPayload, { headers });
  },

  getFilingById: async (filingId: string) => {
    const token = await tokenManager.getAccessToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const cleanId = String(filingId || "").trim();
    return apiClient.get<any>(`/api/v1/gst/filing/${cleanId}`, { headers });
  },

  getFilingDocuments: async (gstfilingId: string) => {
    const token = await tokenManager.getAccessToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const cleanId = String(gstfilingId || "").trim();
    return apiClient.get<any>(`/api/v1/gst/filing/documents/${cleanId}`, { headers });
  },

  uploadAllFilingDocuments: async (
    filingId: string,
    documents: UploadDocumentItem[]
  ): Promise<string> => {
    const formData = new FormData();
    let hasFiles = false;

    for (const doc of documents) {
      if (!doc.fileUri) continue;
      const key = `${doc.id || ""} ${doc.name || ""}`.toLowerCase();
      const fieldName = mapFilingDocField(key);

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

    if (!hasFiles) return "No documents selected for upload";

    const baseUrl = await resolveAsyncApiBaseUrl();
    const cleanFilingId = String(filingId || "").trim();
    const url = `${baseUrl}/api/v1/gst/filing/documents/${cleanFilingId}/upload`;
    return executeXhrUpload(url, "POST", formData, () =>
      gstFilingApi.updateAllFilingDocuments(cleanFilingId, documents)
    );
  },

  updateAllFilingDocuments: async (
    filingId: string,
    documents: UploadDocumentItem[]
  ): Promise<string> => {
    const formData = new FormData();
    let hasFiles = false;

    for (const doc of documents) {
      if (!doc.fileUri) continue;
      const key = `${doc.id || ""} ${doc.name || ""}`.toLowerCase();
      const fieldName = mapFilingDocField(key);

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

    if (!hasFiles) return "No documents selected for upload";

    const baseUrl = await resolveAsyncApiBaseUrl();
    const cleanFilingId = String(filingId || "").trim();
    const url = `${baseUrl}/api/v1/gst/filing/documents/${cleanFilingId}/update`;

    return executeXhrUpload(url, "PUT", formData, () =>
      gstFilingApi.uploadAllFilingDocuments(cleanFilingId, documents)
    );
  },

  uploadFilingDocument: async (
    filingId: string,
    documentType: string,
    fileUri: string,
    fileName: string
  ): Promise<string> => {
    const formData = new FormData();
    const fieldName = mapFilingDocField(documentType || "");

    const name = fileName || `${fieldName}.pdf`;
    const mime = resolveDocumentMimeType(name);
    const cleanUri = normalizeDocumentUri(fileUri);

    appendFilePart(formData, fieldName, {
      uri: cleanUri,
      name: name,
      type: mime,
    });

    const baseUrl = await resolveAsyncApiBaseUrl();
    const cleanFilingId = String(filingId || "").trim();
    const url = `${baseUrl}/api/v1/gst/filing/documents/${cleanFilingId}/upload`;
    return executeXhrUpload(url, "POST", formData);
  },

  fetchFilings: async (gstin: string) => {
    return apiClient.get<any[]>(`/api/v1/gst/filing/${gstin}`);
  },

  submitFinalFiling: async (filingId: string, pushToken?: string) => {
    const token = await tokenManager.getAccessToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const cleanId = String(filingId || "").trim();
    const params: Record<string, string> = { filingId: cleanId };
    if (pushToken) params.pushToken = pushToken;
    return apiClient.post<string>("/api/v1/gst/filing/submit", undefined, { headers, params });
  },
};
