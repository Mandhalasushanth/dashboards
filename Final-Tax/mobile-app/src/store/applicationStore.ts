import { create } from "zustand";
import { applicationService } from "@/modules/applications/services/applicationService";
import { notificationService } from "@/modules/notifications/services/notificationService";
import { getCustomerDrafts } from "@/shared/hooks/useServiceDraft";
import type {
  Application,
  ApplicationDocument,
  ApplicationFormData,
  ChatMessage,
  ChatSender,
  PaymentStatus,
  ServiceCategoryId,
} from "@/types/domain";

import {
  getActiveCustomerMobile,
  getPersistedApplications,
  savePersistedApplications,
  removeDraftRecord,
} from "./applicationStorage";

import {
  draftToApplication,
  getServiceTimeline,
  extractAllApplicationDocuments,
} from "./applicationDraftMappers";
import { logger } from "@/core/logging/logger";
import { getErrorMessage } from "@/core/error-handling/errorMessage";
import { sanitizeMessageText } from "@/modules/applications/utils/chatAttachmentUtils";

import {
  DraftSliceState,
  createDraftSlice,
  initialDraftState,
} from "./applicationDraftSlice";

export * from "./applicationDraftTypes";
export * from "./applicationStorage";
export * from "./applicationDraftMappers";
export * from "./applicationDraftSlice";

export interface ApplicationState extends DraftSliceState {
  applications: Application[];
  isLoading: boolean;
  error: string | null;
  selectedApplicationId: string | null;

  setSelectedApplicationId: (id: string | null) => void;
  setApplications: (apps: Application[]) => void;
  loadApplications: () => Promise<void>;
  addApplication: (app: Application) => void;
  createApplication: (
    serviceId: string,
    serviceName: string,
    category: ServiceCategoryId,
    formData: ApplicationFormData,
    requiredDocs: (string | ApplicationDocument)[],
    paymentAmount: number,
    initialPaymentStatus?: PaymentStatus,
    skipNotification?: boolean,
    customId?: string,
  ) => string;
  uploadDocument: (appId: string, docName: string, fileUri: string) => void;
  addChatMessage: (
    appId: string,
    sender: ChatSender,
    text: string,
    attachment?: { uri: string; url?: string; fileName?: string; fileSize?: number; mimeType?: string },
  ) => void;
  payApplication: (appId: string) => void;
  deleteApplication: (appId: string) => void;
  resetStore: () => void;
}

const timeStamp = (): string =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export const useApplicationStore = create<ApplicationState>((set, get) => ({
  applications: [],
  isLoading: false,
  error: null,
  selectedApplicationId: null,

  ...createDraftSlice<ApplicationState>(set),

  resetStore: () =>
    set({
      applications: [],
      selectedApplicationId: null,
      error: null,
      ...initialDraftState,
    }),

  setSelectedApplicationId: (id) => set({ selectedApplicationId: id }),

  setApplications: (apps) => {
    set({ applications: apps });
    savePersistedApplications(getActiveCustomerMobile(), apps);
  },

  loadApplications: async () => {
    set({ isLoading: true, error: null });
    const cleanMobile = getActiveCustomerMobile();
    try {
      const [remoteResult, draftsResult, persistedResult] = await Promise.allSettled([
        applicationService.getApplications(),
        getCustomerDrafts(cleanMobile),
        getPersistedApplications(cleanMobile),
      ]);

      const customerDrafts = draftsResult.status === "fulfilled" ? draftsResult.value : [];
      const localPersistedApps = persistedResult.status === "fulfilled" ? persistedResult.value : [];
      let remoteApps: Application[] = [];
      let remoteError: string | null = null;

      if (remoteResult.status === "fulfilled") {
        remoteApps = remoteResult.value;
        remoteError = null;
      } else {
        const reason = remoteResult.reason;
        const errMsg = getErrorMessage(reason) || "";
        const isNotFound =
          errMsg.includes("404") ||
          errMsg.toLowerCase().includes("not found") ||
          errMsg.toLowerCase().includes("no applications") ||
          errMsg.toLowerCase().includes("no static resource");

        if (isNotFound) {
          remoteApps = [];
          remoteError = null;
        } else {
          remoteError = errMsg || "Failed to load applications. Please try again.";
          logger.warn("[ApplicationStore] Remote applications request failed", { error: remoteError });
        }
      }

      // Reconcile applications: Keep local submitted applications so freshly submitted
      // or offline applications are never wiped out while backend applications load.
      const submittedMap = new Map<string, Application>();

      // 1. Seed with locally persisted submitted applications
      localPersistedApps.forEach((app) => {
        if (app && app.id && app.status !== "Draft") {
          submittedMap.set(app.id, app);
        }
      });

      // 2. Preserve in-memory applications that were just submitted
      const currentApps = get().applications || [];
      currentApps.forEach((app) => {
        if (app && app.id && app.status !== "Draft") {
          submittedMap.set(app.id, app);
        }
      });

      // 3. Overwrite with fresh remote applications from backend (backend is authoritative)
      remoteApps.forEach((app) => {
        if (app && app.id) {
          submittedMap.set(app.id, app);
          if (app.formData?.applicationId && app.formData.applicationId !== app.id) {
            submittedMap.delete(app.formData.applicationId);
          }
        }
      });

      const submittedServiceIds = new Set(
        Array.from(submittedMap.values())
          .filter((a) => a.status !== "Draft")
          .map((a) => a.serviceId)
      );

      const draftApplications: Application[] = customerDrafts
        .map((draft) => draftToApplication(draft as Record<string, unknown>, cleanMobile))
        .filter((draftApp) => !submittedServiceIds.has(draftApp.serviceId));

      const combinedApps = [...Array.from(submittedMap.values()), ...draftApplications].map((app) => ({
        ...app,
        documents: extractAllApplicationDocuments(app, app.documents),
      }));

      // Update in-memory store
      set({ applications: combinedApps, isLoading: false, error: combinedApps.length > 0 ? null : remoteError });
      savePersistedApplications(cleanMobile, Array.from(submittedMap.values()));
    } catch (err: unknown) {
      const localApps = await getPersistedApplications(cleanMobile);
      const customerDrafts = await getCustomerDrafts(cleanMobile).catch(() => []);
      const draftApplications = customerDrafts.map((d) => draftToApplication(d as Record<string, unknown>, cleanMobile));
      const fallbackApps = [...localApps, ...draftApplications].map((app) => ({
        ...app,
        documents: extractAllApplicationDocuments(app, app.documents),
      }));
      const errMsg = err instanceof Error ? err.message : "Failed to load applications. Please try again.";
      set({ applications: fallbackApps, isLoading: false, error: fallbackApps.length > 0 ? null : errMsg });
    }
  },

  createApplication: (
    serviceId, serviceName, category, formData, requiredDocs,
    paymentAmount, initialPaymentStatus, skipNotification, customId,
  ) => {
    const rawFormData = (formData || {}) as Record<string, unknown>;
    const realId =
      (customId ? String(customId).trim() : "") ||
      (rawFormData.arn ? String(rawFormData.arn).trim() : "") ||
      (rawFormData.gstId ? String(rawFormData.gstId).trim() : "") ||
      (rawFormData.createdGstId ? String(rawFormData.createdGstId).trim() : "") ||
      (rawFormData.applicationId ? String(rawFormData.applicationId).trim() : "") ||
      (rawFormData.referenceId ? String(rawFormData.referenceId).trim() : "");

    const appId: string =
      realId || `${category.substring(0, 4).toUpperCase()}-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

    const now = new Date();
    const nowIso = now.toISOString();
    const currentTimeStr = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const newApp: Application = {
      id: appId,
      serviceId,
      serviceName,
      category,
      status: "Submitted",
      progress: 20,
      assignedExecutive: "",
      paymentAmount,
      paymentStatus: initialPaymentStatus || (paymentAmount > 0 ? "Pending" : "Paid"),
      createdAt: nowIso,
      formData: {
        ...formData,
        applicationId: appId,
        submissionDate: (formData as any)?.submissionDate || nowIso,
        submissionTime: (formData as any)?.submissionTime || currentTimeStr,
      },
      documents: extractAllApplicationDocuments(
        { serviceId, formData: formData || {}, documents: [] },
        requiredDocs,
      ),
      timeline: getServiceTimeline(serviceId),
      chatHistory: [],
    };

    set((state) => {
      const remainingApps = state.applications.filter(
        (a) =>
          !(a.status === "Draft" && a.serviceId === serviceId) &&
          a.id !== appId &&
          !(a.formData?.arn && a.formData.arn === appId) &&
          !(a.formData?.gstId && a.formData.gstId === appId) &&
          !(a.formData?.applicationId && a.formData.applicationId === appId),
      );
      const nextApps = [newApp, ...remainingApps];
      savePersistedApplications(getActiveCustomerMobile(), nextApps);
      return { applications: nextApps };
    });

    const cleanMobile = getActiveCustomerMobile();
    if (cleanMobile) removeDraftRecord(cleanMobile, serviceId);

    applicationService.createApplication(newApp).catch((err) => {
      logger.debug("[ApplicationStore] Backend application persistence note", { error: getErrorMessage(err) });
    });

    if (!skipNotification) {
      notificationService.notifyApplicationSubmitted(serviceName, appId);
    }

    return appId;
  },

  addApplication: (newApp) => {
    const normalizedApp: Application = {
      ...newApp,
      documents: extractAllApplicationDocuments(newApp, newApp.documents),
    };
    set((state) => {
      const remaining = state.applications.filter(
        (a) =>
          a.id !== normalizedApp.id &&
          !(normalizedApp.formData?.applicationId && a.id === normalizedApp.formData.applicationId) &&
          !(normalizedApp.formData?.arn && a.formData?.arn === normalizedApp.formData.arn) &&
          !(normalizedApp.formData?.gstId && a.formData?.gstId === normalizedApp.formData.gstId),
      );
      const nextApps = [normalizedApp, ...remaining];
      savePersistedApplications(getActiveCustomerMobile(), nextApps);
      return { applications: nextApps };
    });
    applicationService.createApplication(normalizedApp).catch((err) => {
      logger.debug("[ApplicationStore] Backend persistence note", { error: getErrorMessage(err) });
    });
  },

  uploadDocument: (appId, docName, fileUri) =>
    set((state) => {
      const updatedApplications = state.applications.map((app) => {
        if (app.id !== appId) return app;
        const newDocs = app.documents.map((doc) =>
          doc.name === docName ? { ...doc, status: "Uploaded" as const, fileUri } : doc,
        );
        const uploadedCount = newDocs.filter((d) => d.status === "Uploaded").length;
        const totalDocs = newDocs.length;
        const progress = Math.min(95, Math.round(20 + (uploadedCount / totalDocs) * 50));
        const updated = {
          ...app,
          documents: newDocs,
          progress,
          status: uploadedCount === totalDocs ? ("Verification" as const) : ("Document Collection" as const),
        };
        applicationService.updateApplication(updated).catch((err) => {
          logger.warn("[ApplicationStore] Failed to sync updated document to backend", { error: getErrorMessage(err) });
        });
        return updated;
      });
      savePersistedApplications(getActiveCustomerMobile(), updatedApplications);
      return { applications: updatedApplications };
    }),

  addChatMessage: (appId, sender, text, attachment) => {
    const cleanText = sanitizeMessageText(text);
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sender,
      text: cleanText,
      caption: cleanText || undefined,
      timestamp: timeStamp(),
      imageUrl: attachment?.url || attachment?.uri,
      attachmentUrl: attachment?.url || attachment?.uri,
      attachmentName: attachment?.fileName,
    };
    set((state) => {
      const updatedApps = state.applications.map((app) => {
        if (app.id !== appId) return app;
        const updated = { ...app, chatHistory: [...(app.chatHistory || []), newMessage] };
        applicationService.updateApplication(updated).catch((err) => {
          logger.warn("[ApplicationStore] Failed to sync chat message to backend", { error: getErrorMessage(err) });
        });
        return updated;
      });
      savePersistedApplications(getActiveCustomerMobile(), updatedApps);
      return { applications: updatedApps };
    });
  },

  payApplication: (appId) => {
    let paidAmount = 0;
    let paidServiceName = "";
    set((state) => {
      const updatedApps = state.applications.map((app) => {
        if (app.id !== appId) return app;
        paidAmount = app.paymentAmount;
        paidServiceName = app.serviceName;
        const newTimeline = app.timeline.map((step) =>
          step.title === "Verification" ? { ...step, status: "completed" as const } : step,
        );
        const updated = {
          ...app,
          paymentStatus: "Paid" as const,
          progress: Math.min(100, app.progress + 15),
          timeline: newTimeline,
        };
        applicationService.updateApplication(updated).catch((err) => {
          logger.warn("[ApplicationStore] Failed to update paid application on backend", { error: getErrorMessage(err) });
        });
        return updated;
      });
      savePersistedApplications(getActiveCustomerMobile(), updatedApps);
      return { applications: updatedApps };
    });
    if (paidAmount > 0 || paidServiceName) {
      notificationService.notifyPaymentSuccessful(paidAmount, paidServiceName);
    }
  },

  deleteApplication: (appId) => {
    const cleanMobile = getActiveCustomerMobile();
    if (appId.startsWith("DRAFT-")) {
      removeDraftRecord(cleanMobile, appId.replace("DRAFT-", "").toLowerCase());
    }
    set((state) => {
      const targetApp = state.applications.find((a) => a.id === appId);
      if (targetApp && (targetApp.status === "Draft" || targetApp.id.startsWith("DRAFT-"))) {
        removeDraftRecord(cleanMobile, targetApp.serviceId || appId.replace("DRAFT-", "").toLowerCase());
      }
      const remainingApps = state.applications.filter((a) => a.id !== appId);
      savePersistedApplications(cleanMobile, remainingApps);
      return {
        applications: remainingApps,
        selectedApplicationId: state.selectedApplicationId === appId ? null : state.selectedApplicationId,
      };
    });
  },
}));
