import type { AmendmentFileInput, AmendmentRecord, ExistingPrincipalPlaceDto } from "./gstAmendmentApi.types";
import { apiClient } from "@/core/api/apiClient";
import { uploadAmendmentWithFile, formatFile, mapNatureOfPremises } from "./gstAmendmentTransport";

/** Principal Place amendment endpoints. */
export const principalPlaceAmendmentApi = {
  getExistingPrincipalPlace: (gstId: string) => {
    return apiClient.get<ExistingPrincipalPlaceDto>(`/api/v1/gst/amendment/principal-place/${gstId}/existing`);
  },
  submitPrincipalPlaceAmendment: (
    gstId: string,
    address: string,
    city: string,
    state: string,
    pinCode: string,
    file: AmendmentFileInput,
    district?: string,
    natureOfPremises?: string,
  ): Promise<AmendmentRecord> => {
    return new Promise<AmendmentRecord>((resolve, reject) => {
      const formData = new FormData();
      formData.append("newBusinessAddress", address);
      formData.append("newCity", city);
      formData.append("newState", state);
      formData.append("newPinCode", pinCode);
      if (district) formData.append("newDistrict", district);
      formData.append("natureOfPremises", mapNatureOfPremises(natureOfPremises));
      formData.append("file", formatFile(file));
      uploadAmendmentWithFile<AmendmentRecord>(
        `principal-place/${gstId}`,
        formData,
        resolve,
        reject,
        "POST",
      );
    });
  },
  getPrincipalPlaceAmendmentById: (id: number | string) => {
    return apiClient.get<AmendmentRecord>(`/api/v1/gst/amendment/principal-place/record/${id}`);
  },
  updatePrincipalPlaceAmendment: (
    id: number | string,
    address: string,
    city: string,
    state: string,
    pinCode: string,
    file?: AmendmentFileInput,
    district?: string,
    natureOfPremises?: string,
  ): Promise<AmendmentRecord> => {
    return new Promise<AmendmentRecord>((resolve, reject) => {
      const formData = new FormData();
      formData.append("newBusinessAddress", address);
      formData.append("newCity", city);
      formData.append("newState", state);
      formData.append("newPinCode", pinCode);
      if (district) formData.append("newDistrict", district);
      if (natureOfPremises) formData.append("natureOfPremises", mapNatureOfPremises(natureOfPremises));
      if (file) formData.append("file", formatFile(file));
      uploadAmendmentWithFile<AmendmentRecord>(
        `principal-place/record/${id}`,
        formData,
        resolve,
        reject,
        "PUT",
      );
    });
  },
  submitFinalPrincipalPlaceAmendment: (
    gstId?: string,
    id?: number | string | null,
    pushToken?: string,
  ): Promise<string> => {
    const params = new URLSearchParams();
    if (gstId) params.append("gstId", gstId);
    if (id !== undefined && id !== null) params.append("id", String(id));
    if (pushToken) params.append("pushToken", pushToken);
    const query = params.toString();
    const url = `/api/v1/gst/amendment/principal-place/submit${query ? `?${query}` : ""}`;
    return apiClient.post<string>(url);
  },
};

