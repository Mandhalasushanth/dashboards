import type { AmendmentFileInput, AmendmentRecord, ExistingBankAccountDto } from "./gstAmendmentApi.types";
import { apiClient } from "@/core/api/apiClient";
import { uploadAmendmentWithFile, formatFile } from "./gstAmendmentTransport";

/** Bank Accounts amendment endpoints. */
export const bankAccountAmendmentApi = {
  getExistingBankAccount: (gstId: string) => {
    return apiClient.get<ExistingBankAccountDto>(`/api/v1/gst/amendment/bank-account/${gstId}/existing`);
  },
  submitBankAccountAmendment: (
    gstId: string,
    bankName: string,
    accountNumber: string,
    ifscCode: string,
    accountType: string,
    file: AmendmentFileInput,
  ): Promise<AmendmentRecord> => {
    return new Promise<AmendmentRecord>((resolve, reject) => {
      const formData = new FormData();
      formData.append("newBankName", bankName);
      formData.append("newBankAccountNumber", accountNumber);
      formData.append("newIfscCode", ifscCode);

      let mappedType = "SAVINGS";
      const rawType = (accountType || "").toLowerCase();
      switch (true) {
        case rawType.includes("current"):
          mappedType = "CURRENT";
          break;
        case rawType.includes("cash") || rawType.includes("credit"):
          mappedType = "CASH_CREDIT_OD";
          break;
        default:
          mappedType = "SAVINGS";
          break;
      }

      formData.append("newAccountType", mappedType);
      formData.append("file", formatFile(file));
      uploadAmendmentWithFile<AmendmentRecord>(
        `bank-account/${gstId}`,
        formData,
        resolve,
        reject,
        "POST",
      );
    });
  },
  getBankAccountAmendmentById: (id: number | string) => {
    return apiClient.get<AmendmentRecord>(`/api/v1/gst/amendment/bank-account/record/${id}`);
  },
  updateBankAccountAmendment: (
    id: number | string,
    bankName: string,
    accountNumber: string,
    ifscCode: string,
    accountType: string,
    file?: AmendmentFileInput,
  ): Promise<AmendmentRecord> => {
    return new Promise<AmendmentRecord>((resolve, reject) => {
      const formData = new FormData();
      formData.append("newBankName", bankName);
      formData.append("newBankAccountNumber", accountNumber);
      formData.append("newIfscCode", ifscCode);

      let mappedType = "SAVINGS";
      const rawType = (accountType || "").toLowerCase();
      switch (true) {
        case rawType.includes("current"):
          mappedType = "CURRENT";
          break;
        case rawType.includes("cash") || rawType.includes("credit"):
          mappedType = "CASH_CREDIT_OD";
          break;
        default:
          mappedType = "SAVINGS";
          break;
      }

      formData.append("newAccountType", mappedType);
      if (file) formData.append("file", formatFile(file));
      uploadAmendmentWithFile<AmendmentRecord>(
        `bank-account/record/${id}`,
        formData,
        resolve,
        reject,
        "PUT",
      );
    });
  },
  submitFinalBankAccountAmendment: (
    gstId?: string,
    id?: number | string | null,
    pushToken?: string,
  ): Promise<string> => {
    const params = new URLSearchParams();
    if (gstId) params.append("gstId", gstId);
    if (id !== undefined && id !== null) params.append("id", String(id));
    if (pushToken) params.append("pushToken", pushToken);
    const query = params.toString();
    const url = `/api/v1/gst/amendment/bank-account/submit${query ? `?${query}` : ""}`;
    return apiClient.post<string>(url);
  },
};

