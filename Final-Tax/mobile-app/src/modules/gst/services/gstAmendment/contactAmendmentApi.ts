import type { AmendmentFileInput, AmendmentRecord, ExistingContactDto } from "./gstAmendmentApi.types";
import { apiClient } from "@/core/api/apiClient";
import { uploadAmendmentWithFile, formatFile } from "./gstAmendmentTransport";

/** Contact Details amendment endpoints. */
export const contactAmendmentApi = {
  getExistingContact: (gstId: string) => {
    return apiClient.get<ExistingContactDto>(`/api/v1/gst/amendment/contact/${gstId}/existing`);
  },
  submitContactAmendment: (
    gstId: string,
    mobileNumber: string,
    email: string,
    file: AmendmentFileInput,
  ): Promise<AmendmentRecord> => {
    return new Promise<AmendmentRecord>((resolve, reject) => {
      const formData = new FormData();
      formData.append("newMobileNumber", mobileNumber);
      formData.append("newEmail", email);
      formData.append("file", formatFile(file));
      uploadAmendmentWithFile<AmendmentRecord>(
        `contact/${gstId}`,
        formData,
        resolve,
        reject,
        "POST",
      );
    });
  },
  getContactAmendmentById: (id: number | string) => {
    return apiClient.get<AmendmentRecord>(`/api/v1/gst/amendment/contact/record/${id}`);
  },
  updateContactAmendment: (
    id: number | string,
    mobileNumber: string,
    email: string,
    file?: AmendmentFileInput,
  ): Promise<AmendmentRecord> => {
    return new Promise<AmendmentRecord>((resolve, reject) => {
      const formData = new FormData();
      formData.append("newMobileNumber", mobileNumber);
      formData.append("newEmail", email);
      if (file) formData.append("file", formatFile(file));
      uploadAmendmentWithFile<AmendmentRecord>(
        `contact/record/${id}`,
        formData,
        resolve,
        reject,
        "PUT",
      );
    });
  },
  submitFinalContactAmendment: (
    gstId?: string,
    id?: number | string | null,
    pushToken?: string,
  ): Promise<string> => {
    const params = new URLSearchParams();
    if (gstId) params.append("gstId", gstId);
    if (id !== undefined && id !== null) params.append("id", String(id));
    if (pushToken) params.append("pushToken", pushToken);
    const query = params.toString();
    const url = `/api/v1/gst/amendment/contact/submit${query ? `?${query}` : ""}`;
    return apiClient.post<string>(url);
  },
};

