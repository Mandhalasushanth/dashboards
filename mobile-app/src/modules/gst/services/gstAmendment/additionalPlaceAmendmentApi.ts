import type { AmendmentFileInput, AmendmentRecord, ExistingAdditionalPlaceDto } from "./gstAmendmentApi.types";
import { apiClient } from "@/core/api/apiClient";
import { uploadAmendmentWithFile, formatFile, mapNatureOfPremises } from "./gstAmendmentTransport";

/** Additional Place amendment endpoints. */
export const additionalPlaceAmendmentApi = {
  getExistingAdditionalPlace: (gstId: string) => {
    return apiClient.get<ExistingAdditionalPlaceDto | ExistingAdditionalPlaceDto[]>(`/api/v1/gst/amendment/additional-place/${gstId}/existing`);
  },
  submitAdditionalPlaceAmendment: (
    gstId: string,
    address: string,
    city: string,
    pinCode: string,
    natureOfPremises: string,
    file: AmendmentFileInput,
  ): Promise<AmendmentRecord> => {
    return new Promise<AmendmentRecord>((resolve, reject) => {
      const formData = new FormData();
      formData.append("address", address);
      formData.append("city", city);
      formData.append("pinCode", pinCode);
      formData.append("natureOfPremises", mapNatureOfPremises(natureOfPremises));
      formData.append("file", formatFile(file));
      uploadAmendmentWithFile<AmendmentRecord>(
        `additional-place/${gstId}`,
        formData,
        resolve,
        reject,
        "POST",
      );
    });
  },
  getAdditionalPlaceAmendmentById: (id: number | string) => {
    return apiClient.get<AmendmentRecord>(`/api/v1/gst/amendment/additional-place/record/${id}`);
  },
  updateAdditionalPlaceAmendment: (
    id: number | string,
    address: string,
    city: string,
    pinCode: string,
    natureOfPremises: string,
    file?: AmendmentFileInput,
  ): Promise<AmendmentRecord> => {
    return new Promise<AmendmentRecord>((resolve, reject) => {
      const formData = new FormData();
      formData.append("address", address);
      formData.append("city", city);
      formData.append("pinCode", pinCode);
      formData.append("natureOfPremises", mapNatureOfPremises(natureOfPremises));
      if (file) formData.append("file", formatFile(file));
      uploadAmendmentWithFile<AmendmentRecord>(
        `additional-place/record/${id}`,
        formData,
        resolve,
        reject,
        "PUT",
      );
    });
  },
  submitFinalAdditionalPlaceAmendment: (
    gstId?: string,
    id?: number | string | null,
    pushToken?: string,
  ): Promise<string> => {
    const params = new URLSearchParams();
    if (gstId) params.append("gstId", gstId);
    if (id !== undefined && id !== null) params.append("id", String(id));
    if (pushToken) params.append("pushToken", pushToken);
    const query = params.toString();
    const url = `/api/v1/gst/amendment/additional-place/submit${query ? `?${query}` : ""}`;
    return apiClient.post<string>(url);
  },
};

