import { apiClient } from "../../../core/api/apiClient";
import { useAuthStore } from "@/modules/authentication/store/authStore";
import type { ItrFilingDraft } from "../types/itr.types";
import type { ItrFilingBackendDto } from "./itrFilingApplicationMapper";
import type { RevisedItrBackendDto } from "./revisedItrApplicationMapper";
import type { TdsRefundBackendDto } from "./tdsRefundApplicationMapper";

function getEffectiveCustId(): string {
  const auth = useAuthStore.getState();
  return (
    auth.customer?.customerId ||
    auth.authenticatedUser?.customerId ||
    ""
  ).trim();
}

export const itrApi = {
  submitItr: async (draft: Partial<ItrFilingDraft>) => {
    return apiClient.post<{ applicationId: string; status: string }>("/itr/file", draft);
  },
  fetchStatus: async (applicationId: string) => {
    return apiClient.get<{ status: string; acknowledgementNumber: string }>(`/itr/status/${applicationId}`);
  },

  // ── ITR My Applications (Backend Endpoints) ──
  getMyItrFilingApplications: async (custId?: string): Promise<ItrFilingBackendDto[]> => {
    const id = (custId || getEffectiveCustId()).trim();
    if (!id) return [];
    return apiClient.get<ItrFilingBackendDto[]>(`/api/v1/itr/my-applications/${encodeURIComponent(id)}`, {
      headers: { "X-Customer-Id": id },
    });
  },

  getMyRevisedItrApplications: async (custId?: string): Promise<RevisedItrBackendDto[]> => {
    const id = (custId || getEffectiveCustId()).trim();
    if (!id) return [];
    return apiClient.get<RevisedItrBackendDto[]>(`/api/v1/itr/my-applications/revised/${encodeURIComponent(id)}`, {
      headers: { "X-Customer-Id": id },
    });
  },

  getMyTdsRefundApplications: async (custId?: string): Promise<TdsRefundBackendDto[]> => {
    const id = (custId || getEffectiveCustId()).trim();
    if (!id) return [];
    return apiClient.get<TdsRefundBackendDto[]>(`/api/v1/itr/my-applications/tds-refund/${encodeURIComponent(id)}`, {
      headers: { "X-Customer-Id": id },
    });
  },
};

export default itrApi;
