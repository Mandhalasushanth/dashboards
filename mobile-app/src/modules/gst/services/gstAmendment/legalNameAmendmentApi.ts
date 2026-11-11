import type { AmendmentFileInput, AmendmentRecord, ExistingLegalNameDto } from "./gstAmendmentApi.types";
import { apiClient } from "@/core/api/apiClient";
import { uploadAmendmentWithFile, formatFile } from "./gstAmendmentTransport";

/** Legal Name amendment endpoints. */
export const legalNameAmendmentApi = {
  getExistingLegalName: (gstId: string) => {
    return apiClient.get<ExistingLegalNameDto>(`/api/v1/gst/amendment/legal-name/${gstId}/existing`);
  },
  submitLegalNameAmendment: (
    gstId: string,
    newLegalName: string,
    file: AmendmentFileInput,
  ): Promise<AmendmentRecord> => {
    return new Promise<AmendmentRecord>((resolve, reject) => {
      const formData = new FormData();
      formData.append("newLegalName", newLegalName);
      formData.append("file", formatFile(file));
      uploadAmendmentWithFile<AmendmentRecord>(
        `legal-name/${gstId}`,
        formData,
        resolve,
        reject,
        "POST",
      );
    });
  },
  getLegalNameAmendmentById: (id: number | string) => {
    return apiClient.get<AmendmentRecord>(`/api/v1/gst/amendment/legal-name/record/${id}`);
  },
  updateLegalNameAmendment: (
    id: number | string,
    newLegalName: string,
    file?: AmendmentFileInput,
  ): Promise<AmendmentRecord> => {
    return new Promise<AmendmentRecord>((resolve, reject) => {
      const formData = new FormData();
      formData.append("newLegalName", newLegalName);
      if (file) {
        formData.append("file", formatFile(file));
      }
      uploadAmendmentWithFile<AmendmentRecord>(
        `legal-name/record/${id}`,
        formData,
        resolve,
        reject,
        "PUT",
      );
    });
  },
  submitFinalLegalNameAmendment: (
    gstId?: string,
    id?: number | string | null,
    pushToken?: string,
  ): Promise<string> => {
    const params = new URLSearchParams();
    if (gstId) params.append("gstId", gstId);
    if (id !== undefined && id !== null) params.append("id", String(id));
    if (pushToken) params.append("pushToken", pushToken);
    const query = params.toString();
    const url = `/api/v1/gst/amendment/legal-name/submit${query ? `?${query}` : ""}`;
    return apiClient.post<string>(url);
  },
};

