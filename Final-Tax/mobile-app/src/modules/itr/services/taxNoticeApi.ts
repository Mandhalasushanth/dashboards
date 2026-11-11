import * as FileSystem from "expo-file-system";
import { apiClient, SERVER_IP, SERVER_PORT } from "@/core/api/apiClient";
import { tokenManager } from "@/core/authentication/tokenManager";
import type { TaxNoticeFormData } from "../taxNotice/types/taxNotice.types";
 
const getBaseUrl = () => apiClient.getBaseUrl() || `http://${SERVER_IP}:${SERVER_PORT}`;
 
export const taxNoticeApi = {
  /**
   * 1. Register a new Tax Notice Assistance Request
   * Uses XMLHttpRequest directly to bypass React Native fetch FormData limitations.
   */
  registerTaxNotice: (data: TaxNoticeFormData): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
                let token = await tokenManager.getAccessToken();
       
        // Ensure token is fresh before sending raw XHR
        try {
          const { tokenRefreshManager } = require("@/core/authentication/tokenRefreshManager");
          const refreshed = await tokenRefreshManager.attemptRefresh();
          if (refreshed) {
             token = await tokenManager.getAccessToken();
          }
        } catch(e) {
          console.warn("Token refresh check failed before XHR:", e);
        }

        if (!token) {
          reject(new Error("Session expired. Please log in again."));
          return;
        }
 
        const url = getBaseUrl() + "/api/v1/itr/tax-notice/register";
       
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        if (token) {
          xhr.setRequestHeader("Authorization", "Bearer " + token);
        }
 
        const formData = new FormData();
                // Get customer ID
        const { default: authStore } = require("@/store/authStore");
        const user = authStore.getState().authenticatedUser || authStore.getState().customer;
        const custId = user?.customerId || user?.custId || "";
 
                const formatDateForBackend = (dateStr?: string) => {
          if (!dateStr) return null;
          const parts = dateStr.trim().split(" ");
          if (parts.length === 3) {
            const day = parts[0].padStart(2, "0");
            const monthMap: Record<string, string> = {
              "Jan":"01","Feb":"02","Mar":"03","Apr":"04","May":"05","Jun":"06",
              "Jul":"07","Aug":"08","Sep":"09","Oct":"10","Nov":"11","Dec":"12"
            };
            const month = monthMap[parts[1]] || "01";
            const year = parts[2];
            return year + "-" + month + "-" + day;
          }
          if (dateStr.includes("-")) return dateStr;
          return null;
        };
 
        const jsonData = {
          custId: custId,
          permanentAccountNumber: data.pan,
          assessmentYear: data.assessmentYear,
          noticeTypeSection: data.noticeType,
          noticeDate: formatDateForBackend(data.noticeDate),
          noticeReferenceNumberDin: data.noticeNumber,
          responseDueDate: formatDateForBackend(data.responseDueDate),
          message: data.customerExplanation
        };
        formData.append("data", JSON.stringify(jsonData));
 
                if (data.noticeFileUri) {
          formData.append("file", {
            uri: data.noticeFileUri,
            name: data.noticeFileName || "notice_document.pdf",
            type: data.noticeFileType || "application/pdf",
          } as any);
        }
 
                  xhr.onload = () => {
            if (xhr.status === 401 || xhr.status === 403) {
              const { tokenRefreshManager } = require("@/core/authentication/tokenRefreshManager");
              tokenRefreshManager.attemptRefresh().catch(() => {});
              reject(new Error("Session expired. Please log in again."));
              return;
            }

            if (xhr.status >= 200 && xhr.status < 300) {
              const responseText = xhr.responseText;
              let finalNoticeId = responseText;
              // Extract ID from "Tax notice details registered successfully. Notice ID: TNA232615"
              if (responseText.includes("Notice ID:")) {
                 finalNoticeId = responseText.split("Notice ID:")[1].trim();
              }
              resolve(finalNoticeId);
            } else {
              reject(new Error("Failed to register Tax Notice: " + xhr.status + " " + xhr.responseText));
            }
          };
 
        xhr.onerror = () => reject(new Error("Network error during Tax Notice registration"));
        xhr.send(formData);
      } catch (err) {
        reject(err);
      }
    });
  },
 
  updateTaxNotice: (noticeId: string, data: TaxNoticeFormData): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
                let token = await tokenManager.getAccessToken();
       
        // Ensure token is fresh before sending raw XHR
        try {
          const { tokenRefreshManager } = require("@/core/authentication/tokenRefreshManager");
          const refreshed = await tokenRefreshManager.attemptRefresh();
          if (refreshed) {
             token = await tokenManager.getAccessToken();
          }
        } catch(e) {
          console.warn("Token refresh check failed before XHR:", e);
        }

        if (!token) {
          reject(new Error("Session expired. Please log in again."));
          return;
        }
 
        const url = getBaseUrl() + "/api/v1/itr/tax-notice/update/" + noticeId;
       
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", url);
        if (token) {
          xhr.setRequestHeader("Authorization", "Bearer " + token);
        }
 
        const formData = new FormData();
                // Get customer ID
        const { default: authStore } = require("@/store/authStore");
        const user = authStore.getState().authenticatedUser || authStore.getState().customer;
        const custId = user?.customerId || user?.custId || "";
 
                const formatDateForBackend = (dateStr?: string) => {
          if (!dateStr) return null;
          const parts = dateStr.trim().split(" ");
          if (parts.length === 3) {
            const day = parts[0].padStart(2, "0");
            const monthMap: Record<string, string> = {
              "Jan":"01","Feb":"02","Mar":"03","Apr":"04","May":"05","Jun":"06",
              "Jul":"07","Aug":"08","Sep":"09","Oct":"10","Nov":"11","Dec":"12"
            };
            const month = monthMap[parts[1]] || "01";
            const year = parts[2];
            return year + "-" + month + "-" + day;
          }
          if (dateStr.includes("-")) return dateStr;
          return null;
        };
 
        const jsonData = {
          custId: custId,
          permanentAccountNumber: data.pan,
          assessmentYear: data.assessmentYear,
          noticeTypeSection: data.noticeType,
          noticeDate: formatDateForBackend(data.noticeDate),
          noticeReferenceNumberDin: data.noticeNumber,
          responseDueDate: formatDateForBackend(data.responseDueDate),
          message: data.customerExplanation
        };
        formData.append("data", JSON.stringify(jsonData));
 
                if (data.noticeFileUri) {
          formData.append("file", {
            uri: data.noticeFileUri,
            name: data.noticeFileName || "notice_document.pdf",
            type: data.noticeFileType || "application/pdf",
          } as any);
        }
 
                  xhr.onload = () => {
            if (xhr.status === 401 || xhr.status === 403) {
              const { tokenRefreshManager } = require("@/core/authentication/tokenRefreshManager");
              tokenRefreshManager.attemptRefresh().catch(() => {});
              reject(new Error("Session expired. Please log in again."));
              return;
            }

            if (xhr.status >= 200 && xhr.status < 300) {
              const responseText = xhr.responseText;
              let finalNoticeId = responseText;
              // Extract ID from "Tax notice details registered successfully. Notice ID: TNA232615"
              if (responseText.includes("Notice ID:")) {
                 finalNoticeId = responseText.split("Notice ID:")[1].trim();
              }
              resolve(finalNoticeId);
            } else {
              reject(new Error("Failed to update Tax Notice: " + xhr.status + " " + xhr.responseText));
            }
          };
 
        xhr.onerror = () => reject(new Error("Network error during Tax Notice update"));
        xhr.send(formData);
      } catch (err) {
        reject(err);
      }
    });
  },
 
  /**
   * 2. Get Tax Notice Details
   */
  getTaxNotice: async (noticeId: string): Promise<any> => {
    return apiClient.get("/api/v1/itr/tax-notice/" + noticeId);
  },
 
  /**
   * 3. Register Additional Documents for a Notice
   */
  registerDocuments: (noticeId: string, documents: Record<string, any>): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
                let token = await tokenManager.getAccessToken();
       
        try {
          const { tokenRefreshManager } = require("@/core/authentication/tokenRefreshManager");
          const refreshed = await tokenRefreshManager.attemptRefresh();
          if (refreshed) {
             token = await tokenManager.getAccessToken();
          }
        } catch(e) {}

        if (!token) {
          reject(new Error("Session expired. Please log in again."));
          return;
        }
 
        const url = getBaseUrl() + "/api/v1/itr/tax-notice/" + noticeId + "/document/register";
       
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        if (token) {
          xhr.setRequestHeader("Authorization", "Bearer " + token);
        }
 
        const formData = new FormData();
        // The backend accepts a JSON string in "data", we'll just send empty JSON if not needed
        formData.append("data", JSON.stringify({}));
 
        // Map frontend doc keys to backend MultipartFile parameters
        // Example doc map: { "taxNotice": { uri, name, type }, "bankStatement": ... }
        for (const [key, fileObj] of Object.entries(documents)) {
          if (fileObj && fileObj.uri) {
            formData.append(key, {
              uri: fileObj.uri,
              name: fileObj.name || "document.pdf",
              type: fileObj.mimeType || "application/pdf"
            } as any);
          }
        }
 
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
              resolve(xhr.responseText);
            } else if (xhr.status === 400 && xhr.responseText.includes("already registered")) {
              resolve(xhr.responseText);
            } else {
              reject(new Error("Failed to upload documents: " + xhr.status + " " + xhr.responseText));
            }
        };
 
        xhr.onerror = () => reject(new Error("Network error during document upload"));
        xhr.send(formData);
      } catch (err) {
        reject(err);
      }
    });
  }
};
 
 
